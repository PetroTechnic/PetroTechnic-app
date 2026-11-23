mod data;
mod handlers;
mod models;

use std::{
    net::SocketAddr,
    sync::{Arc, RwLock},
};

use axum::{
    routing::{get, post},
    Router,
};
use tower_http::{
    cors::{Any, CorsLayer},
    trace::TraceLayer,
};

use crate::{
    data::{seed_corridors, seed_products},
    handlers::{create_rfq, get_product, health, list_corridors, list_products, list_rfqs, AppState},
    models::RfqRecord,
};

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let store_path = std::env::var("RFQ_STORE_PATH").unwrap_or_else(|_| "rfqs.json".to_string());
    let initial_rfqs: Vec<RfqRecord> = std::fs::read_to_string(&store_path)
        .ok()
        .and_then(|raw| serde_json::from_str(&raw).ok())
        .unwrap_or_default();

    let state = AppState {
        products: Arc::new(seed_products()),
        corridors: Arc::new(seed_corridors()),
        rfqs: Arc::new(RwLock::new(initial_rfqs)),
        rfq_store_path: Arc::new(store_path),
    };

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/api/health", get(health))
        .route("/api/products", get(list_products))
        .route("/api/products/:slug", get(get_product))
        .route("/api/corridors", get(list_corridors))
        .route("/api/rfq", get(list_rfqs).post(create_rfq))
        .with_state(state)
        .layer(cors)
        .layer(TraceLayer::new_for_http());

    let port: u16 = std::env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(8080);
    let addr = SocketAddr::from(([0, 0, 0, 0], port));

    tracing::info!("PetroTechnics Rust (Axum) API listening on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("failed to bind TCP listener");
    axum::serve(listener, app)
        .await
        .expect("server terminated unexpectedly");
}
