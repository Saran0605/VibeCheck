import React, { useEffect } from 'react';
import { X, Sparkles, Cpu, DollarSign, Clock, ArrowRight } from 'lucide-react';
import { categoryBadgeClass, formatCost } from '../ui/helpers';

export default function OptimizeModal({ isOpen, onClose, rawPrompt, category, suggestions, onSelectSuggestion }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const baseSug = suggestions && suggestions.length > 0 ? suggestions[0] : null;
  const baseInputTokens = baseSug ? Math.round(baseSug.predictedTokensInput * 0.75) : 30;
  const baseOutputTokens = baseSug ? baseSug.predictedTokensOutput : 300;
  const baseCostUsd = baseSug
    ? parseFloat((baseInputTokens * 0.0000001 + baseOutputTokens * 0.0000002).toFixed(6))
    : 0.00006;
  const baseLatency = baseSug ? baseSug.predictedLatencyMs : 800;

  return (
    <div className="overlay overlay-center" onClick={onClose} role="presentation">
      <div
        className="modal-panel"
        style={{ maxWidth: 680 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="optimize-title"
      >
        <div
          style={{
            padding: '1.125rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', minWidth: 0 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#ffffff',
                color: '#0b0b0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Sparkles size={16} aria-hidden />
            </div>
            <div>
              <h2 id="optimize-title" style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.02em' }}>
                Optimize prompt
              </h2>
              <p className="ds-muted" style={{ fontSize: '0.8125rem', marginTop: 2 }}>
                Choose a rewrite to inject into the editor
              </p>
            </div>
          </div>
          <button type="button" className="btn btn-ghost" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <section className="ds-surface" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
              <span className="ds-label" style={{ marginBottom: 0 }}>
                Current prompt
              </span>
              {category && <span className={categoryBadgeClass(category)}>{category}</span>}
            </div>

            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                lineHeight: 1.55,
                background: 'var(--bg-base)',
                padding: '0.875rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {rawPrompt}
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Cpu size={12} aria-hidden />~{baseInputTokens + baseOutputTokens} tokens
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                <DollarSign size={12} aria-hidden />
                {formatCost(baseCostUsd)}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Clock size={12} aria-hidden />~{baseLatency}ms
              </span>
            </div>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <span className="ds-label" style={{ marginBottom: 0 }}>
              Suggestions
            </span>

            {(!suggestions || suggestions.length === 0) ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                <div className="skeleton" style={{ height: 72, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 72, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 72 }} />
              </div>
            ) : (
              suggestions.map((sug, idx) => (
                <button
                  key={sug.id || idx}
                  type="button"
                  onClick={() => onSelectSuggestion(sug)}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'border-color var(--transition), transform var(--transition), background-color var(--transition)',
                    width: '100%',
                    color: 'inherit',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#525252';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.65rem',
                      gap: '0.75rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          background: '#ffffff',
                          color: '#0b0b0b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{sug.title}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span className="badge">
                        ~{(sug.predictedTokensInput || 0) + (sug.predictedTokensOutput || 0)} tok
                      </span>
                      <span className="badge">{formatCost(sug.predictedCostUsd)}</span>
                    </div>
                  </div>

                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.55,
                      marginBottom: '0.75rem',
                    }}
                  >
                    {sug.rewrittenPrompt}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 4,
                      fontSize: '0.75rem',
                      color: 'var(--text-primary)',
                      fontWeight: 500,
                    }}
                  >
                    Use this prompt
                    <ArrowRight size={14} aria-hidden />
                  </div>
                </button>
              ))
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
