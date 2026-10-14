import React, { useState } from 'react';
import { Sparkles, Plus, Trash2, CloudRain, Truck, Store, MapPin, Scale } from 'lucide-react';

export default function HarvestInputForm({
  crops,
  mandis,
  formData,
  setFormData,
  onSubmit,
  isLoading
}) {
  const [includeWeather, setIncludeWeather] = useState(true);

  const handleMandiChange = (index, field, value) => {
    const updated = [...formData.mandi_quotes];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, mandi_quotes: updated });
  };

  const handlePriceModeToggle = (index) => {
    const updated = [...formData.mandi_quotes];
    const curr = updated[index];
    if (curr.is_range) {
      // Switch to single
      updated[index] = {
        ...curr,
        is_range: false,
        gross_price_per_kg: curr.gross_price_range ? curr.gross_price_range[0] : 24.0,
        gross_price_range: null
      };
    } else {
      // Switch to range
      const base = curr.gross_price_per_kg || 24.0;
      updated[index] = {
        ...curr,
        is_range: true,
        gross_price_per_kg: null,
        gross_price_range: [base, Math.round((base + 2.5) * 10) / 10]
      };
    }
    setFormData({ ...formData, mandi_quotes: updated });
  };

  const addMandi = () => {
    if (formData.mandi_quotes.length >= 4) return;
    const newMandi = {
      mandi_name: `Mandi ${formData.mandi_quotes.length + 1}`,
      distance_km: 25.0,
      gross_price_per_kg: 24.5,
      is_range: false,
      gross_price_range: null,
      transport_cost_per_kg: 2.0,
      quote_source: 'APMC Agmarknet',
      quote_timestamp: 'Today morning'
    };
    setFormData({ ...formData, mandi_quotes: [...formData.mandi_quotes, newMandi] });
  };

  const removeMandi = (index) => {
    if (formData.mandi_quotes.length <= 1) return;
    const updated = formData.mandi_quotes.filter((_, i) => i !== index);
    setFormData({ ...formData, mandi_quotes: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      rainfall_forecast: includeWeather ? formData.rainfall_forecast : null
    };
    onSubmit(payload);
  };

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--agri-dark)' }}>
            Harvest & Market Parameters
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Enter crop lot details, verified mandi quotes, haulage terms, and short-term rainfall estimates.
          </p>
        </div>
        <span className="badge badge-low" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Sparkles size={12} />
          <span>Offline Ready</span>
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* Section 1: Basic Crop & Location */}
        <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
          
          <div className="form-group">
            <label className="form-label">Crop Selection</label>
            <select
              className="form-select"
              value={formData.crop_name}
              onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
              required
            >
              {crops.map((c) => (
                <option key={c.id || c.name} value={c.name}>
                  {c.name} (Max {c.standard_moisture_max_pct || 12}% moisture)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Village / Origin Cluster</label>
            <input
              type="text"
              className="form-input"
              value={formData.village}
              onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              placeholder="e.g. Piproli Village, Gwalior"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Harvest Decision Window</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[24, 36, 48].map((hours) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => setFormData({ ...formData, decision_window_hours: hours })}
                  className={`btn btn-sm ${formData.decision_window_hours === hours ? 'btn-primary' : 'btn-outline'}`}
                  style={{ flex: 1, padding: '0.55rem' }}
                >
                  {hours} Hours
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Quantity Lot */}
        <div className="grid-2" style={{ marginBottom: '1.5rem', background: 'var(--bg-page)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Scale size={14} />
              <span>Total Lot Quantity (kg)</span>
            </label>
            <input
              type="number"
              className="form-input"
              value={formData.quantity_kg || ''}
              onChange={(e) => setFormData({ ...formData, quantity_kg: parseFloat(e.target.value) || null })}
              placeholder="e.g. 2500 kg (25 Quintals)"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Supplying lot weight enables exact per-kg conversion when haulage contracts are priced per tractor trip.
          </div>
        </div>

        {/* Section 2: Mandi Quotes & Transport Inputs */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--agri-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Store size={16} />
              <span>Mandi Quotations & Haulage Costs ({formData.mandi_quotes.length})</span>
            </h3>
            {formData.mandi_quotes.length < 3 && (
              <button
                type="button"
                onClick={addMandi}
                className="btn btn-sm btn-outline"
                style={{ fontSize: '0.75rem', gap: '0.25rem' }}
              >
                <Plus size={13} />
                <span>Add Mandi</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {formData.mandi_quotes.map((mandi, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--agri-dark)' }}>
                    Option {idx + 1}: {mandi.mandi_name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => handlePriceModeToggle(idx)}
                      style={{
                        background: 'none',
                        border: '1px solid var(--border-strong)',
                        borderRadius: '4px',
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.725rem',
                        cursor: 'pointer',
                        color: 'var(--agri-primary)'
                      }}
                    >
                      {mandi.is_range ? 'Mode: Price Range [Min-Max]' : 'Mode: Single Price'}
                    </button>
                    {formData.mandi_quotes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMandi(idx)}
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                        title="Remove mandi"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label">Mandi Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={mandi.mandi_name}
                      onChange={(e) => handleMandiChange(idx, 'mandi_name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label">Distance (km)</label>
                    <input
                      type="number"
                      step="0.5"
                      className="form-input"
                      value={mandi.distance_km}
                      onChange={(e) => handleMandiChange(idx, 'distance_km', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label">
                      {mandi.is_range ? 'Gross Price Range (₹/kg)' : 'Gross Price (₹/kg)'}
                    </label>
                    {mandi.is_range ? (
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Min"
                          className="form-input"
                          value={mandi.gross_price_range ? mandi.gross_price_range[0] : 23.0}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const maxVal = mandi.gross_price_range ? mandi.gross_price_range[1] : val + 2;
                            handleMandiChange(idx, 'gross_price_range', [val, maxVal]);
                          }}
                        />
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Max"
                          className="form-input"
                          value={mandi.gross_price_range ? mandi.gross_price_range[1] : 26.0}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const minVal = mandi.gross_price_range ? mandi.gross_price_range[0] : val - 2;
                            handleMandiChange(idx, 'gross_price_range', [minVal, val]);
                          }}
                        />
                      </div>
                    ) : (
                      <input
                        type="number"
                        step="0.1"
                        className="form-input"
                        value={mandi.gross_price_per_kg ?? 24.5}
                        onChange={(e) => handleMandiChange(idx, 'gross_price_per_kg', parseFloat(e.target.value) || 0)}
                      />
                    )}
                  </div>
                </div>

                <div className="grid-3" style={{ marginTop: '0.5rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Transport Rate (₹/kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={mandi.transport_cost_per_kg ?? 1.5}
                      onChange={(e) => handleMandiChange(idx, 'transport_cost_per_kg', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Quote Source</label>
                    <input
                      type="text"
                      className="form-input"
                      value={mandi.quote_source || 'APMC Agmarknet'}
                      onChange={(e) => handleMandiChange(idx, 'quote_source', e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Freshness Timestamp</label>
                    <input
                      type="text"
                      className="form-input"
                      value={mandi.quote_timestamp || 'Today morning'}
                      onChange={(e) => handleMandiChange(idx, 'quote_timestamp', e.target.value)}
                    />
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Rainfall Forecast Input */}
        <div style={{
          marginBottom: '1.75rem',
          background: includeWeather ? '#f0f9ff' : '#f8fafc',
          border: '1px solid #bae6fd',
          borderRadius: 'var(--radius-md)',
          padding: '1.15rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CloudRain size={18} color="#0284c7" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0369a1' }}>
                Short-Term Rainfall Forecast ({formData.decision_window_hours}h Window)
              </h3>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer', color: '#0c4a6e' }}>
              <input
                type="checkbox"
                checked={includeWeather}
                onChange={(e) => setIncludeWeather(e.target.checked)}
              />
              <span>Include weather assessment in analysis</span>
            </label>
          </div>

          {includeWeather ? (
            <div className="grid-3">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ color: '#0369a1' }}>Expected Rainfall (mm)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={formData.rainfall_forecast?.expected_rainfall_mm ?? 3.5}
                  onChange={(e) => setFormData({
                    ...formData,
                    rainfall_forecast: {
                      ...formData.rainfall_forecast,
                      expected_rainfall_mm: parseFloat(e.target.value) || 0
                    }
                  })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ color: '#0369a1' }}>Weather Provider / Station</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.rainfall_forecast?.forecast_source || 'IMD Agro Advisory (Synthetic Demo)'}
                  onChange={(e) => setFormData({
                    ...formData,
                    rainfall_forecast: {
                      ...formData.rainfall_forecast,
                      forecast_source: e.target.value
                    }
                  })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ color: '#0369a1' }}>Forecast Age / Freshness</label>
                <select
                  className="form-select"
                  value={formData.rainfall_forecast?.forecast_timestamp || 'fresh'}
                  onChange={(e) => setFormData({
                    ...formData,
                    rainfall_forecast: {
                      ...formData.rainfall_forecast,
                      forecast_timestamp: e.target.value === 'stale' ? '2026-10-13T06:00:00Z' : new Date().toISOString()
                    }
                  })}
                >
                  <option value="fresh">Fresh (Issued Today &lt;6h ago)</option>
                  <option value="stale">Stale (&gt;18h ago - triggers uncertainty alert)</option>
                </select>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.825rem', color: '#64748b' }}>
              Weather assessment disabled. The co-pilot will execute in <strong>price-only fallback mode</strong> with transparent uncertainty warnings.
            </div>
          )}
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.85rem', fontSize: '1.05rem', boxShadow: 'var(--shadow-md)' }}
        >
          {isLoading ? (
            <span>Processing Decision Analytics...</span>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Analyse 36-Hour Harvest & Selling Options</span>
            </>
          )}
        </button>

      </form>
    </div>
  );
}
