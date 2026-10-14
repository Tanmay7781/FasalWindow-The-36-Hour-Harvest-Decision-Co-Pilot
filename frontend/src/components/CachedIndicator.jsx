import React from 'react';
import { Database, AlertCircle, RefreshCw } from 'lucide-react';

export default function CachedIndicator({ cachedAt, onRefresh, cacheReason }) {
  const formattedTime = cachedAt ? new Date(cachedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Earlier session';
  const formattedDate = cachedAt ? new Date(cachedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  return (
    <div style={{
      background: '#eff6ff',
      border: '1px solid #bfdbfe',
      borderRadius: 'var(--radius-md)',
      padding: '0.85rem 1.25rem',
      marginBottom: '1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '0.75rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          background: '#1d4ed8',
          color: '#ffffff',
          padding: '0.4rem',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Database size={16} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '0.9rem' }}>
              OFFLINE / CACHED ANALYSIS DISPLAYED
            </span>
            <span className="badge badge-cached" style={{ fontSize: '0.65rem' }}>
              NOT LIVE DATA
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#1e40af', marginTop: '0.15rem' }}>
            Generated at <strong>{formattedTime} ({formattedDate})</strong>. 
            {cacheReason ? ` ${cacheReason}` : ' Preserved from previous successful advisory run.'}
          </p>
        </div>
      </div>

      <button
        onClick={onRefresh}
        className="btn btn-sm btn-outline"
        style={{ borderColor: '#3b82f6', color: '#1d4ed8', background: '#ffffff', fontSize: '0.8rem' }}
      >
        <RefreshCw size={14} />
        <span>Try Re-syncing</span>
      </button>
    </div>
  );
}
