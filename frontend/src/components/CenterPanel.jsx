import React, { useEffect, useState } from 'react';
import { Code2, Copy, Check, ThumbsUp, ThumbsDown, Activity, Clock, DollarSign, Cpu } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';

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
      <main style={{
        flex: 1,
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        color: 'var(--text-dim)',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}>
          <Code2 size={32} color="var(--accent-blue)" />
        </div>
        <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.4rem' }}>
          Code Generator Ready
        </h3>
        <p style={{ fontSize: '0.85rem', maxWidth: '380px', textAlign: 'center', lineHeight: 1.5 }}>
          Enter your prompt on the right panel or use <strong>Promptify</strong> to optimize your prompt before submitting.
        </p>
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
    <main style={{
      flex: 1,
      backgroundColor: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Code Viewer Header */}
      <div style={{
        padding: '0.6rem 1rem',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Code2 size={16} color="var(--accent-blue)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Generated Output
          </span>
          <span style={{
            fontSize: '0.7rem',
            padding: '2px 8px',
            borderRadius: '4px',
            fontWeight: 600,
            textTransform: 'uppercase',
            backgroundColor: category === 'well-scoped' ? 'rgba(16, 185, 129, 0.15)' : category === 'underspecified' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            color: category === 'well-scoped' ? 'var(--accent-emerald)' : category === 'underspecified' ? 'var(--accent-amber)' : 'var(--accent-rose)',
            border: `1px solid ${category === 'well-scoped' ? 'rgba(16, 185, 129, 0.3)' : category === 'underspecified' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
          }}>
            {category}
          </span>
        </div>

        {/* Metrics Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div title="Tokens (Input / Output)" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Cpu size={13} color="var(--accent-purple)" />
            <span>{tokensInput + tokensOutput} tokens</span>
          </div>

          <div title="Cost USD" style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--accent-emerald)' }}>
            <DollarSign size={13} />
            <span>${costUsd?.toFixed(6)}</span>
          </div>

          <div title="Latency" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={13} color="var(--accent-amber)" />
            <span>{latencyMs}ms</span>
          </div>

          <button
            onClick={handleCopy}
            className="btn-secondary"
            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
          >
            {copied ? <Check size={13} color="var(--accent-emerald)" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Code Content Container */}
      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#0d121d' }}>
        <pre className="language-javascript" style={{ margin: 0, minHeight: '100%' }}>
          <code>{generatedCode}</code>
        </pre>
      </div>

      {/* Footer with SigNoz Trace Link and Feedback Signal */}
      <div style={{
        padding: '0.6rem 1rem',
        backgroundColor: 'var(--bg-panel)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.75rem',
      }}>
        {/* Trace ID */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <Activity size={14} color="var(--accent-purple)" />
          <span>SigNoz Trace ID:</span>
          <code style={{
            background: '#0b0f19',
            padding: '2px 6px',
            borderRadius: '4px',
            color: 'var(--accent-blue)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            border: '1px solid var(--border-color)',
          }}>
            {traceId || 'N/A'}
          </code>
        </div>

        {/* Feedback Signal Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ color: 'var(--text-dim)' }}>Self-Learning Feedback:</span>
          <button
            onClick={() => onFeedbackToggle(historyId, true)}
            title="Mark as successful prompt example for similarity learning"
            style={{
              background: success === true ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-hover)',
              border: `1px solid ${success === true ? 'var(--accent-emerald)' : 'var(--border-color)'}`,
              color: success === true ? 'var(--accent-emerald)' : 'var(--text-muted)',
              borderRadius: '4px',
              padding: '0.3rem 0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
            }}
          >
            <ThumbsUp size={13} />
            <span>Success</span>
          </button>

          <button
            onClick={() => onFeedbackToggle(historyId, false)}
            title="Mark as poor prompt example"
            style={{
              background: success === false ? 'rgba(244, 63, 94, 0.2)' : 'var(--bg-hover)',
              border: `1px solid ${success === false ? 'var(--accent-rose)' : 'var(--border-color)'}`,
              color: success === false ? 'var(--accent-rose)' : 'var(--text-muted)',
              borderRadius: '4px',
              padding: '0.3rem 0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
            }}
          >
            <ThumbsDown size={13} />
            <span>Needs Work</span>
          </button>
        </div>
      </div>
    </main>
  );
}
