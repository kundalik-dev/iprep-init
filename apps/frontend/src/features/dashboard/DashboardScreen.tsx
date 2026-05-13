import { Play, Plus } from 'lucide-react';

export function DashboardScreen() {
  return (
    <div style={{ padding: 0 }}>
      <div
        className="page-header"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '28px 32px 0',
          gap: '20px',
        }}
      >
        <div className="page-header-left">
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Your interview prep at a glance</div>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary">
            <Plus size={14} style={{ marginRight: 6 }} /> New Interview
          </button>
        </div>
      </div>

      <div className="page-body" style={{ padding: '24px 32px 40px' }}>
        <div
          className="dashboard-hero"
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '24px',
            border: '1px solid var(--bg-border)',
            borderRadius: '20px',
            background:
              'radial-gradient(circle at 18% 10%, rgba(139, 92, 246, 0.24), transparent 28%), linear-gradient(135deg, var(--bg-card) 0%, var(--bg-surface) 100%)',
            padding: '28px',
            marginBottom: '24px',
          }}
        >
          <div className="hero-text">
            <span className="hero-greeting" style={{ color: 'var(--text-m)' }}>
              Good evening 👋
            </span>
            <div
              className="hero-title"
              style={{
                fontSize: '28px',
                fontWeight: 800,
                lineHeight: 1.12,
                margin: '18px 0 10px',
                color: 'var(--text-p)',
              }}
            >
              Ready to ace today?
            </div>
            <div className="hero-sub" style={{ fontSize: '14px', color: 'var(--text-s)' }}>
              7-day streak · 4 sessions this week · 312 total minutes practiced
            </div>
          </div>
          <div className="hero-actions" style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary">View History</button>
            <button className="btn btn-primary btn-lg">
              <Play size={16} style={{ marginRight: 6 }} /> Start Interview
            </button>
          </div>
        </div>

        <div
          className="stats-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: '14px',
            marginBottom: '24px',
          }}
        >
          <div className="card stat-card" style={{ padding: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(139, 92, 246, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                }}
              >
                🎯
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--success)' }}>
                +2 this week
              </span>
            </div>
            <div style={{ fontSize: '30px', fontWeight: 800 }}>8</div>
            <div style={{ fontSize: '12px', color: 'var(--text-m)' }}>Sessions Completed</div>
          </div>
          <div className="card stat-card" style={{ padding: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                }}
              >
                ⭐
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--success)' }}>
                +4 pts
              </span>
            </div>
            <div className="gradient-text" style={{ fontSize: '30px', fontWeight: 800 }}>
              79
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-m)' }}>Average Score</div>
          </div>
          <div className="card stat-card" style={{ padding: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                }}
              >
                🏆
              </div>
            </div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 700,
                letterSpacing: '-0.3px',
                marginTop: '14px',
              }}
            >
               Technical
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-m)' }}>Best Category</div>
          </div>
          <div className="card stat-card" style={{ padding: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                }}
              >
                🔥
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--success)' }}>
                Personal best
              </span>
            </div>
            <div style={{ fontSize: '30px', fontWeight: 800 }}>7d</div>
            <div style={{ fontSize: '12px', color: 'var(--text-m)' }}>Day Streak</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '18px' }}>
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}
            >
              <span className="section-title" style={{ margin: 0 }}>
                Recent Sessions
              </span>
              <button className="btn btn-ghost btn-sm">View all →</button>
            </div>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="card interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 16px',
                  marginBottom: '10px',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                  }}
                >
                  CL
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-p)' }}>
                    Technical Interview
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-m)', marginTop: '2px' }}>
                    Claude · Yesterday · 25m
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--success)' }}>
                    85
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-m)' }}>Strong</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              className="card"
              style={{
                padding: '16px',
                background: 'var(--accent-soft)',
                borderColor: 'rgba(139, 92, 246, 0.2)',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--accent-v)',
                  marginBottom: '6px',
                }}
              >
                💡 Practice Tip
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-s)', lineHeight: 1.5 }}>
                Your average response time is slightly high. Try to pause for 2 seconds to gather
                thoughts, then answer concisely.
              </div>
            </div>

            <div className="card card-sm" style={{ padding: '16px' }}>
              <div className="section-title" style={{ marginBottom: '10px' }}>
                Quick Stats
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div
                  style={{ background: 'var(--bg-elevated)', borderRadius: '8px', padding: '12px' }}
                >
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-p)' }}>
                    5h
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-m)', marginTop: '2px' }}>
                    Total Practice
                  </div>
                </div>
                <div
                  style={{ background: 'var(--bg-elevated)', borderRadius: '8px', padding: '12px' }}
                >
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-p)' }}>4</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-m)', marginTop: '2px' }}>
                    This Week
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
