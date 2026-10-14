const db = require('../config/db');

// High-fidelity synthetic demonstration catalogue (fallback if database is not yet seeded)
const DEMO_CROPS = [
  { id: 1, name: 'Wheat (Sharbati / Lokwan)', commodity_group: 'Cereals', standard_moisture_max_pct: 12.0, season: 'Rabi' },
  { id: 2, name: 'Mustard (Sarson)', commodity_group: 'Oilseeds', standard_moisture_max_pct: 8.0, season: 'Rabi' },
  { id: 3, name: 'Soybean (Yellow)', commodity_group: 'Oilseeds', standard_moisture_max_pct: 10.0, season: 'Kharif' },
  { id: 4, name: 'Gram / Chickpea (Desi Chana)', commodity_group: 'Pulses', standard_moisture_max_pct: 11.0, season: 'Rabi' }
];

const DEMO_MANDIS = [
  { id: 1, name: 'Gwalior Laxmiganj Krishi Upaj Mandi', district: 'Gwalior', default_distance_km: 14.5, default_transport_rate: 1.20, state: 'Madhya Pradesh' },
  { id: 2, name: 'Dabra Krishi Upaj Mandi', district: 'Gwalior', default_distance_km: 38.0, default_transport_rate: 2.80, state: 'Madhya Pradesh' },
  { id: 3, name: 'Morena Mandi Samiti', district: 'Morena', default_distance_km: 44.0, default_transport_rate: 3.20, state: 'Madhya Pradesh' },
  { id: 4, name: 'Bhind APMC Mandi', district: 'Bhind', default_distance_km: 62.0, default_transport_rate: 4.50, state: 'Madhya Pradesh' }
];

async function getCrops(req, res, next) {
  try {
    if (db.isDbConnected()) {
      const result = await db.query('SELECT id, name, commodity_group, standard_moisture_max_pct, harvest_window_typical_days FROM crops ORDER BY id ASC');
      if (result.rows.length > 0) {
        return res.json({ success: true, source: 'postgresql', data: result.rows, is_synthetic: true });
      }
    }
    return res.json({ success: true, source: 'catalog_fallback', data: DEMO_CROPS, is_synthetic: true });
  } catch (err) {
    return res.json({ success: true, source: 'catalog_fallback', data: DEMO_CROPS, is_synthetic: true, db_note: err.message });
  }
}

async function getMandis(req, res, next) {
  try {
    if (db.isDbConnected()) {
      const result = await db.query('SELECT id, name, district, state, apmc_code, contact_phone FROM mandis ORDER BY id ASC');
      if (result.rows.length > 0) {
        return res.json({ success: true, source: 'postgresql', data: result.rows, is_synthetic: true });
      }
    }
    return res.json({ success: true, source: 'catalog_fallback', data: DEMO_MANDIS, is_synthetic: true });
  } catch (err) {
    return res.json({ success: true, source: 'catalog_fallback', data: DEMO_MANDIS, is_synthetic: true, db_note: err.message });
  }
}

module.exports = {
  getCrops,
  getMandis,
};
