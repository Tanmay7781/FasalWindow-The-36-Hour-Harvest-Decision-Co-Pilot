# FasalWindow REST API Documentation

This document specifies the REST API contracts for both the **Express.js API Gateway** (Port 5000) and the **Python FastAPI Analytical Engine** (Port 8001).

---

## 1. Express API Gateway (`http://localhost:5000/api`)

The Express backend serves as the secure interface for the React frontend, orchestrating analytical calls, input validation, and PostgreSQL persistence.

### 1.1 `GET /api/health`
Checks backend gateway status, Python FastAPI analytical engine reachability, and PostgreSQL database connectivity.

**Response `200 OK`:**
```json
{
  "status": "ok",
  "service": "fasalwindow-express-backend",
  "timestamp": "2026-10-14T17:42:00.000Z",
  "fastapi_service": {
    "status": "healthy",
    "service": "fasalwindow-ml-analytics",
    "version": "1.0.0"
  },
  "database_connected": true,
  "environment": "development"
}
```

---

### 1.2 `GET /api/crops`
Returns supported crop varieties with standard moisture thresholds and harvest seasons.

**Response `200 OK`:**
```json
{
  "success": true,
  "source": "postgresql",
  "is_synthetic": true,
  "data": [
    {
      "id": 1,
      "name": "Wheat (Sharbati / Lokwan)",
      "commodity_group": "Cereals",
      "standard_moisture_max_pct": 12.00,
      "harvest_window_typical_days": "Rabi (March - April)"
    }
  ]
}
```

---

### 1.3 `GET /api/mandis`
Returns regional mandis with district information and benchmark haulage distances.

**Response `200 OK`:**
```json
{
  "success": true,
  "source": "postgresql",
  "is_synthetic": true,
  "data": [
    {
      "id": 1,
      "name": "Gwalior Laxmiganj Krishi Upaj Mandi",
      "district": "Gwalior",
      "state": "Madhya Pradesh",
      "apmc_code": "MP-GWL-01"
    }
  ]
}
```

---

### 1.4 `POST /api/analyze`
Submits crop harvest lot parameters and mandi quotes for net realization and rainfall risk analysis.

**Request Body (`application/json`):**
```json
{
  "crop_name": "Wheat (Sharbati / Lokwan)",
  "village": "Piproli Village, Gwalior",
  "decision_window_hours": 36,
  "quantity_kg": 2500,
  "mandi_quotes": [
    {
      "mandi_name": "Gwalior Laxmiganj APMC",
      "distance_km": 14.5,
      "gross_price_per_kg": 24.50,
      "transport_cost_per_kg": 1.20,
      "quote_source": "APMC Daily Board",
      "quote_timestamp": "Today morning"
    },
    {
      "mandi_name": "Dabra Krishi Mandi",
      "distance_km": 38.0,
      "gross_price_range": [26.00, 27.50],
      "transport_cost_per_kg": 2.80,
      "quote_source": "Dabra Trade Commission Quote",
      "quote_timestamp": "Today morning"
    }
  ],
  "rainfall_forecast": {
    "expected_rainfall_mm": 3.5,
    "window_hours": 36,
    "forecast_source": "IMD Agro Advisory Bulletin",
    "forecast_timestamp": "2026-10-14T06:00:00Z"
  },
  "actor_id": "Farmer Self"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "analysis": {
    "analysis_id": "550e8400-e29b-41d4-a716-446655440000",
    "analysis_timestamp": "2026-10-14T17:45:00.000Z",
    "crop_name": "Wheat (Sharbati / Lokwan)",
    "village": "Piproli Village, Gwalior",
    "decision_window_hours": 36,
    "quantity_kg": 2500,
    "mandi_options": [
      {
        "mandi_name": "Gwalior Laxmiganj APMC",
        "distance_km": 14.5,
        "gross_price_display": "₹24.50/kg",
        "gross_min": 24.5,
        "gross_max": 24.5,
        "transport_cost_per_kg": 1.2,
        "transport_cost_display": "₹1.20/kg",
        "net_realization_display": "₹23.30/kg",
        "net_min": 23.3,
        "net_max": 23.3,
        "net_representative": 23.3,
        "is_range": false,
        "quote_freshness_status": "FRESH"
      }
    ],
    "rainfall_assessment": {
      "status": "MODERATE_RISK",
      "label": "Showers Expected (Moderate Moisture Risk)",
      "rainfall_amount_mm": 3.5,
      "window_hours": 36,
      "is_stale": false,
      "is_missing": false,
      "advice": "Cover trolley with waterproof tarpaulin (tirpal) during transport."
    },
    "tradeoff_summary": "Gwalior Laxmiganj APMC offers the strongest net realization after haulage...",
    "warnings": [],
    "bilingual_brief": {
      "hi": { "headline": "...", "primary_recommendation": "..." },
      "en": { "headline": "...", "primary_recommendation": "..." }
    },
    "is_demo_data": true,
    "synthetic_data_disclaimer": "DEMO NOTICE: All rates are synthetic demonstration inputs.",
    "farmer_autonomy_disclaimer": "Advisory only. The farmer retains full autonomy."
  },
  "meta": {
    "persisted_to_db": true,
    "engine": "FastAPI / Python analytical service"
  }
}
```

---

### 1.5 `POST /api/overrides`
Records a human decision override with a mandatory agronomic reason.

**Request Body (`application/json`):**
```json
{
  "analysis_id": "550e8400-e29b-41d4-a716-446655440000",
  "original_recommended_mandi": "Gwalior Laxmiganj APMC",
  "chosen_mandi": "Dabra Krishi Mandi",
  "override_reason": "Culvert on Gwalior highway has waterlogging; Dabra highway is dry and open.",
  "actor_id": "Ramesh Kumar (FPO Coordinator)"
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "override": {
    "id": 1,
    "analysis_id": "550e8400-e29b-41d4-a716-446655440000",
    "original_recommended_mandi": "Gwalior Laxmiganj APMC",
    "chosen_mandi": "Dabra Krishi Mandi",
    "override_reason": "Culvert on Gwalior highway has waterlogging...",
    "actor_id": "Ramesh Kumar (FPO Coordinator)",
    "created_at": "2026-10-14T17:46:12.000Z"
  },
  "persisted_to_db": true,
  "message": "Human override successfully logged in PostgreSQL audit trail."
}
```

---

## 2. Python FastAPI Analytical Service (`http://127.0.0.1:8001`)

### 2.1 `GET /health`
Returns service vitality, Python version, and service identifier.

### 2.2 `POST /analyze`
Direct computational endpoint called by Express. Validated with Pydantic models.

### 2.3 `POST /price-bands`
Utility endpoint computing net realization intervals given gross price ranges and transport parameters.

### 2.4 `POST /rainfall-risk`
Utility endpoint categorizing rainfall inputs into `LOW_RISK`, `MODERATE_RISK`, `HIGH_RISK`, or `UNKNOWN` with staleness checks.
