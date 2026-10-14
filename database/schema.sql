-- ============================================================================
-- FasalWindow Database Schema (PostgreSQL)
-- Offline-first, Uncertainty-aware Harvest Decision Co-Pilot
-- ============================================================================

-- Ensure uuid-ossp or pgcrypto extension is available if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Crops Master Table
CREATE TABLE IF NOT EXISTS crops (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    commodity_group VARCHAR(50) DEFAULT 'Cereals',
    standard_moisture_max_pct NUMERIC(4, 2) DEFAULT 12.00,
    harvest_window_typical_days VARCHAR(50) DEFAULT 'Rabi (March-April)',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Mandi (Market) Master Table
CREATE TABLE IF NOT EXISTS mandis (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) DEFAULT 'Madhya Pradesh',
    apmc_code VARCHAR(50),
    contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Mandi Price Observations (Demo / Historical)
CREATE TABLE IF NOT EXISTS mandi_price_observations (
    id SERIAL PRIMARY KEY,
    crop_id INT NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
    mandi_id INT NOT NULL REFERENCES mandis(id) ON DELETE CASCADE,
    min_price_inr_kg NUMERIC(6, 2) NOT NULL,
    max_price_inr_kg NUMERIC(6, 2) NOT NULL,
    modal_price_inr_kg NUMERIC(6, 2) NOT NULL,
    source VARCHAR(100) DEFAULT 'Synthetic Demo Agmarknet Feed',
    is_synthetic BOOLEAN DEFAULT TRUE,
    observed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Transportation Cost Observations
CREATE TABLE IF NOT EXISTS transport_cost_observations (
    id SERIAL PRIMARY KEY,
    from_village VARCHAR(120) NOT NULL,
    to_mandi_id INT NOT NULL REFERENCES mandis(id) ON DELETE CASCADE,
    distance_km NUMERIC(5, 1) NOT NULL,
    cost_per_kg_inr NUMERIC(5, 2) NOT NULL,
    total_trip_benchmark_inr NUMERIC(8, 2),
    vehicle_type VARCHAR(50) DEFAULT 'Tractor Trolley (40-50 Quintal)',
    is_synthetic BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Weather Forecasts & Observations
CREATE TABLE IF NOT EXISTS weather_forecasts (
    id SERIAL PRIMARY KEY,
    district VARCHAR(100) NOT NULL,
    window_hours INT NOT NULL DEFAULT 36,
    expected_rainfall_mm NUMERIC(5, 2) NOT NULL,
    risk_level VARCHAR(30) NOT NULL, -- LOW_RISK, MODERATE_RISK, HIGH_RISK
    source VARCHAR(120) DEFAULT 'Synthetic Demo Agro-Weather Advisory',
    forecast_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_synthetic BOOLEAN DEFAULT TRUE
);

-- 6. Analysis Records (Persisted farmer advisory queries)
CREATE TABLE IF NOT EXISTS analysis_records (
    id VARCHAR(64) PRIMARY KEY, -- UUID string from FastAPI
    crop_name VARCHAR(100) NOT NULL,
    village VARCHAR(120) NOT NULL,
    decision_window_hours INT NOT NULL,
    quantity_kg NUMERIC(8, 2),
    recommended_mandi_name VARCHAR(120),
    recommended_net_price NUMERIC(6, 2),
    rainfall_status VARCHAR(30),
    tradeoff_summary TEXT,
    request_payload JSONB,
    response_payload JSONB,
    actor_id VARCHAR(100) DEFAULT 'Farmer Self',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Recommendations Sub-table
CREATE TABLE IF NOT EXISTS recommendations (
    id SERIAL PRIMARY KEY,
    analysis_id VARCHAR(64) NOT NULL REFERENCES analysis_records(id) ON DELETE CASCADE,
    mandi_name VARCHAR(120) NOT NULL,
    rank_order INT NOT NULL,
    distance_km NUMERIC(5, 1),
    gross_price_display VARCHAR(50),
    transport_cost_display VARCHAR(50),
    net_realization_display VARCHAR(50),
    net_representative NUMERIC(6, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Human Overrides & Audit Log
CREATE TABLE IF NOT EXISTS human_overrides (
    id SERIAL PRIMARY KEY,
    analysis_id VARCHAR(64) NOT NULL REFERENCES analysis_records(id) ON DELETE CASCADE,
    original_recommended_mandi VARCHAR(120) NOT NULL,
    chosen_mandi VARCHAR(120) NOT NULL,
    override_reason TEXT NOT NULL,
    actor_id VARCHAR(100) NOT NULL DEFAULT 'Farmer / FPO Extension Worker',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_mandi_prices_crop_mandi ON mandi_price_observations(crop_id, mandi_id);
CREATE INDEX IF NOT EXISTS idx_analysis_created_at ON analysis_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_overrides_analysis_id ON human_overrides(analysis_id);
