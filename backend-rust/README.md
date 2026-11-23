# PetroTechnics Rust (Axum) Backend

Production-ready, asynchronous Rust REST API built with **Axum 0.7**, **Tokio**, **Serde**, and **Tower-HTTP**. It implements exact JSON contract parity with the PetroTechnics web client (`petrotechnic.co`).

## Endpoints

- `GET /api/health` — Service readiness and runtime check
- `GET /api/products?category=&q=` — Filterable petrochemical, polymer, and fertilizer catalog
- `GET /api/products/:slug` — Detailed specification sheet, grades, and ASTM/ISO parameters
- `GET /api/corridors` — Active maritime, Caspian, and overland export corridors
- `GET /api/rfq` — List persisted commercial Request for Quotation records
- `POST /api/rfq` — Validate and persist a new RFQ with generated `PT-RFQ-YYYY-XXXX` reference ID

## Run Locally or in Production

```bash
cd backend-rust
PORT=8080 RFQ_STORE_PATH=./rfqs.json cargo run --release
```

Point the Vite frontend proxy or reverse proxy (Nginx / Caddy) `/api/*` upstream to `http://127.0.0.1:8080`.
