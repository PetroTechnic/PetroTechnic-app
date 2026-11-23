use std::sync::{Arc, RwLock};

use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json,
};
use chrono::Utc;
use uuid::Uuid;

use crate::models::{
    ApiError, HealthResponse, Product, ProductQuery, RfqPayload, RfqRecord, TradeCorridorSummary,
};

#[derive(Clone)]
pub struct AppState {
    pub products: Arc<Vec<Product>>,
    pub corridors: Arc<Vec<TradeCorridorSummary>>,
    pub rfqs: Arc<RwLock<Vec<RfqRecord>>>,
    pub rfq_store_path: Arc<String>,
}

const VALID_INCOTERMS: [&str; 6] = ["FOB", "CFR", "CIF", "FCA", "CPT", "DAP"];

pub async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok",
        service: "petrotechnics-api",
        runtime: "rust-axum",
        timestamp: Utc::now().to_rfc3339(),
    })
}

pub async fn list_products(
    State(state): State<AppState>,
    Query(params): Query<ProductQuery>,
) -> Json<Vec<Product>> {
    let category = params.category.unwrap_or_default().to_lowercase();
    let q = params.q.unwrap_or_default().to_lowercase();

    let filtered: Vec<Product> = state
        .products
        .iter()
        .filter(|p| {
            let cat_ok = category.is_empty() || category == "all" || p.category == category;
            let query_ok = q.is_empty()
                || p.name.en.to_lowercase().contains(&q)
                || p.name.fa.to_lowercase().contains(&q)
                || p.name.ar.to_lowercase().contains(&q)
                || p.short_name.to_lowercase().contains(&q)
                || p.cas_number.to_lowercase().contains(&q)
                || p.grades.iter().any(|g| g.code.to_lowercase().contains(&q));
            cat_ok && query_ok
        })
        .cloned()
        .collect();

    Json(filtered)
}

pub async fn get_product(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> Result<Json<Product>, (StatusCode, Json<ApiError>)> {
    state
        .products
        .iter()
        .find(|p| p.slug == slug)
        .cloned()
        .map(Json)
        .ok_or_else(|| {
            (
                StatusCode::NOT_FOUND,
                Json(ApiError {
                    error: format!("Product '{}' not found", slug),
                }),
            )
        })
}

pub async fn list_corridors(State(state): State<AppState>) -> Json<Vec<TradeCorridorSummary>> {
    Json((*state.corridors).clone())
}

pub async fn list_rfqs(State(state): State<AppState>) -> Json<Vec<RfqRecord>> {
    let guard = state.rfqs.read().expect("RFQ lock poisoned");
    Json(guard.clone())
}

pub async fn create_rfq(
    State(state): State<AppState>,
    Json(payload): Json<RfqPayload>,
) -> Result<(StatusCode, Json<RfqRecord>), (StatusCode, Json<ApiError>)> {
    if payload.product_name.trim().is_empty()
        || payload.destination.trim().is_empty()
        || payload.company_name.trim().is_empty()
        || payload.contact_name.trim().is_empty()
        || !payload.email.contains('@')
        || payload.quantity_mt <= 0.0
        || !VALID_INCOTERMS.contains(&payload.incoterm.as_str())
    {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ApiError {
                error: "Invalid commercial RFQ fields: ensure valid email, Incoterm 2020, destination, and positive MT tonnage.".into(),
            }),
        ));
    }

    let short_id = Uuid::new_v4().to_string()[..4].to_uppercase();
    let reference_id = format!("PT-RFQ-{}-{}", Utc::now().format("%Y"), short_id);

    let record = RfqRecord {
        reference_id,
        created_at: Utc::now().to_rfc3339(),
        status: "received".into(),
        payload,
    };

    {
        let mut guard = state.rfqs.write().expect("RFQ lock poisoned");
        guard.insert(0, record.clone());
        if let Ok(serialized) = serde_json::to_string_pretty(&*guard) {
            let _ = std::fs::write(&*state.rfq_store_path, serialized);
        }
    }

    Ok((StatusCode::CREATED, Json(record)))
}
