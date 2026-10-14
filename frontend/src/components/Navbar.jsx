import React from 'react';
import { Sprout, Wifi, WifiOff, Database, Server, RefreshCw } from 'lucide-react';

export default function Navbar({ systemStatus, onSelectScenario, isOfflineMode, onToggleOfflineMode }) {
  return (
    <header style={{
      background: 'var(--agri-dark)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      color: '#ffffff',
      padding: '0.85rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-md)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--agri-emerald) 0%, var(--harvest-gold) 100%)',
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}>
            <Sprout size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>FasalWindow</span>
              <span style={{
                background: 'var(--harvest-gold)',
                color: '#ffffff',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.1rem 0.45rem',
                borderRadius: '4px',
                textTransform: 'uppercase'
              }}>36h Co-Pilot</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#a3b899' }}>फ़सलविंडो — कटाई एवं मंडी विक्रय निर्णय प्रणाली</p>
          </div>
        </div>

        {/* Quick Demo Scenarios for Evaluators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Demo Scenarios:</span>
          <button
            onClick={() => onSelectScenario('scenario1')}
            className="btn btn-sm btn-outline"
            style={{ color: '#ffffff', borderColor: '#40916c', fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
            title="Demonstrates higher quoted price at distant mandi yielding lower net realization after transport cost"
          >
            1: Price vs Transport
          </button>
          <button
            onClick={() => onSelectScenario('scenario2')}
            className="btn btn-sm btn-outline"
            style={{ color: '#ffffff', borderColor: '#e76f51', fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
            title="Demonstrates heavy rain risk triggering closer mandi recommendation to prevent spoilage"
          >
            2: Heavy Rain Risk
          </button>
          <button
            onClick={() => onSelectScenario('scenario3')}
            className="btn btn-sm btn-outline"
            style={{ color: '#ffffff', borderColor: '#e9c46a', fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
            title="Demonstrates conflicting market quotations with preserved spread"
          >
            3: Disagreeing Quotes
          </button>
          <button
            onClick={() => onSelectScenario('scenario4')}
            className="btn btn-sm btn-outline"
            style={{ color: '#ffffff', borderColor: '#d8f3dc', fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
            title="Demonstrates missing weather fallback to price-only analysis"
          >
            4: Missing Weather
          </button>
        </div>

        {/* System Health Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Offline simulator toggle */}
          <button
            onClick={onToggleOfflineMode}
            className="btn btn-sm"
            style={{
              background: isOfflineMode ? '#d90429' : 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              fontSize: '0.75rem',
              padding: '0.25rem 0.6rem'
            }}
            title="Toggle simulated offline connectivity"
          >
            {isOfflineMode ? <WifiOff size={14} /> : <Wifi size={14} />}
            <span>{isOfflineMode ? 'Simulated Offline' : 'Online'}</span>
          </button>

          {/* Backend Health Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#cbd5e1' }} title="Express REST Gateway">
            <Server size={14} color={systemStatus.backend === 'ok' ? '#52b788' : '#e76f51'} />
            <span>API</span>
          </div>

          {/* FastAPI Health Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#cbd5e1' }} title="Python FastAPI Analytical Engine">
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: systemStatus.fastapi === 'healthy' ? '#52b788' : '#e76f51'
            }} />
            <span>FastAPI (ML)</span>
          </div>

          {/* PostgreSQL Health Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#cbd5e1' }} title="PostgreSQL Database Status">
            <Database size={14} color={systemStatus.database ? '#52b788' : '#e9c46a'} />
            <span>{systemStatus.database ? 'PostgreSQL' : 'In-Memory DB'}</span>
          </div>
        </div>

      </div>
    </header>
  );
}
