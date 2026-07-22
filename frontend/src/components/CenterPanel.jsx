import React, { useEffect, useState } from 'react';
import { Code2, Copy, Check, ThumbsUp, ThumbsDown, Activity, Clock, DollarSign, Cpu } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';
import { categoryBadgeClass, formatCost } from '../ui/helpers';

export default function CenterPanel({ currentOutput, onFeedbackToggle }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [currentOutput]);

  const handleCopy = () => {
    if (!currentOutput?.generatedCode) return;
    navigator.clipboard.writeText(currentOutput.generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!currentOutput) {
    return (
      <main
        className="center-panel"
        style={{
          flex: 1,
          backgroundColor: 'var(--bg-base)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          minWidth: 0,
        }}
      >
        <div
          className="animate-slide-up"
          style={{
            textAlign: 'center',
            maxWidth: 380,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'var(--bg-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <Code2 size={22} color="var(--text-secondary)" aria-hidden />
          </div>
          <h2
            style={{
              color: 'var(--text-primary)',
              fontSize: '1.125rem',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              marginBottom: '0.5rem',
            }}
          >
            Ready to generate
          </h2>
          <p className="ds-muted" style={{ fontSize: '0.875rem', lineHeight: 1.55 }}>
            Write a prompt in the editor, optimize it with VibeCheck, then submit to generate code with cost predictions.
          </p>
        </div>
      </main>
    );
  }

  const {
    generatedCode,
    category,
    tokensInput,
    tokensOutput,
    costUsd,
    latencyMs,
    traceId,
    success,
    id: historyId,
  } = currentOutput;

  return (
    <main
      className="center-panel"
      style={{
        flex: 1,
        backgroundColor: 'var(--bg-base)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minWidth: 0,
      }}
    >
      <div
        style={{
          padding: '0.65rem 1rem',
          backgroundColor: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.65rem',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
          <Code2 size={15} color="var(--text-secondary)" aria-hidden />
          <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Output</span>
          {category && <span className={categoryBadgeClass(category)}>{category}</span>}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }} title="Tokens">
            <Cpu size={12} aria-hidden />
            {(tokensInput || 0) + (tokensOutput || 0)}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }} title="Estimated cost">
            <DollarSign size={12} aria-hidden />
            {formatCost(costUsd).replace('$', '')}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }} title="Latency">
            <Clock size={12} aria-hidden />
            {latencyMs}ms
          </span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleCopy}>
            {copied ? <Check size={12} aria-hidden /> : <Copy size={12} aria-hidden />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#0b0b0b' }}>
        <pre className="language-javascript" style={{ margin: 0, minHeight: '100%' }}>
          <code>{generatedCode}</code>
        </pre>
      </div>

      <div
        style={{
          padding: '0.65rem 1rem',
          backgroundColor: 'var(--bg-elevated)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          fontSize: '0.75rem',
          flexWrap: 'wrap',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', minWidth: 0 }}>
          <Activity size={13} aria-hidden />
          <span className="hide-mobile">Trace</span>
          <code
            className="ds-mono"
            style={{
              background: 'var(--bg-base)',
              padding: '2px 6px',
              borderRadius: 4,
              color: 'var(--text-secondary)',
              fontSize: '0.6875rem',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 180,
            }}
          >
            {traceId || 'N/A'}
          </code>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span className="ds-dim hide-mobile">Feedback</span>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => onFeedbackToggle(historyId, true)}
            title="Mark as successful for similarity learning"
            style={{
              background: success === true ? '#ffffff' : 'transparent',
              color: success === true ? '#0b0b0b' : 'var(--text-secondary)',
              border: `1px solid ${success === true ? '#ffffff' : 'var(--border-strong)'}`,
            }}
          >
            <ThumbsUp size={12} aria-hidden />
            Success
          </button>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => onFeedbackToggle(historyId, false)}
            title="Mark as poor example"
            style={{
              background: success === false ? 'var(--bg-active)' : 'transparent',
              color: success === false ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: `1px solid ${success === false ? 'var(--border-strong)' : 'var(--border)'}`,
            }}
          >
            <ThumbsDown size={12} aria-hidden />
            Needs work
          </button>
        </div>
      </div>
    </main>
  );
}
