import React from 'react';
import { History, LogOut, Activity, PanelLeft } from 'lucide-react';

export default function Navbar({ user, onOpenHistory, onLogout, onToggleSidebar }) {
  return (
    <header
      style={{
        height: 'var(--nav-height)',
        padding: '0 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-elevated)',
        flexShrink: 0,
        zIndex: 30,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
        {onToggleSidebar && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onToggleSidebar}
            aria-label="Toggle explorer"
            title="Toggle explorer"
            style={{ display: 'none' }}
            id="nav-sidebar-toggle"
          >
            <PanelLeft size={16} />
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              background: '#ffffff',
              color: '#0b0b0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.6875rem',
              letterSpacing: '-0.04em',
              flexShrink: 0,
            }}
            aria-hidden
          >
            VC
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 600, fontSize: '0.9375rem', letterSpacing: '-0.02em' }}>
                VibeCheck
              </span>
              <span className="badge badge-outline nav-brand-sub">Prompt layer</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        <div
          className="hide-mobile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            padding: '0.35rem 0.65rem',
            borderRadius: 999,
            border: '1px solid var(--border)',
            marginRight: '0.25rem',
          }}
          title="OpenTelemetry instrumentation"
        >
          <Activity size={12} className="animate-pulse" aria-hidden />
          <span>Telemetry</span>
        </div>

        {user && (
          <>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onOpenHistory}>
              <History size={14} aria-hidden />
              <span className="hide-mobile">History</span>
            </button>

            <div
              className="hide-mobile"
              style={{
                display: 'flex',
                alignItems: 'center',
                maxWidth: 180,
                padding: '0.35rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--bg-surface)',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={user.email}
            >
              {user.email}
            </div>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={onLogout}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={15} />
            </button>
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          #nav-sidebar-toggle { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}
