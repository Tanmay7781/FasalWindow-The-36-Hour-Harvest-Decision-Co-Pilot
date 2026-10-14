import React from 'react';
import { TrendingUp, Truck, MapPin, CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';

export default function MandiComparison({ options, recommendedOption, onOpenOverride }) {
  if (!options || options.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        No mandi options available to compare. Please run an analysis with at least one mandi quotation.
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--agri-dark)' }}>
            Mandi Quotation & Net Realization Comparison
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Evaluates gross quoted prices against road distance and transportation deductions per kilogram.
          </p>
        </div>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--agri-emerald)' }}>
          Showing {options.length} market options
        </span>
      </div>

      <div className="grid-3">
        {options.map((opt, idx) => {
          const isRecommended = recommendedOption && recommendedOption.mandi_name === opt.mandi_name;

          return (
            <div
              key={idx}
              className="card animate-fade-in"
              style={{
                position: 'relative',
                border: isRecommended ? '2px solid var(--agri-mint)' : '1px solid var(--border-subtle)',
                background: isRecommended ? 'linear-gradient(180deg, #ffffff 0%, #f4faf6 100%)' : '#ffffff',
                boxShadow: isRecommended ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              {/* Recommended Badge */}
              {isRecommended && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '16px',
                  background: 'var(--agri-emerald)',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.65rem',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: '0 2px 6px rgba(45, 106, 79, 0.4)'
                }}>
                  <CheckCircle size={12} />
                  <span>HIGHEST NET REALIZATION</span>
                </div>
              )}

              <div>
                {/* Header: Mandi Name and Distance */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem', marginTop: isRecommended ? '0.25rem' : '0' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: '1.3' }}>
                      {opt.mandi_name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      <MapPin size={13} color="var(--agri-mint)" />
                      <span>{opt.distance_km} km distance</span>
                    </div>
                  </div>
                  <span className={`badge ${opt.quote_freshness_status === 'FRESH' ? 'badge-low' : 'badge-stale'}`}>
                    {opt.quote_freshness_status}
                  </span>
                </div>

                {/* Primary Metric: Net Realization */}
                <div style={{
                  background: isRecommended ? 'rgba(82, 183, 136, 0.12)' : 'var(--bg-page)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  border: isRecommended ? '1px solid rgba(82, 183, 136, 0.25)' : '1px solid var(--border-subtle)'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--agri-primary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                    Estimated Net Realization
                  </div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: isRecommended ? 'var(--agri-primary)' : 'var(--text-main)', letterSpacing: '-0.02em' }}>
                    {opt.net_realization_display}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                    Actual return in pocket after haulage
                  </div>
                </div>

                {/* Breakdown: Gross Price vs Transport */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.35rem', borderBottom: '1px dashed var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <TrendingUp size={14} color="var(--harvest-gold)" />
                      <span>Gross Mandi Price:</span>
                    </span>
                    <strong style={{ color: 'var(--text-main)' }}>{opt.gross_price_display}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.35rem', borderBottom: '1px dashed var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Truck size={14} color="var(--accent-terra)" />
                      <span>Transport Cost:</span>
                    </span>
                    <strong style={{ color: 'var(--accent-terra)' }}>- {opt.transport_cost_display}</strong>
                  </div>
                </div>

                {/* Conflicting Quotes Alert */}
                {opt.conflicts_detected && opt.conflict_note && (
                  <div style={{
                    background: '#fef3c7',
                    border: '1px solid #fde68a',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.5rem 0.65rem',
                    fontSize: '0.75rem',
                    color: '#92400e',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.35rem'
                  }}>
                    <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{opt.conflict_note}</span>
                  </div>
                )}

                {/* Source & Timestamp Metadata */}
                <div style={{ fontSize: '0.725rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1rem' }}>
                  <Clock size={12} />
                  <span>Source: {opt.quote_source || 'APMC Agmarknet'} ({opt.quote_timestamp || 'Today'})</span>
                </div>
              </div>

              {/* Action Button: Override with this option */}
              <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => onOpenOverride(opt)}
                  className="btn btn-sm btn-outline"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.775rem' }}
                >
                  <span>Select for Human Override</span>
                  <ArrowRight size={13} />
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
