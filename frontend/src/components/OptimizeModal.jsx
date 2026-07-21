import React from 'react';
import { X, Sparkles, Cpu, DollarSign, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

export default function OptimizeModal({ isOpen, onClose, rawPrompt, category, suggestions, onSelectSuggestion }) {
  if (!isOpen) return null;

  // Calculate baseline metrics from first suggestion or defaults
  const baseSug = suggestions && suggestions.length > 0 ? suggestions[0] : null;
  const baseInputTokens = baseSug ? Math.round(baseSug.predictedTokensInput * 0.75) : 30;
  const baseOutputTokens = baseSug ? baseSug.predictedTokensOutput : 300;
  const baseCostUsd = baseSug ? parseFloat((baseInputTokens * 0.0000001 + baseOutputTokens * 0.0000002).toFixed(6)) : 0.00006;
  const baseLatency = baseSug ? baseSug.predictedLatencyMs : 800;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1rem',
    }}>
      <div className="glass-panel animate-slide-up" style={{
        width: '100%',
        maxWidth: '720px',
        maxHeight: '90vh',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)',
        border: '1px solid var(--accent-purple)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--gradient-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Sparkles size={18} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>VibeCheck Prompt Optimization</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Select an optimized prompt below to inject into your workspace
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* TOP SECTION: Current Prompt & Baseline Stats */}
          <div style={{
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
                CURRENT RAW PROMPT & ANALYSIS
              </span>

              {category && (
                <span style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  backgroundColor: category === 'well-scoped' ? 'rgba(16, 185, 129, 0.15)' : category === 'underspecified' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                  color: category === 'well-scoped' ? 'var(--accent-emerald)' : category === 'underspecified' ? 'var(--accent-amber)' : 'var(--accent-rose)',
                  border: `1px solid ${category === 'well-scoped' ? 'rgba(16, 185, 129, 0.3)' : category === 'underspecified' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                }}>
                  {category}
                </span>
              )}
            </div>

            <p style={{
              fontSize: '0.9rem',
              color: 'var(--text-main)',
              lineHeight: 1.5,
              backgroundColor: '#0d121d',
              padding: '0.85rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.05)',
              fontFamily: 'var(--font-sans)',
            }}>
              "{rawPrompt}"
            </p>

            {/* Baseline Predicted Stats */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              paddingTop: '0.4rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Cpu size={14} color="var(--accent-purple)" />
                <span>Tokens: ~{baseInputTokens + baseOutputTokens}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--accent-emerald)' }}>
                <DollarSign size={14} />
                <span>Est. Cost: ${baseCostUsd}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={14} color="var(--accent-amber)" />
                <span>Est. Latency: {baseLatency}ms</span>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION: 3 Optimized Prompt Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-purple)', letterSpacing: '0.05em' }}>
              3 OPTIMIZED PROMPTS (CLICK TO INJECT)
            </span>

            {(!suggestions || suggestions.length === 0) ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                Generating optimized variations...
              </div>
            ) : (
              suggestions.map((sug, idx) => (
                <div
                  key={sug.id || idx}
                  onClick={() => onSelectSuggestion(sug)}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '1.1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-blue)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        color: 'var(--accent-blue)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}>
                        {idx + 1}
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
                        {sug.title}
                      </span>
                    </div>

                    {/* Stats Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.72rem' }}>
                      <span style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-purple)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(139, 92, 246, 0.3)', fontWeight: 600 }}>
                        ~{sug.predictedTokensInput + sug.predictedTokensOutput} tokens
                      </span>
                      <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 600 }}>
                        ~${sug.predictedCostUsd}
                      </span>
                    </div>
                  </div>

                  <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-main)',
                    lineHeight: 1.5,
                    marginBottom: '0.5rem',
                  }}>
                    {sug.rewrittenPrompt}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
                    <span>Select this prompt</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
