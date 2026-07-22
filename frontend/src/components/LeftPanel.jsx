import React, { useState } from 'react';
import { Folder, FileCode, FileJson, ChevronDown, ChevronRight } from 'lucide-react';

const STATIC_FILES = [
  { name: 'index.js', type: 'js', icon: FileCode, size: '2.4 KB' },
  { name: 'promptOptimizer.py', type: 'py', icon: FileCode, size: '4.1 KB' },
  { name: 'config.json', type: 'json', icon: FileJson, size: '890 B' },
];

function ExplorerTree({ selectedFile, setSelectedFile, onSelect }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div style={{ padding: '0.5rem', flex: 1, overflowY: 'auto' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          width: '100%',
          padding: '0.4rem 0.5rem',
          borderRadius: 'var(--radius-sm)',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: 'var(--text-primary)',
          textAlign: 'left',
        }}
      >
        {isOpen ? <ChevronDown size={14} aria-hidden /> : <ChevronRight size={14} aria-hidden />}
        <Folder size={14} color="var(--text-secondary)" aria-hidden />
        <span>workspace</span>
      </button>

      {isOpen && (
        <div style={{ marginLeft: '0.85rem', marginTop: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {STATIC_FILES.map((file) => {
            const IconComp = file.icon;
            const isSelected = selectedFile === file.name;
            return (
              <button
                key={file.name}
                type="button"
                onClick={() => {
                  setSelectedFile(file.name);
                  onSelect?.();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.4rem 0.55rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  backgroundColor: isSelected ? 'var(--bg-active)' : 'transparent',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  transition: 'background-color var(--transition)',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
                  <IconComp size={14} color="var(--text-muted)" aria-hidden />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file.name}
                  </span>
                </span>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', flexShrink: 0 }}>{file.size}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function LeftPanel({ mobileOpen, onCloseMobile }) {
  const [selectedFile, setSelectedFile] = useState('index.js');

  return (
    <>
      <aside
        className="sidebar-desktop"
        style={{
          width: 'var(--sidebar-width)',
          minWidth: 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-elevated)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          userSelect: 'none',
          height: '100%',
        }}
      >
        <div className="panel-header">
          <span className="panel-title">Explorer</span>
        </div>
        <ExplorerTree selectedFile={selectedFile} setSelectedFile={setSelectedFile} />
        <div
          style={{
            padding: '0.875rem 1rem',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.6875rem',
            color: 'var(--text-muted)',
            lineHeight: 1.45,
          }}
        >
          Read-only context for prompt optimization.
        </div>
      </aside>

      {mobileOpen && (
        <div className="overlay overlay-end" style={{ zIndex: 80 }} onClick={onCloseMobile} role="presentation">
          <div
            className="drawer-panel"
            style={{ maxWidth: 280 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Project explorer"
          >
            <div className="panel-header">
              <span className="panel-title">Explorer</span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={onCloseMobile}>
                Close
              </button>
            </div>
            <ExplorerTree
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              onSelect={onCloseMobile}
            />
          </div>
        </div>
      )}
    </>
  );
}
