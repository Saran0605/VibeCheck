import React from 'react';
import { Sparkles, History, User, LogOut, Activity } from 'lucide-react';

export default function Navbar({ user, onOpenHistory, onLogout }) {
  return (
    <header className="glass-panel" style={{
      height: '56px',
      padding: '0 1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--border-color)',
      zIndex: 20
    }}>
      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'var(--gradient-brand)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 12px rgba(139, 92, 246, 0.4)'
        }}>
          <Sparkles size={18} color="#ffffff" />
        </div>
        <div>
          <span className="gradient-text" style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em' }}>
            VibeCheck
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: '8px', padding: '2px 6px', background: '#1e293b', borderRadius: '4px', border: '1px solid #334155' }}>
            Self-Learning Layer
          </span>
        </div>
      </div>

      {/* Telemetry Indicator & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <Activity size={13} className="animate-pulse" />
          <span>OTel & SigNoz Active</span>
        </div>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={onOpenHistory}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            >
              <History size={15} />
              <span>History</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-panel)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
              <User size={14} color="var(--accent-blue)" />
              <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </span>
            </div>

            <button
              onClick={onLogout}
              className="btn-secondary"
              title="Logout"
              style={{ padding: '0.4rem', borderRadius: '6px', color: 'var(--accent-rose)' }}
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
