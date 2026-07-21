import React from 'react';
import { X, History, Activity, DollarSign, Clock, Cpu, ThumbsUp, ThumbsDown, ArrowRight } from 'lucide-react';

export default function HistoryDrawer({ isOpen, onClose, historyList, onSelectHistoryItem, onFeedbackToggle }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'flex-end',
      zIndex: 100,
    }}>
      <div className="glass-panel animate-slide-up" style={{
        width: '100%',
        maxWidth: '520px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
        borderLeft: '1px solid var(--border-color)',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <History size={20} color="var(--accent-blue)" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Prompt Optimization History</h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* List Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {(!historyList || historyList.length === 0) ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-dim)' }}>
              <p>No past prompt history found.</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Submit a prompt to start recording telemetry!</p>
            </div>
          ) : (
            historyList.map((item) => (
              <div
                key={item._id}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                }}
              >
                {/* Meta Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    backgroundColor: item.category === 'well-scoped' ? 'rgba(16, 185, 129, 0.15)' : item.category === 'underspecified' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                    color: item.category === 'well-scoped' ? 'var(--accent-emerald)' : item.category === 'underspecified' ? 'var(--accent-amber)' : 'var(--accent-rose)',
                  }}>
                    {item.category}
                  </span>

                  <span style={{ color: 'var(--text-dim)' }}>
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Prompt snippet */}
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '2px' }}>PROMPT</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                    {item.chosenPrompt}
                  </div>
                </div>

                {/* Metrics & Trace */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.5rem',
                  borderTop: '1px dashed var(--border-color)',
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <Cpu size={12} color="var(--accent-purple)" />
                      {item.tokensInput + item.tokensOutput}t
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--accent-emerald)' }}>
                      <DollarSign size={12} />
                      ${item.costUsd?.toFixed(6)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <Clock size={12} color="var(--accent-amber)" />
                      {item.latencyMs}ms
                    </span>
                  </div>

                  {/* Feedback button */}
                  <button
                    onClick={() => onFeedbackToggle(item._id, !item.success)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: item.success ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {item.success ? <ThumbsUp size={12} /> : <ThumbsDown size={12} />}
                    <span>{item.success ? 'Success' : 'Failed'}</span>
                  </button>
                </div>

                {/* Trace ID & View Code Action */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Activity size={12} color="var(--accent-purple)" />
                    <code>{item.traceId ? item.traceId.slice(0, 16) + '...' : 'No Trace'}</code>
                  </div>

                  <button
                    onClick={() => { onSelectHistoryItem(item); onClose(); }}
                    className="btn-secondary"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                  >
                    <span>View Code</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
