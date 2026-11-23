use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LocalizedText {
    pub en: String,
    pub fa: String,
    pub ar: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProductGrade {
    pub code: String,
    pub application: LocalizedText,
    pub key_metric: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpecRow {
    pub parameter: LocalizedText,
    pub value: String,
    pub unit: String,
    pub method: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Product {
    pub slug: String,
    pub category: String,
    pub short_name: String,
    pub formula: String,
    pub cas_number: String,
    pub hs_code: String,
    pub moq_mt: u32,
    pub name: LocalizedText,
    pub summary: LocalizedText,
    pub loading_ports: Vec<String>,
    pub inspections: Vec<String>,
    pub grades: Vec<ProductGrade>,
    pub specs: Vec<SpecRow>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TradeCorridorSummary {
    pub id: String,
    pub region: LocalizedText,
    pub mode: String,
    pub transit_days: String,
    pub loading_ports: Vec<String>,
    pub commodities: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RfqPayload {
    pub product_slug: String,
    pub product_name: String,
    pub grade: String,
    pub quantity_mt: f64,
    pub destination: String,
    pub incoterm: String,
    pub packaging: String,
    pub inspection: String,
    pub company_name: String,
    pub contact_name: String,
    pub email: String,
    pub phone: String,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RfqRecord {
    pub reference_id: String,
    pub created_at: String,
    pub status: String,
    #[serde(flatten)]
    pub payload: RfqPayload,
}

#[derive(Debug, Deserialize)]
pub struct ProductQuery {
    pub category: Option<String>,
    pub q: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct HealthResponse {
    pub status: &'static str,
    pub service: &'static str,
    pub runtime: &'static str,
    pub timestamp: String,
}

#[derive(Debug, Serialize)]
pub struct ApiError {
    pub error: String,
}
