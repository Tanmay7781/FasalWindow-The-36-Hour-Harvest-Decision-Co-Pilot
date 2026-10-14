import React from 'react';
import { CloudRain, Sun, CloudLightning, HelpCircle, AlertTriangle, Clock, ShieldCheck } from 'lucide-react';

export default function RainfallRiskCard({ rainfall }) {
  if (!rainfall) return null;

  const getRiskDetails = () => {
    switch (rainfall.status) {
      case 'LOW_RISK':
        return {
          icon: <Sun size={24} color="#2d6a4f" />,
          badgeClass: 'badge-low',
          bgGradient: 'linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%)',
          borderColor: '#a5d6a7',
          textColor: '#1b5e20'
        };
      case 'MODERATE_RISK':
        return {
          icon: <CloudRain size={24} color="#b45309" />,
          badgeClass: 'badge-mod',
          bgGradient: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)',
          borderColor: '#fde68a',
          textColor: '#92400e'
        };
      case 'HIGH_RISK':
        return {
          icon: <CloudLightning size={24} color="#b91c1c" />,
          badgeClass: 'badge-high',
          bgGradient: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)',
          borderColor: '#fecaca',
          textColor: '#991b1b'
        };
      default:
        return {
          icon: <HelpCircle size={24} color="#64748b" />,
          badgeClass: 'badge-synthetic',
          bgGradient: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          borderColor: '#cbd5e1',
          textColor: '#334155'
        };
    }
  };

  const details = getRiskDetails();

  return (
    <div
      className="card animate-fade-in"
      style={{
        background: details.bgGradient,
        border: `1px solid ${details.borderColor}`,
        marginBottom: '2rem',
        padding: '1.5rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: '#ffffff',
            padding: '0.65rem',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {details.icon}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: details.textColor }}>
                {rainfall.label}
              </h3>
              {rainfall.is_stale && (
                <span className="badge badge-stale">
                  <AlertTriangle size={11} />
                  <span>Stale Forecast</span>
                </span>
              )}
              {rainfall.is_missing && (
                <span className="badge badge-synthetic">
                  <span>Price-Only Mode</span>
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {rainfall.window_hours || 36}-Hour Moisture & Spoilage Assessment
            </p>
          </div>
        </div>

        {rainfall.rainfall_amount_mm !== null && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: details.textColor }}>
              {rainfall.rainfall_amount_mm.toFixed(1)} mm
            </div>
            <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
              Predicted Precipitation
            </div>
          </div>
        )}
      </div>

      {/* Advisory Guidance */}
      <div style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-md)',
        padding: '1rem 1.15rem',
        border: '1px solid var(--border-subtle)',
        fontSize: '0.9rem',
        color: 'var(--text-main)',
        lineHeight: '1.5',
        marginBottom: '0.75rem'
      }}>
        <strong>Agricultural Advisory:</strong> {rainfall.advice}
      </div>

      {/* Source & Metadata */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <ShieldCheck size={14} color="#2d6a4f" />
          <span>Source: {rainfall.forecast_source || 'Synthetic Agrometeorological Bulletin'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Clock size={13} />
          <span>Forecast Issued: {rainfall.forecast_timestamp ? new Date(rainfall.forecast_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}</span>
        </div>
      </div>
    </div>
  );
}
