import React, { useState, useEffect } from 'react';
import { Shield, Info, TrendingUp, Clock, FileText, CheckCircle2 } from 'lucide-react';

const rawApiUrl = import.meta.env.VITE_API_URL;
const API_BASE = rawApiUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`)
  : '/api';

export default function StatsPage({ user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/stats`, { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Failed to retrieve statistics data');
      }
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div
        className="ds-page"
        style={{
          minHeight: 'calc(100vh - var(--nav-height))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1rem',
          background: '#000000'
        }}
      >
        <div className="skeleton" style={{ width: 140, height: 10, background: '#222' }} />
        <span className="ds-dim" style={{ fontSize: '0.8125rem', color: '#888' }}>
          Loading engineering telemetry…
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="ds-page"
        style={{
          minHeight: 'calc(100vh - var(--nav-height))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          background: '#000000',
          color: '#ffffff',
          padding: '2rem',
          textAlign: 'center'
        }}
      >
        <div style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
          <Info size={32} />
        </div>
        <p style={{ color: '#ff4d4d', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{error}</p>
        <button type="button" className="btn btn-secondary" onClick={fetchStats}>
          Retry Connection
        </button>
      </div>
    );
  }

  // Fallback default values
  const totalPrompts = stats?.totalPrompts || 0;
  const optimizedCount = stats?.optimizedCount || 0;
  const successRate = stats?.successRate ?? 100;
  const averageLatency = stats?.averageLatency || 0;
  const savingsToday = stats?.savingsToday || 0.0;
  const savingsThisWeek = stats?.savingsThisWeek || 0.0;
  const categories = stats?.categories || { vague: 0, underspecified: 0, 'well-scoped': 0 };
  const chartData = stats?.chartData || [];

  // Calculate Dev Time Saved
  // Each optimized count saves ~3 minutes, each well-scoped successful count saves ~1.5 minutes
  const totalMinutesSaved = Math.round((optimizedCount * 3) + ((categories['well-scoped'] || 0) * 1.5));
  const savedHrs = Math.floor(totalMinutesSaved / 60);
  const savedMins = totalMinutesSaved % 60;
  const devTimeText = savedHrs > 0 ? `${savedHrs}h ${savedMins}m` : `${savedMins}m`;

  // Dynamic max value for CSS Bar chart
  const maxSavings = Math.max(...chartData.map(d => d.costSaved), 0.05);

  return (
    <div
      style={{
        minHeight: 'calc(100vh - var(--nav-height))',
        background: '#000000',
        color: '#ffffff',
        overflowY: 'auto',
        padding: '2rem 1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
          gap: '2rem',
        }}
        className="stats-grid"
      >
        {/* Left Column: User Profile & API Keys */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Profile Card */}
          <div
            style={{
              background: '#0a0a0a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: '#ffffff',
                color: '#000000',
                fontSize: '1.5rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                textTransform: 'uppercase',
              }}
            >
              {user?.email ? user.email.substring(0, 2) : 'DV'}
            </div>
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 500,
                marginBottom: '0.25rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.email || 'developer@company.com'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '1.25rem' }}>
              Premium Developer Tier
            </p>

            <div
              style={{
                textAlign: 'left',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                paddingTop: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                fontSize: '0.8125rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Status: </span>
                <span style={{ color: '#4caf50', fontWeight: 500 }}>Active Node</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Workspace: </span>
                <span>vibecheck-workspace</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Cluster ID: </span>
                <span style={{ fontFamily: 'monospace' }}>vc-0723a</span>
              </div>
            </div>
          </div>


        </div>

        {/* Right Column: Statistics & Telemetry Dashboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header */}
          <div style={{ marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.03em' }}>Engineering Telemetry</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              Real-time monitoring of prompt efficiency and LLM API cost savings.
            </p>
          </div>

          {/* Metrics Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            {[
              {
                title: 'Est. Cost Saved',
                value: `$${savingsThisWeek.toFixed(2)}`,
                sub: `Today: $${savingsToday.toFixed(2)}`,
                icon: <TrendingUp size={16} />,
              },
              {
                title: 'Dev Time Saved',
                value: devTimeText,
                sub: `Avg 3m per retry`,
                icon: <Clock size={16} />,
              },
              {
                title: 'Prompts Run',
                value: totalPrompts.toString(),
                sub: `Optimized: ${optimizedCount}`,
                icon: <FileText size={16} />,
              },
              {
                title: 'Telemetry Success',
                value: `${successRate}%`,
                sub: 'Based on feedback',
                icon: <CheckCircle2 size={16} />,
              },
            ].map((metric, idx) => (
              <div
                key={idx}
                style={{
                  background: '#0a0a0a',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                  }}
                >
                  {metric.title}
                  {metric.icon}
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', margin: '0.25rem 0' }}>
                  {metric.value}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{metric.sub}</div>
              </div>
            ))}
          </div>

          {/* Cost Savings Chart & Categories Breakdown Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 320px',
              gap: '1.5rem',
            }}
            className="stats-charts-grid"
          >
            {/* Custom CSS Bar Chart */}
            <div
              style={{
                background: '#0a0a0a',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '2rem' }}>Weekly Cost Savings ($)</h3>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  height: 180,
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  paddingBottom: '0.5rem',
                  position: 'relative',
                }}
              >
                {/* Horizontal reference grids */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: '25%',
                    borderBottom: '1px dashed rgba(255, 255, 255, 0.03)',
                    height: 0,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: '50%',
                    borderBottom: '1px dashed rgba(255, 255, 255, 0.03)',
                    height: 0,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: '75%',
                    borderBottom: '1px dashed rgba(255, 255, 255, 0.03)',
                    height: 0,
                  }}
                />

                {chartData.map((item, idx) => {
                  const pct = Math.max((item.costSaved / maxSavings) * 100, 2); // At least 2% height so it shows up
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        flex: 1,
                        zIndex: 2,
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.625rem',
                          fontFamily: 'monospace',
                          color: 'var(--text-muted)',
                          marginBottom: '0.5rem',
                        }}
                      >
                        ${item.costSaved.toFixed(3)}
                      </span>
                      <div
                        style={{
                          width: 24,
                          height: `${pct * 1.2}px`, // scaled for display
                          maxHeight: 120,
                          background: '#ffffff',
                          borderRadius: '2px 2px 0 0',
                          transition: 'height 400ms cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      />
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          color: 'var(--text-secondary)',
                          marginTop: '0.5rem',
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Prompt Categories Progress Bar Breakdown */}
            <div
              style={{
                background: '#0a0a0a',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>Prompt Classification Ratios</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1, justifyContent: 'center' }}>
                {[
                  { key: 'well-scoped', label: 'Well-Scoped (Efficient)', color: '#ffffff', val: categories['well-scoped'] || 0 },
                  { key: 'underspecified', label: 'Underspecified (Warning)', color: '#888888', val: categories['underspecified'] || 0 },
                  { key: 'vague', label: 'Vague (High Risk)', color: '#333333', val: categories['vague'] || 0 }
                ].map((item) => {
                  const pct = totalPrompts > 0 ? Math.round((item.val / totalPrompts) * 100) : 0;
                  return (
                    <div key={item.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.75rem',
                        }}
                      >
                        <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                        <span style={{ fontWeight: 600 }}>{pct}% ({item.val})</span>
                      </div>
                      <div
                        style={{
                          height: 6,
                          background: 'rgba(255, 255, 255, 0.04)',
                          borderRadius: 3,
                          overflow: 'hidden',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            background: item.color,
                            width: `${pct}%`,
                            borderRadius: 3,
                            transition: 'width 300ms ease',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          .stats-charts-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
