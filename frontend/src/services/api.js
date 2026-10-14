const CACHE_KEY = 'fasalwindow_latest_successful_analysis';
const OVERRIDES_CACHE_KEY = 'fasalwindow_offline_overrides';

export async function fetchHealth() {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return { status: 'down', error: err.message };
  }
}

export async function fetchCrops() {
  try {
    const res = await fetch('/api/crops');
    if (!res.ok) throw new Error('Failed to load crops');
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.warn('Using offline crop presets:', err.message);
    return [
      { id: 1, name: 'Wheat (Sharbati / Lokwan)', commodity_group: 'Cereals', standard_moisture_max_pct: 12.0 },
      { id: 2, name: 'Mustard (Sarson)', commodity_group: 'Oilseeds', standard_moisture_max_pct: 8.0 },
      { id: 3, name: 'Soybean (Yellow)', commodity_group: 'Oilseeds', standard_moisture_max_pct: 10.0 },
      { id: 4, name: 'Gram / Chickpea (Desi Chana)', commodity_group: 'Pulses', standard_moisture_max_pct: 11.0 }
    ];
  }
}

export async function fetchMandis() {
  try {
    const res = await fetch('/api/mandis');
    if (!res.ok) throw new Error('Failed to load mandis');
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.warn('Using offline mandi presets:', err.message);
    return [
      { id: 1, name: 'Gwalior Laxmiganj Krishi Upaj Mandi', district: 'Gwalior', default_distance_km: 14.5, default_transport_rate: 1.20 },
      { id: 2, name: 'Dabra Krishi Upaj Mandi', district: 'Gwalior', default_distance_km: 38.0, default_transport_rate: 2.80 },
      { id: 3, name: 'Morena Mandi Samiti', district: 'Morena', default_distance_km: 44.0, default_transport_rate: 3.20 },
      { id: 4, name: 'Bhind APMC Mandi', district: 'Bhind', default_distance_km: 62.0, default_transport_rate: 4.50 }
    ];
  }
}

export async function submitAnalysis(payload) {
  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const err = new Error(errorData.message || `Server responded with ${res.status}`);
      err.status = res.status;
      err.code = errorData.code;
      throw err;
    }

    const data = await res.json();
    if (data.analysis) {
      // Save successful result to localStorage cache for offline resilience
      saveToLocalCache(data.analysis);
      return {
        ...data.analysis,
        is_cached_fallback: false,
        persisted_to_db: data.meta?.persisted_to_db ?? false
      };
    }
    throw new Error('Malformed analysis response');
  } catch (err) {
    console.warn('[FasalWindow] Live analysis request failed. Checking offline cache:', err.message);
    const cached = getFromLocalCache();
    if (cached) {
      return {
        ...cached,
        is_cached_fallback: true,
        cache_reason: `Live server connection failed (${err.message}). Displaying last verified cached analysis.`
      };
    }
    throw err;
  }
}

export async function submitHumanOverride(overrideData) {
  try {
    const res = await fetch('/api/overrides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(overrideData)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to submit override');
    }

    return await res.json();
  } catch (err) {
    console.warn('[FasalWindow] Live override submission failed. Saving to local queue:', err.message);
    saveOfflineOverride(overrideData);
    return {
      success: true,
      persisted_to_db: false,
      is_offline_queued: true,
      message: 'Network offline. Override saved locally on device and will sync when connected.',
      override: {
        ...overrideData,
        created_at: new Date().toISOString()
      }
    };
  }
}

function saveToLocalCache(analysis) {
  try {
    const cacheRecord = {
      ...analysis,
      cached_at: new Date().toISOString()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheRecord));
  } catch (e) {
    console.error('LocalStorage save error:', e);
  }
}

export function getFromLocalCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function saveOfflineOverride(override) {
  try {
    const existing = JSON.parse(localStorage.getItem(OVERRIDES_CACHE_KEY) || '[]');
    existing.push({ ...override, queued_at: new Date().toISOString() });
    localStorage.setItem(OVERRIDES_CACHE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('LocalStorage override save error:', e);
  }
}

export function getOfflineOverrides() {
  try {
    return JSON.parse(localStorage.getItem(OVERRIDES_CACHE_KEY) || '[]');
  } catch (e) {
    return [];
  }
}
