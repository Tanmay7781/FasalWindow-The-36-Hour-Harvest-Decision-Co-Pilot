import React, { useState } from 'react';
import { FileText, CheckSquare, AlertCircle, HelpCircle, Users, Check } from 'lucide-react';

export default function DecisionBrief({ brief, cropName, village }) {
  const [activeLang, setActiveLang] = useState('hi'); // Default to Hindi for farmer accessibility

  if (!brief) return null;

  const current = activeLang === 'hi' ? brief.hi : brief.en;
  const isHindi = activeLang === 'hi';

  return (
    <div className="card animate-fade-in" style={{ marginBottom: '2rem', padding: '1.75rem' }}>
      
      {/* Header with Language Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            background: 'var(--agri-light-mint)',
            color: 'var(--agri-primary)',
            padding: '0.5rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileText size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--agri-dark)' }}>
              {isHindi ? '36-घंटे का कटाई एवं विक्रय निर्णय पत्र' : '36-Hour Harvest & Selling Decision Brief'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {isHindi ? 'FPO विस्तार कार्यकर्ता एवं किसान भाई के लिए परामर्श' : 'Actionable co-pilot summary for farmers and FPO extension workers'}
            </p>
          </div>
        </div>

        {/* Language Switcher */}
        <div style={{
          background: 'var(--agri-soft-bg)',
          padding: '0.25rem',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          gap: '0.25rem',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => setActiveLang('hi')}
            className={`tab-button ${activeLang === 'hi' ? 'active' : ''}`}
            style={{ fontSize: '0.85rem' }}
          >
            हिंदी (Hindi)
          </button>
          <button
            onClick={() => setActiveLang('en')}
            className={`tab-button ${activeLang === 'en' ? 'active' : ''}`}
            style={{ fontSize: '0.85rem' }}
          >
            English
          </button>
        </div>
      </div>

      <div className={isHindi ? 'font-hindi' : ''}>
        
        {/* Headline & Primary Recommendation Banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--agri-primary) 0%, var(--agri-emerald) 100%)',
          color: '#ffffff',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          marginBottom: '1.25rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--harvest-sun)' }}>
            {current.headline}
          </h3>
          <p style={{ fontSize: '0.925rem', lineHeight: '1.5' }}>
            {current.primary_recommendation}
          </p>
        </div>

        {/* Trade-off Analysis */}
        <div style={{
          background: '#f8fafc',
          borderLeft: '4px solid var(--harvest-gold)',
          padding: '0.85rem 1.15rem',
          borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
          marginBottom: '1.25rem',
          fontSize: '0.9rem',
          color: 'var(--text-main)',
          lineHeight: '1.5'
        }}>
          <strong>{isHindi ? 'व्यापारिक समझ व तुलना:' : 'Key Trade-off:'}</strong> {current.key_tradeoff}
        </div>

        {/* 2-Column Grid: Action Steps & FPO Checklist */}
        <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
          
          {/* Action Steps */}
          <div style={{
            background: 'var(--bg-card-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem'
          }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--agri-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckSquare size={16} />
              <span>{isHindi ? 'किसान के लिए अनुशंसित कदम' : 'Recommended Farmer Action Steps'}</span>
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              {current.action_steps.map((step, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', lineHeight: '1.4' }}>
                  <span style={{ color: 'var(--agri-mint)', marginTop: '2px', flexShrink: 0 }}>
                    <Check size={14} />
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* FPO Extension Worker Verification Checklist */}
          <div style={{
            background: 'var(--bg-card-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem'
          }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0369a1', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Users size={16} />
              <span>{isHindi ? 'FPO / कृषि मित्र सत्यापन चेकलिस्ट' : 'FPO Extension Worker Checklist'}</span>
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              {current.fpo_verification_checklist.map((item, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', lineHeight: '1.4' }}>
                  <span style={{ color: '#0284c7', marginTop: '2px', flexShrink: 0 }}>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Unknowns and Uncertainties */}
        <div style={{
          background: '#fffdf5',
          border: '1px solid #fef08a',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1rem',
          marginBottom: '1.25rem'
        }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#854d0e', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <HelpCircle size={15} />
            <span>{isHindi ? 'अनिश्चितताएं एवं व्यावहारिक सीमाएं' : 'Operational Unknowns & Uncertainties'}</span>
          </h4>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.825rem', color: '#713f12', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {current.unknowns_and_uncertainties.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Farmer Autonomy Disclaimer */}
        <div style={{
          fontSize: '0.775rem',
          color: '#64748b',
          textAlign: 'center',
          fontStyle: 'italic',
          paddingTop: '0.5rem',
          borderTop: '1px dashed var(--border-subtle)'
        }}>
          {current.disclaimer}
        </div>

      </div>
    </div>
  );
}
