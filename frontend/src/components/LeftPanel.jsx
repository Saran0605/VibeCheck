import React, { useState } from 'react';
import { Folder, FileCode, FileJson, ChevronDown, ChevronRight, HardDrive } from 'lucide-react';

const STATIC_FILES = [
  { name: 'index.js', type: 'js', icon: FileCode, size: '2.4 KB' },
  { name: 'promptOptimizer.py', type: 'py', icon: FileCode, size: '4.1 KB' },
  { name: 'config.json', type: 'json', icon: FileJson, size: '890 B' },
];

export default function LeftPanel() {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedFile, setSelectedFile] = useState('index.js');

  return (
    <aside style={{
      width: '240px',
      minWidth: '200px',
      backgroundColor: 'var(--bg-panel)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      userSelect: 'none',
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
        gap: '0.5rem',
      }}>
        <HardDrive size={14} color="var(--accent-blue)" />
        <span>PROJECT EXPLORER</span>
      </div>

      {/* Explorer Tree */}
      <div style={{ padding: '0.5rem', flex: 1, overflowY: 'auto' }}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.5rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-main)',
          }}
        >
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <Folder size={14} color="var(--accent-amber)" />
          <span>vibecheck-workspace</span>
        </div>

        {isOpen && (
          <div style={{ marginLeft: '1.2rem', marginTop: '0.2rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {STATIC_FILES.map((file) => {
              const IconComp = file.icon;
              const isSelected = selectedFile === file.name;
              return (
                <div
                  key={file.name}
                  onClick={() => setSelectedFile(file.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.35rem 0.6rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    color: isSelected ? '#ffffff' : 'var(--text-muted)',
                    borderLeft: isSelected ? '2px solid var(--accent-blue)' : '2px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <IconComp size={14} color={isSelected ? 'var(--accent-blue)' : 'var(--text-dim)'} />
                    <span>{file.name}</span>
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{file.size}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Visual Context Info Footer */}
      <div style={{
        padding: '0.75rem',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.7rem',
        color: 'var(--text-dim)',
        backgroundColor: 'var(--bg-secondary)',
      }}>
        <div style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: '2px' }}>Workspace Context</div>
        Read-only project explorer for prompt optimization context.
      </div>
    </aside>
  );
}
