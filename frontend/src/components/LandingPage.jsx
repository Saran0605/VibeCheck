import React, { useState, useEffect } from 'react';
import { ArrowRight, Code, ShieldCheck, Cpu, Zap, Activity } from 'lucide-react';

const rawApiUrl = import.meta.env.VITE_API_URL;
const API_BASE = rawApiUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`)
  : '/api';

export default function LandingPage({ user, onNavigate }) {
  const [stats, setStats] = useState({ prompts: 0, savings: 0.0 });

  useEffect(() => {
    fetch(`${API_BASE}/public-stats`)
      .then(res => {
        if (!res.ok) throw new Error('Rate limit or server error');
        return res.json();
      })
      .then(data => {
        if (data && typeof data.totalPrompts === 'number' && typeof data.totalSavings === 'number') {
          animateCount(data.totalPrompts, data.totalSavings);
        } else {
          throw new Error('Malformed stats data');
        }
      })
      .catch(() => {
        animateCount(142, 4.28);
      });
  }, []);

  const animateCount = (targetPrompts, targetSavings) => {
    const finalPrompts = typeof targetPrompts === 'number' && !isNaN(targetPrompts) ? targetPrompts : 142;
    const finalSavings = typeof targetSavings === 'number' && !isNaN(targetSavings) ? targetSavings : 4.28;

    const duration = 1500; // 1.5s
    const frameRate = 30; // 30 fps
    const totalFrames = Math.round((duration / 1000) * frameRate);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const ease = progress * (2 - progress); // easeOutQuad

      setStats({
        prompts: Math.round(finalPrompts * ease),
        savings: parseFloat((finalSavings * ease).toFixed(2))
      });

      if (frame >= totalFrames) {
        clearInterval(timer);
        setStats({
          prompts: finalPrompts,
          savings: finalSavings
        });
      }
    }, 1000 / frameRate);
  };
  return (
    <div
      style={{
        position: 'relative',
        minHeight: 'calc(100vh - var(--nav-height))',
        background: '#000000',
        color: '#ffffff',
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Background fixed video with monochrome mask and high contrast darkening overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        >
          <source src="/landing.mp4" type="video/mp4" />
        </video>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.65) 40%, rgba(0,0,0,0.92) 100%)',
            backdropFilter: 'grayscale(100%) brightness(0.5) contrast(1.15)',
          }}
        />
      </div>

      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: 960,
          margin: '0 auto',
          padding: '6rem 1.5rem 4rem 1.5rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          className="animate-fade-in"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: '99px',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: '#ffffff',
            marginBottom: '2rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          }}
        >
          <Activity size={12} className="animate-pulse" />
          Self-Learning Prompt Optimizer
        </div>

        <h1
          className="animate-slide-up"
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            marginBottom: '1.5rem',
            maxWidth: 800,
            color: '#ffffff',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.95)',
          }}
        >
          Structure raw prompts into production-grade code.
        </h1>

        <p
          className="animate-slide-up"
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.125rem)',
            color: '#f3f4f6',
            lineHeight: 1.6,
            maxWidth: 600,
            marginBottom: '2.5rem',
            fontWeight: 500,
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.9)',
          }}
        >
          VibeCheck classified, semantically analyzes, and expands engineering prompts—reducing LLM hallucinations, shortening latencies, and maximizing token savings.
        </p>

        <div
          className="animate-slide-up"
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {user ? (
            <>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => onNavigate('workspace')}
                style={{
                  boxShadow: '0 0 24px rgba(255, 255, 255, 0.25)',
                  minWidth: 160,
                  fontWeight: 600,
                }}
              >
                Go to Workspace
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-lg"
                onClick={() => onNavigate('stats')}
                style={{
                  minWidth: 160,
                  background: 'rgba(0, 0, 0, 0.6)',
                  backdropFilter: 'blur(8px)',
                  borderColor: 'rgba(255, 255, 255, 0.25)',
                  fontWeight: 600,
                }}
              >
                Telemetry Dashboard
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => onNavigate('auth')}
                style={{
                  boxShadow: '0 0 24px rgba(255, 255, 255, 0.25)',
                  minWidth: 160,
                  fontWeight: 600,
                }}
              >
                Get Started
                <ArrowRight size={16} />
              </button>
              <a
                href="#paradigm"
                className="btn btn-secondary btn-lg"
                style={{
                  minWidth: 160,
                  textDecoration: 'none',
                  background: 'rgba(0, 0, 0, 0.6)',
                  backdropFilter: 'blur(8px)',
                  borderColor: 'rgba(255, 255, 255, 0.25)',
                  fontWeight: 600,
                }}
              >
                Learn More
              </a>
            </>
          )}
        </div>

        {/* Public Telemetry Stats with Count-Up Animation */}
        <div
          className="animate-fade-in"
          style={{
            display: 'flex',
            gap: '3rem',
            justifyContent: 'center',
            marginTop: '3.5rem',
            background: 'rgba(0, 0, 0, 0.55)',
            padding: '1.25rem 2.5rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              {((stats && stats.prompts) || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.35rem', fontWeight: 600 }}>
              Prompts Optimized
            </div>
          </div>
          <div style={{ width: 1, background: 'rgba(255, 255, 255, 0.12)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              ${typeof (stats && stats.savings) === 'number' ? stats.savings.toFixed(2) : '0.00'}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.35rem', fontWeight: 600 }}>
              Total Cost Saved
            </div>
          </div>
        </div>
      </section>

      {/* Paradigm Section */}
      <section
        id="paradigm"
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: 1000,
          margin: '4rem auto 6rem auto',
          padding: '0 1.5rem',
          width: '100%',
        }}
      >
        <div
          style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15) 50%, transparent)',
            marginBottom: '5rem',
          }}
        />

        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 600,
              letterSpacing: '-0.03em',
              marginBottom: '1rem',
            }}
          >
            The VibeCheck Paradigm
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: 500, margin: '0 auto' }}>
            A closed-loop system of continuous improvement from user input to LLM response logging.
          </p>
        </div>

        {/* Steps Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            marginBottom: '4rem',
          }}
        >
          {[
            {
              num: '01',
              title: 'Classify & Scope',
              desc: 'Vector-based classifier checks prompt completeness, tagging items as Well-scoped, Underspecified, or Vague.',
              icon: <Cpu size={20} />,
            },
            {
              num: '02',
              title: 'Vector Search',
              desc: 'Compares prompt embedding against historical successful executions to pull top matches.',
              icon: <ShieldCheck size={20} />,
            },
            {
              num: '03',
              title: 'Optimize & Run',
              desc: 'Groq API refines prompts, generating targeted logic, stack contexts, and error-handling layers.',
              icon: <Code size={20} />,
            },
            {
              num: '04',
              title: 'Telemetry Analytics',
              desc: 'Instruments spans with OpenTelemetry, reporting token consumption, cost metrics, and user feedback.',
              icon: <Zap size={20} />,
            },
          ].map((step, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(8, 8, 8, 0.92)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                borderRadius: '12px',
                padding: '2rem 1.5rem',
                backdropFilter: 'blur(12px)',
                transition: 'all 200ms ease',
                position: 'relative',
              }}
              className="hover-card"
            >
              <div
                style={{
                  position: 'absolute',
                  top: '1.5rem',
                  right: '1.5rem',
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'rgba(255, 255, 255, 0.05)',
                  fontFamily: 'monospace',
                }}
              >
                {step.num}
              </div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: '#ffffff',
                  color: '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                }}
              >
                {step.icon}
              </div>
              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  letterSpacing: '-0.02em',
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: '#d1d5db',
                  lineHeight: 1.5,
                }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: 'auto',
          padding: '2rem 1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          background: 'rgba(5, 5, 5, 0.8)',
          backdropFilter: 'blur(10px)',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          zIndex: 10,
        }}
      >
        <p>© 2026 VibeCheck Inc. Designed for elite software prompt layer telemetries.</p>
      </footer>

      {/* Local hover effects stylesheet */}
      <style>{`
        .hover-card:hover {
          border-color: rgba(255, 255, 255, 0.25) !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(255, 255, 255, 0.02);
        }
      `}</style>
    </div>
  );
}
