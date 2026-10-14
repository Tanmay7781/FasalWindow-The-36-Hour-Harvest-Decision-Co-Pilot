import React from 'react';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';

export default function WarningBanner({ warnings, syntheticDisclaimer, farmerDisclaimer }) {
  const hasWarnings = warnings && warnings.length > 0;

  return (
    <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      
      {/* Explicit Uncertainty & Data Warnings */}
      {hasWarnings && (
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#b45309' }}>
            <AlertTriangle size={18} />
            <span style={{ fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              Operational Warnings & Input Uncertainties ({warnings.length})
            </span>
          </div>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#92400e', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {warnings.map((warn, idx) => (
              <li key={idx} style={{ lineHeight: '1.4' }}>
                {warn}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Synthetic Demonstration Data Notice */}
      <div style={{
        background: '#f8fafc',
        border: '1px dashed #cbd5e1',
        borderRadius: 'var(--radius-md)',
        padding: '0.65rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        fontSize: '0.775rem',
        color: '#64748b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-synthetic">SYNTHETIC DEMO</span>
          <span>{syntheticDisclaimer || 'All mandi rates and weather inputs are synthetic simulation values.'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#475569', fontStyle: 'italic' }}>
          <ShieldAlert size={14} color="#64748b" />
          <span>{farmerDisclaimer || 'Advisory decision-support co-pilot. Farmer retains final autonomy.'}</span>
        </div>
      </div>

    </div>
  );
}
