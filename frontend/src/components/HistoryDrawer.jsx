import React, { useEffect } from 'react';
import { X, History, Activity, DollarSign, Clock, Cpu, ThumbsUp, ThumbsDown, ArrowRight } from 'lucide-react';
import { categoryBadgeClass, formatCost, truncate } from '../ui/helpers';

export default function HistoryDrawer({ isOpen, onClose, historyList, onSelectHistoryItem, onFeedbackToggle }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="overlay overlay-end" onClick={onClose} role="presentation">
      <div
        className="drawer-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-title"
      >
        <div
          style={{
            padding: '1.125rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <History size={18} color="var(--text-secondary)" aria-hidden />
            <h2 id="history-title" style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.02em' }}>
              History
            </h2>
          </div>
          <button type="button" className="btn btn-ghost" onClick={onClose} aria-label="Close history">
            <X size={18} />
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
          }}
        >
          {(!historyList || historyList.length === 0) ? (
            <div
              style={{
                padding: '3rem 1rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}
              >
                <History size={18} color="var(--text-muted)" aria-hidden />
              </div>
              <p style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: 6 }}>No runs yet</p>
              <p className="ds-muted" style={{ fontSize: '0.8125rem' }}>
                Submit a prompt to start building your learning history.
              </p>
            </div>
          ) : (
            historyList.map((item) => (
              <article
                key={item._id}
                className="ds-surface"
                style={{
                  padding: '0.875rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  transition: 'border-color var(--transition)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.6875rem',
                    gap: '0.5rem',
                  }}
                >
                  <span className={categoryBadgeClass(item.category)}>{item.category}</span>
                  <span className="ds-dim">{new Date(item.createdAt).toLocaleString()}</span>
                </div>

                <div>
                  <div className="ds-label" style={{ marginBottom: 4 }}>
                    Prompt
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                    {truncate(item.chosenPrompt, 160)}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.55rem',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.6875rem',
                    color: 'var(--text-muted)',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                      <Cpu size={11} aria-hidden />
                      {(item.tokensInput || 0) + (item.tokensOutput || 0)}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                      <DollarSign size={11} aria-hidden />
                      {formatCost(item.costUsd).replace('$', '')}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                      <Clock size={11} aria-hidden />
                      {item.latencyMs}ms
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onFeedbackToggle(item._id, !item.success)}
                    className="btn btn-ghost btn-sm"
                    style={{
                      color: 'var(--text-secondary)',
                      padding: '0.25rem 0.4rem',
                    }}
                  >
                    {item.success ? <ThumbsUp size={11} aria-hidden /> : <ThumbsDown size={11} aria-hidden />}
                    {item.success ? 'Success' : 'Failed'}
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.6875rem',
                    color: 'var(--text-muted)',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
                    <Activity size={11} aria-hidden />
                    <code className="ds-mono" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.traceId ? `${item.traceId.slice(0, 16)}…` : 'No trace'}
                    </code>
                  </span>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      onSelectHistoryItem(item);
                      onClose();
                    }}
                  >
                    View
                    <ArrowRight size={12} aria-hidden />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
