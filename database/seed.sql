-- ============================================================================
-- FasalWindow Synthetic Demonstration Seed Data
-- DISCLAIMER: All values contained in this script are SYNTHETIC DEMONSTRATION
-- DATA designed for algorithm testing and hackathon demonstration only.
-- They do NOT represent live mandi rates, official government procurement
-- figures, or real-time meteorological observations.
-- ============================================================================

-- Clean existing demo records if re-seeding
TRUNCATE TABLE human_overrides, recommendations, analysis_records, 
               weather_forecasts, transport_cost_observations, 
               mandi_price_observations, mandis, crops RESTART IDENTITY CASCADE;

-- 1. Insert Demonstration Crops
INSERT INTO crops (id, name, commodity_group, standard_moisture_max_pct, harvest_window_typical_days) VALUES
(1, 'Wheat (Sharbati / Lokwan)', 'Cereals', 12.00, 'Rabi (March - April)'),
(2, 'Mustard (Sarson)', 'Oilseeds', 8.00, 'Rabi (February - March)'),
(3, 'Soybean (Yellow)', 'Oilseeds', 10.00, 'Kharif (October - November)'),
(4, 'Gram / Chickpea (Desi Chana)', 'Pulses', 11.00, 'Rabi (March - April)')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Demonstration Mandis (Gwalior-Chambal Region)
INSERT INTO mandis (id, name, district, state, apmc_code, contact_phone, is_active) VALUES
(1, 'Gwalior Laxmiganj Krishi Upaj Mandi', 'Gwalior', 'Madhya Pradesh', 'MP-GWL-01', '+91-751-2420000', TRUE),
(2, 'Dabra Krishi Upaj Mandi', 'Gwalior', 'Madhya Pradesh', 'MP-DBR-02', '+91-752-2550000', TRUE),
(3, 'Morena Mandi Samiti', 'Morena', 'Madhya Pradesh', 'MP-MRN-03', '+91-753-2280000', TRUE),
(4, 'Bhind APMC Mandi', 'Bhind', 'Madhya Pradesh', 'MP-BND-04', '+91-754-2340000', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Synthetic Price Observations (INR/kg)
-- Clearly tagged with is_synthetic = TRUE
INSERT INTO mandi_price_observations (crop_id, mandi_id, min_price_inr_kg, max_price_inr_kg, modal_price_inr_kg, source, is_synthetic) VALUES
-- Wheat (Crop 1)
(1, 1, 23.50, 25.00, 24.25, 'Synthetic Demo APMC Agmarknet Board', TRUE),
(1, 2, 25.00, 27.50, 26.20, 'Synthetic Demo Dabra Grain Trade Quote', TRUE),
(1, 3, 22.80, 24.20, 23.50, 'Synthetic Demo Morena Mandi Portal', TRUE),
(1, 4, 23.00, 24.80, 23.90, 'Synthetic Demo Bhind APMC Daily Feed', TRUE),

-- Mustard (Crop 2)
(2, 1, 51.00, 54.00, 52.50, 'Synthetic Demo APMC Agmarknet Board', TRUE),
(2, 2, 53.00, 56.50, 55.00, 'Synthetic Demo Dabra Oilseeds Quote', TRUE),
(2, 3, 54.50, 58.00, 56.80, 'Synthetic Demo Morena Mustard Hub', TRUE),
(2, 4, 52.00, 55.00, 53.50, 'Synthetic Demo Bhind APMC Daily Feed', TRUE),

-- Soybean (Crop 3)
(3, 1, 42.00, 45.00, 43.50, 'Synthetic Demo APMC Agmarknet Board', TRUE),
(3, 2, 43.50, 46.80, 45.00, 'Synthetic Demo Dabra Soya Trade Quote', TRUE),
(3, 3, 41.50, 44.00, 42.80, 'Synthetic Demo Morena Mandi Portal', TRUE),
(3, 4, 42.50, 45.20, 43.90, 'Synthetic Demo Bhind APMC Daily Feed', TRUE),

-- Gram / Chana (Crop 4)
(4, 1, 56.00, 59.50, 58.00, 'Synthetic Demo APMC Agmarknet Board', TRUE),
(4, 2, 57.50, 61.00, 59.20, 'Synthetic Demo Dabra Pulses Quote', TRUE),
(4, 3, 55.00, 58.20, 56.80, 'Synthetic Demo Morena Mandi Portal', TRUE),
(4, 4, 56.20, 59.00, 57.50, 'Synthetic Demo Bhind APMC Daily Feed', TRUE);

-- 4. Insert Synthetic Transport Benchmarks from Cluster "Piproli Village (Gwalior Rural)"
INSERT INTO transport_cost_observations (from_village, to_mandi_id, distance_km, cost_per_kg_inr, total_trip_benchmark_inr, vehicle_type, is_synthetic) VALUES
('Piproli Village, Gwalior', 1, 14.5, 1.20, 1200.00, 'Tractor Trolley (40 Quintal)', TRUE),
('Piproli Village, Gwalior', 2, 38.0, 2.80, 2800.00, 'Tractor Trolley (40 Quintal)', TRUE),
('Piproli Village, Gwalior', 3, 44.0, 3.20, 3200.00, 'Tractor Trolley (40 Quintal)', TRUE),
('Piproli Village, Gwalior', 4, 62.0, 4.50, 4500.00, 'Commercial 407 Tempo', TRUE);

-- 5. Insert Synthetic Weather Forecasts for Gwalior-Chambal Region
INSERT INTO weather_forecasts (district, window_hours, expected_rainfall_mm, risk_level, source, is_synthetic) VALUES
('Gwalior', 36, 3.5, 'MODERATE_RISK', 'Synthetic IMD Agro Bulletin - Gwalior Centre', TRUE),
('Morena', 36, 12.0, 'HIGH_RISK', 'Synthetic IMD Agro Bulletin - Morena Centre', TRUE),
('Bhind', 36, 0.5, 'LOW_RISK', 'Synthetic IMD Agro Bulletin - Bhind Centre', TRUE);

-- Reset sequence IDs
SELECT setval('crops_id_seq', (SELECT MAX(id) FROM crops));
SELECT setval('mandis_id_seq', (SELECT MAX(id) FROM mandis));
