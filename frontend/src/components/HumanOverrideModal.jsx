import React, { useState } from 'react';
import { UserCheck, X, ShieldAlert, CheckCircle2, History } from 'lucide-react';

export default function HumanOverrideModal({ isOpen, onClose, selectedOption, recommendedOption, analysisId, onSubmitOverride, recentOverrides }) {
  const [chosenMandi, setChosenMandi] = useState(selectedOption?.mandi_name || '');
  const [overrideReason, setOverrideReason] = useState('');
  const [actorId, setActorId] = useState('Extension Worker / Farmer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!overrideReason.trim()) {
      setErrorMsg('A valid reason for the human override is mandatory for audit logging.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        analysis_id: analysisId || 'advisory-manual-run',
        original_recommended_mandi: recommendedOption?.mandi_name || 'System Recommendation',
        chosen_mandi: chosenMandi || selectedOption?.mandi_name,
        override_reason: overrideReason.trim(),
        actor_id: actorId.trim() || 'Extension Worker / Farmer'
      };

      const result = await onSubmitOverride(payload);
      setSubmitSuccess(result);
      setTimeout(() => {
        setSubmitSuccess(null);
        onClose();
      }, 1800);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to persist override.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(10, 31, 22, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="card animate-fade-in" style={{
        maxWidth: '560px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '1.75rem',
        boxShadow: 'var(--shadow-xl)'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              background: '#fef3c7',
              color: '#d97706',
              padding: '0.45rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--agri-dark)' }}>
                Human Decision Override & Audit Log
              </h3>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                Records agricultural field context when overriding algorithmic recommendation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={20} />
          </button>
        </div>

        {submitSuccess ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem 1rem',
            background: '#ecfdf5',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #a7f3d0'
          }}>
            <CheckCircle2 size={40} color="#059669" style={{ margin: '0 auto 0.75rem' }} />
            <h4 style={{ fontWeight: 700, color: '#065f46', fontSize: '1.1rem' }}>
              Override Successfully Logged!
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#047857', marginTop: '0.25rem' }}>
              {submitSuccess.message || 'Audit trail recorded in PostgreSQL database.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            
            {/* System Recommendation Reference */}
            <div style={{
              background: 'var(--bg-page)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              fontSize: '0.85rem'
            }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>System Algorithmic Recommendation:</div>
              <strong style={{ color: 'var(--agri-primary)' }}>
                {recommendedOption?.mandi_name || 'System Choice'} ({recommendedOption?.net_realization_display || ''})
              </strong>
            </div>

            {/* Chosen Mandi Field */}
            <div className="form-group">
              <label className="form-label">Chosen Alternative Mandi:</label>
              <input
                type="text"
                className="form-input"
                value={chosenMandi}
                onChange={(e) => setChosenMandi(e.target.value)}
                required
              />
            </div>

            {/* Actor ID */}
            <div className="form-group">
              <label className="form-label">Actor / Extension Agent Name:</label>
              <input
                type="text"
                className="form-input"
                value={actorId}
                onChange={(e) => setActorId(e.target.value)}
                placeholder="e.g. Ramesh Kumar (FPO Coordinator)"
                required
              />
            </div>

            {/* Mandatory Override Reason */}
            <div className="form-group">
              <label className="form-label">
                Field Override Reason <span style={{ color: '#dc2626' }}>* (Mandatory)</span>:
              </label>
              <textarea
                className="form-textarea"
                rows="3"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g. Highway bridge towards recommended mandi is flooded; Dabra route is dry and open. Farmer also has credit settlement with commission agent at Dabra."
                required
              />
              <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.25rem' }}>
                Required for transparency, trust, and agronomic auditability.
              </div>
            </div>

            {errorMsg && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem 0.75rem',
                fontSize: '0.8rem',
                color: '#b91c1c',
                marginBottom: '1rem'
              }}>
                {errorMsg}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging...' : 'Confirm & Log Override'}
              </button>
            </div>
          </form>
        )}

        {/* Recent Audit Log Preview */}
        {recentOverrides && recentOverrides.length > 0 && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
              <History size={14} />
              <span>Recent Field Overrides in Session ({recentOverrides.length}):</span>
            </div>
            <div style={{ maxHeight: '100px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {recentOverrides.map((ov, i) => (
                <div key={i} style={{ fontSize: '0.75rem', background: '#f8fafc', padding: '0.35rem 0.6rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  <strong>{ov.chosen_mandi}</strong> (Overrode {ov.original_recommended_mandi}): <em>"{ov.override_reason}"</em> — {ov.actor_id}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
