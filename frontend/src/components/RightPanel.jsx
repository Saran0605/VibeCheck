import React from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { categoryBadgeClass } from '../ui/helpers';

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
    <aside
      className="prompt-panel"
      style={{
        width: 'var(--prompt-width)',
        minWidth: 280,
        backgroundColor: 'var(--bg-elevated)',
        borderLeft: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <div className="panel-header">
        <span className="panel-title">
          <Sparkles size={12} aria-hidden />
          Prompt
        </span>
        {promptCategory && <span className={categoryBadgeClass(promptCategory)}>{promptCategory}</span>}
      </div>

      <div
        style={{
          flex: 1,
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.875rem',
          overflowY: 'auto',
          minHeight: 0,
        }}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <label className="ds-label" htmlFor="prompt-editor">
            Editor
          </label>
          <textarea
            id="prompt-editor"
            className="field field-textarea"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Describe what you want to build…"
            style={{
              flex: 1,
              minHeight: 220,
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
          <button
            type="button"
            onClick={handleOptimizeClick}
            disabled={!promptText.trim() || promptifyLoading}
            className="btn btn-secondary btn-block btn-lg"
          >
            {promptifyLoading ? (
              <Loader2 size={15} className="animate-spin" aria-hidden />
            ) : (
              <Sparkles size={15} aria-hidden />
            )}
            {promptifyLoading ? 'Analyzing…' : 'Optimize with VibeCheck'}
          </button>

          <button
            type="button"
            onClick={() => onSubmitPrompt(promptText)}
            disabled={isSubmitDisabled}
            className="btn btn-primary btn-block btn-lg"
          >
            {generateLoading ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Send size={15} aria-hidden />}
            {generateLoading ? 'Generating…' : 'Submit'}
          </button>
        </div>
      </div>
    </aside>
  );
}
