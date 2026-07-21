import React from 'react';
import { Sparkles, Send } from 'lucide-react';

export default function RightPanel({
  promptText,
  setPromptText,
  onOpenOptimizeModal,
  onSubmitPrompt,
  promptifyLoading,
  generateLoading,
  promptCategory,
}) {
  const handleOptimizeClick = () => {
    if (!promptText.trim()) return;
    onOpenOptimizeModal(promptText);
  };

  const isSubmitDisabled = !promptText.trim() || generateLoading;

  return (
    <aside style={{
      width: '380px',
      minWidth: '320px',
      backgroundColor: 'var(--bg-panel)',
      borderLeft: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      {/* Panel Header */}
      <div style={{
        padding: '0.75rem 1rem',
        fontSize: '0.75rem',
        fontWeight: 700,
        color: 'var(--text-muted)',
        letterSpacing: '0.05em',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={14} color="var(--accent-purple)" />
          <span>PROMPT ENGINEER</span>
        </div>

        {promptCategory && (
          <span style={{
            fontSize: '0.65rem',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: 600,
            textTransform: 'uppercase',
            backgroundColor: promptCategory === 'well-scoped' ? 'rgba(16, 185, 129, 0.15)' : promptCategory === 'underspecified' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            color: promptCategory === 'well-scoped' ? 'var(--accent-emerald)' : promptCategory === 'underspecified' ? 'var(--accent-amber)' : 'var(--accent-rose)',
          }}>
            {promptCategory}
          </span>
        )}
      </div>

      {/* Main Container */}
      <div style={{
        flex: 1,
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        overflowY: 'auto',
      }}>

        {/* Prompt Input Textarea */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            PROMPT INPUT
          </label>
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Type your prompt here... (e.g. Write a Python function for Fibonacci sequence with memoization)"
            style={{
              flex: 1,
              minHeight: '260px',
              resize: 'none',
              lineHeight: 1.5,
              fontSize: '0.85rem',
            }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: 'auto' }}>
          {/* VibeCheck Optimize Button */}
          <button
            onClick={handleOptimizeClick}
            disabled={!promptText.trim() || promptifyLoading}
            className="btn-secondary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.7rem',
              borderColor: 'var(--accent-purple)',
              color: 'var(--accent-purple)',
              background: 'rgba(139, 92, 246, 0.08)',
              fontWeight: 600,
            }}
          >
            <Sparkles size={16} className={promptifyLoading ? 'animate-spin' : ''} />
            <span>{promptifyLoading ? 'Analyzing Prompt...' : 'VibeCheck (Optimize Prompt)'}</span>
          </button>

          {/* Submit Button */}
          <button
            onClick={() => onSubmitPrompt(promptText)}
            disabled={isSubmitDisabled}
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.7rem',
              height: '44px',
            }}
          >
            <Send size={16} />
            <span>{generateLoading ? 'Generating Code...' : 'Submit Prompt'}</span>
          </button>
        </div>

      </div>
    </aside>
  );
}
