/* ═══════════════════════════════════════════════════
   iPrep Demo App — Router + MockAPI + View Renderers
   ═══════════════════════════════════════════════════ */

'use strict';

// ── State ──────────────────────────────────────────
const State = {
  currentView: 'dashboard',
  selectedPackage: null,
  selectedTutor: null,
  wizardStep: 1,
  activeSessionId: null,
  sessionTimer: null,
  sessionSeconds: 0,
  sessionMicOn: true,
  transcriptInterval: null,
  transcriptIndex: 0,
  activeAccordion: null,
  settingsTab: 'providers',
  historyFilter: 'all',
  theme: 'dark',
  data: null,
  currentConvId: null,
  // Feature 1 — History accordion
  expandedHistoryRow: null,
  expandedHistoryPanel: null,
  // Feature 2 — File Manager
  selectedFileId: null,
  editorMode: 'edit',
  expandedFolders: new Set(['folder_001']),
  fileModal: null,
  filesAutoSaveTimer: null,
};

// ── MockAPI ────────────────────────────────────────
const MockAPI = {
  _delay(ms = 220) {
    return new Promise((r) => setTimeout(r, ms));
  },

  async load() {
    const res = await fetch('mock-data.json');
    State.data = await res.json();
    return State.data;
  },
  async getTutors() {
    await this._delay();
    return State.data.tutors;
  },
  async getPackages() {
    await this._delay();
    return State.data.packages;
  },
  async getSessions() {
    await this._delay();
    return State.data.sessions;
  },
  async getAnalysis(id) {
    await this._delay(400);
    return State.data.analysis[id] || null;
  },
  async getProviders() {
    await this._delay();
    return State.data.providers;
  },
  async getStats() {
    await this._delay();
    return State.data.stats;
  },
  async startSession(pkg, tutor) {
    await this._delay(600);
    const id = 'sess_live_' + Date.now();
    State.activeSessionId = id;
    return { sessionId: id, status: 'ACTIVE' };
  },
  async endSession(id) {
    await this._delay(800);
    return { status: 'COMPLETED', analysisId: 'anal_001' };
  },
  async getConversations() {
    await this._delay();
    return [...(State.data.conversations || [])].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
    );
  },
  async getConversation(id) {
    await this._delay(150);
    return (State.data.conversations || []).find((c) => c.id === id) || null;
  },
  async createConversation(title, firstAiMsg) {
    await this._delay(300);
    const conv = {
      id: 'conv_' + Date.now(),
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'cmsg_' + Date.now(),
          role: 'ai',
          text: firstAiMsg.text,
          ts: new Date().toISOString(),
          actions: firstAiMsg.actions || [],
        },
      ],
    };
    if (!State.data.conversations) State.data.conversations = [];
    State.data.conversations.unshift(conv);
    return conv;
  },
  async addMessage(convId, role, text, actions = []) {
    await this._delay(role === 'ai' ? 1200 + Math.random() * 1000 : 50);
    const conv = (State.data.conversations || []).find((c) => c.id === convId);
    if (!conv) return null;
    const msg = { id: 'cmsg_' + Date.now(), role, text, ts: new Date().toISOString(), actions };
    conv.messages.push(msg);
    conv.updatedAt = new Date().toISOString();
    return msg;
  },
  async getFileSystem() {
    await this._delay();
    return State.data.fileSystem;
  },
  async getFile(id) {
    await this._delay(100);
    const fs = State.data.fileSystem;
    const all = [...fs.rootFiles, ...fs.folders.flatMap((f) => f.files)];
    return all.find((f) => f.id === id) || null;
  },
  async saveFile(id, content) {
    await this._delay(150);
    const fs = State.data.fileSystem;
    const all = [...fs.rootFiles, ...fs.folders.flatMap((f) => f.files)];
    const file = all.find((f) => f.id === id);
    if (file) {
      file.content = content;
      file.updatedAt = new Date().toISOString();
      file.sizeKB = +(content.length / 1024).toFixed(1);
    }
    return file;
  },
  async createFile(name, folderId) {
    await this._delay(300);
    const id = 'file_' + Date.now();
    const file = {
      id,
      name: name + '.md',
      type: 'md',
      sizeKB: 0.1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: `# ${name}\n\n`,
      folderId: folderId || null,
    };
    if (folderId) {
      const folder = State.data.fileSystem.folders.find((f) => f.id === folderId);
      if (folder) folder.files.push(file);
    } else State.data.fileSystem.rootFiles.push(file);
    return file;
  },
  async createFolder(name) {
    await this._delay(300);
    const folder = {
      id: 'folder_' + Date.now(),
      name,
      createdAt: new Date().toISOString(),
      files: [],
    };
    State.data.fileSystem.folders.push(folder);
    return folder;
  },
  async uploadFile(name, type, folderId) {
    await this._delay(500);
    const id = 'file_' + Date.now();
    const file = {
      id,
      name,
      type,
      sizeKB: +(Math.random() * 200 + 20).toFixed(1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: null,
      folderId: folderId || null,
    };
    if (folderId) {
      const folder = State.data.fileSystem.folders.find((f) => f.id === folderId);
      if (folder) folder.files.push(file);
    } else State.data.fileSystem.rootFiles.push(file);
    return file;
  },
  async deleteFile(id) {
    await this._delay(200);
    const fs = State.data.fileSystem;
    fs.rootFiles = fs.rootFiles.filter((f) => f.id !== id);
    fs.folders.forEach((folder) => {
      folder.files = folder.files.filter((f) => f.id !== id);
    });
  },
  async deleteFolder(id) {
    await this._delay(200);
    State.data.fileSystem.folders = State.data.fileSystem.folders.filter((f) => f.id !== id);
  },
};

// ── Router ─────────────────────────────────────────
function navigate(view, params = {}) {
  clearSessionTimers();
  State.currentView = view;
  Object.assign(State, params);
  renderView(view, params);
  document.querySelectorAll('.nav-item').forEach((el) => {
    el.classList.toggle('active', el.dataset.view === view);
  });
  window.location.hash = view;
}

function renderView(view, params = {}) {
  const container = document.getElementById('view-container');
  container.innerHTML = `<div class="loader-wrap"><div class="spinner"></div></div>`;

  const viewMap = {
    dashboard: renderDashboard,
    'new-interview': renderNewInterview,
    session: renderSession,
    analysis: () => renderAnalysis(params.analysisId || 'anal_001'),
    history: renderHistory,
    settings: renderSettings,
    chat: () => renderChat(params.convId),
    files: renderFiles,
    communication: renderCommunication,
  };

  const fn = viewMap[view] || renderDashboard;
  fn()
    .then(() => {
      const wrap = container.firstElementChild;
      if (wrap) wrap.classList.add('view-enter');
    })
    .catch(console.error);
}

// ── Theme ──────────────────────────────────────────
function toggleTheme() {
  const html = document.documentElement;
  const next = html.dataset.theme === 'light' ? 'dark' : 'light';
  html.dataset.theme = next;
  State.theme = next;
  localStorage.setItem('iprep-theme', next);

  const sun = document.getElementById('icon-sun');
  const moon = document.getElementById('icon-moon');
  const label = document.getElementById('theme-label');
  if (sun) sun.style.display = next === 'dark' ? '' : 'none';
  if (moon) moon.style.display = next === 'light' ? '' : 'none';
  if (label) label.textContent = next === 'dark' ? 'Light Mode' : 'Dark Mode';

  toast(`${next === 'dark' ? 'Dark' : 'Light'} mode active`, 'info', 1500);
}

// ── Toast ──────────────────────────────────────────
function toast(msg, type = 'info', duration = 3000) {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), duration);
}

// ── Helpers ────────────────────────────────────────
function fmtDuration(secs) {
  const m = Math.floor(secs / 60),
    s = secs % 60;
  return `${m}m ${s < 10 ? '0' : ''}${s}s`;
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
function fmtTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
function pad(n) {
  return n < 10 ? '0' + n : String(n);
}

function scoreClass(score) {
  if (score >= 8) return 'score-high';
  if (score >= 6) return 'score-mid';
  return 'score-low';
}
function diffBadge(diff) {
  const map = { Easy: 'badge-teal', Medium: 'badge-amber', Hard: 'badge-red', Expert: 'badge-red' };
  return map[diff] || 'badge-gray';
}
function statusBadge(status) {
  const map = { COMPLETED: 'badge-teal', ACTIVE: 'badge-blue', ABANDONED: 'badge-gray' };
  return map[status] || 'badge-gray';
}
function tutorColor(slug) {
  const map = { alex: '#3B82F6', priya: '#EC4899', morgan: '#10B981' };
  return map[slug] || '#7C3AED';
}
function tutorInitials(slug) {
  const map = { alex: 'AX', priya: 'PR', morgan: 'MG' };
  return map[slug] || slug[0].toUpperCase();
}

// ── Ring SVG ──────────────────────────────────────
function scoreRing(value, max = 10, size = 72, strokeW = 6, colorHex) {
  const r = (size - strokeW * 2) / 2;
  const circ = 2 * Math.PI * r;
  const pct = value / max;
  const dash = circ * pct;
  const color = colorHex || (value >= 8 ? '#10B981' : value >= 6 ? '#F59E0B' : '#EF4444');
  const trackClr =
    document.documentElement.dataset.theme === 'light'
      ? 'rgba(0,0,0,0.08)'
      : 'rgba(255,255,255,0.05)';
  return `
    <div class="score-svg" style="width:${size}px;height:${size}px;position:relative;">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${trackClr}" stroke-width="${strokeW}"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${strokeW}"
          stroke-linecap="round"
          stroke-dasharray="${dash} ${circ - dash}"
          style="transition: stroke-dasharray 1s ease; filter: drop-shadow(0 0 6px ${color}55)"/>
      </svg>
      <div class="score-svg-val" style="color:${color};font-size:${size > 60 ? '18' : '14'}px;">${value}</div>
    </div>`;
}

// ════════════════════════════════════════════════════
//  VIEW: DASHBOARD
// ════════════════════════════════════════════════════
async function renderDashboard() {
  const [sessions, stats] = await Promise.all([MockAPI.getSessions(), MockAPI.getStats()]);
  const recent = sessions.filter((s) => s.status === 'COMPLETED').slice(0, 3);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  document.getElementById('view-container').innerHTML = `
    <div>
      <div class="page-header">
        <div class="greeting">${greeting}, Kundalik 👋</div>
        <div class="greeting-date">${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
      </div>
      <div class="page-content">

        <div class="stats-grid">
          <div class="stat-card purple">
            <div class="stat-label">Total Sessions</div>
            <div class="stat-value purple">${stats.totalSessions}</div>
            <div class="stat-sub">${stats.completedSessions} completed</div>
          </div>
          <div class="stat-card blue">
            <div class="stat-label">Average Score</div>
            <div class="stat-value blue">${stats.avgScore}</div>
            <div class="stat-sub">out of 10</div>
          </div>
          <div class="stat-card teal">
            <div class="stat-label">Best Category</div>
            <div class="stat-value teal" style="font-size:18px;margin-top:10px;">${stats.bestCategory}</div>
            <div class="stat-sub">Score: ${stats.bestScore}/10</div>
          </div>
          <div class="stat-card pink">
            <div class="stat-label">Study Streak</div>
            <div class="stat-value pink">${stats.studyStreakDays}</div>
            <div class="stat-sub">days in a row 🔥</div>
          </div>
        </div>

        <div class="dashboard-grid">
          <div>
            <div class="quick-start-card">
              <div class="quick-start-title">Ready for your next session?</div>
              <div class="quick-start-sub">Practice makes perfect. Pick a package and start a mock interview — your AI tutor is waiting.</div>
              <button class="btn btn-primary btn-lg" onclick="navigate('new-interview')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Start Interview
              </button>
            </div>

            <div class="recent-sessions-title">
              <span>Recent Sessions</span>
              <button class="btn btn-secondary btn-sm" onclick="navigate('history')">View all →</button>
            </div>
            ${recent
              .map(
                (s) => `
              <div class="session-row" onclick="navigate('analysis', {analysisId:'${s.analysisId}'})">
                <div class="tutor-avatar" style="background:${tutorColor(s.tutorSlug)}">${tutorInitials(s.tutorSlug)}</div>
                <div class="session-meta">
                  <div class="session-pkg">${s.packageName}</div>
                  <div class="session-info">with ${s.tutorName} · ${fmtDate(s.startedAt)} · ${fmtDuration(s.durationSec)}</div>
                </div>
                <div class="session-score-wrap">
                  <div class="score-chip ${scoreClass(s.score)}">${s.score}</div>
                  <span class="badge ${statusBadge(s.status)}">${s.status}</span>
                </div>
              </div>
            `,
              )
              .join('')}
          </div>

          <div>
            <div class="tip-card mb-16">
              <div class="tip-label">💡 Today's Tip</div>
              <div class="tip-text">Use the STAR method for every behavioral question — Situation, Task, Action, Result. Quantify your Result whenever possible.</div>
            </div>
            <div class="streak-card mb-16">
              <div class="streak-icon">🔥</div>
              <div class="streak-num">${stats.studyStreakDays}</div>
              <div class="streak-label">Day Streak</div>
              <div class="text-xs text-muted mt-8">Keep going — don't break the chain!</div>
            </div>
            <div class="card card-p">
              <div class="fw-600 mb-8" style="font-size:13px;">Quick Stats</div>
              <div style="display:flex;flex-direction:column;gap:8px;">
                <div style="display:flex;justify-content:space-between;font-size:13px;">
                  <span class="text-muted">Total practice time</span>
                  <span class="fw-600">${stats.totalMinutes} min</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:13px;">
                  <span class="text-muted">Sessions this week</span>
                  <span class="fw-600">4</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:13px;">
                  <span class="text-muted">Improvement vs last week</span>
                  <span class="fw-600" style="color:var(--success)">+0.8 pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ════════════════════════════════════════════════════
//  VIEW: NEW INTERVIEW (Wizard)
// ════════════════════════════════════════════════════
async function renderNewInterview() {
  const [packages, tutors] = await Promise.all([MockAPI.getPackages(), MockAPI.getTutors()]);
  State.wizardStep = 1;

  function stepsHTML(step) {
    return `
      <div class="wizard-steps">
        <div class="step-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}">
          <div class="step-num">${step > 1 ? '✓' : '1'}</div>
          <div class="step-label">Choose Package</div>
        </div>
        <div class="step-sep"></div>
        <div class="step-item ${step >= 2 ? 'active' : ''}">
          <div class="step-num">2</div>
          <div class="step-label">Choose Tutor</div>
        </div>
        <div class="step-sep"></div>
        <div class="step-item ${step >= 3 ? 'active' : ''}">
          <div class="step-num">3</div>
          <div class="step-label">Start</div>
        </div>
      </div>`;
  }

  function step1HTML() {
    return `
      <div id="wizard-content">
        ${stepsHTML(1)}
        <div class="section-title">Select Interview Package</div>
        <div class="package-grid">
          ${packages
            .map(
              (pkg) => `
            <div class="package-card ${State.selectedPackage?.slug === pkg.slug ? 'selected' : ''} ${pkg.isPro && !pkg.isPro ? 'pro-locked' : ''}"
                 onclick="selectPackage('${pkg.slug}')">
              ${pkg.isPro ? '<div class="pro-badge-abs"><span class="badge badge-pro">PRO</span></div>' : '<div class="pkg-check">✓</div>'}
              <span class="pkg-icon">${pkg.icon}</span>
              <div class="pkg-name">${pkg.name}</div>
              <div class="pkg-desc">${pkg.description}</div>
              <div class="pkg-meta">
                <span class="badge ${diffBadge(pkg.difficulty)}">${pkg.difficulty}</span>
                <span class="badge badge-gray">${pkg.duration}</span>
                <span class="badge badge-gray">${pkg.questionCount} Qs</span>
              </div>
            </div>
          `,
            )
            .join('')}
        </div>
        <div class="wizard-nav">
          <button class="btn btn-secondary" onclick="navigate('dashboard')">← Back</button>
          <button class="btn btn-primary" onclick="goStep2()" ${!State.selectedPackage ? 'disabled style="opacity:0.4;cursor:not-allowed"' : ''}>
            Next: Choose Tutor →
          </button>
        </div>
      </div>`;
  }

  function step2HTML() {
    return `
      <div id="wizard-content">
        ${stepsHTML(2)}
        <div class="section-title">Select Your AI Tutor</div>
        <div class="tutor-grid">
          ${tutors
            .map(
              (t) => `
            <div class="tutor-card ${State.selectedTutor?.slug === t.slug ? 'selected' : ''} ${t.isPro ? 'pro-card' : ''}"
                 onclick="selectTutor('${t.slug}')">
              ${t.isPro ? '<div style="position:absolute;top:14px;right:14px"><span class="badge badge-pro">PRO</span></div>' : ''}
              <div class="tutor-check">✓</div>
              <div class="tutor-avatar-lg" style="background:${t.color}">${t.initials}</div>
              <div class="tutor-name">${t.name}</div>
              <div class="tutor-specialty">${t.specialty}</div>
              <div class="tutor-tags">
                ${t.personality.map((p) => `<span class="tutor-tag">${p}</span>`).join('')}
              </div>
              <div class="text-xs text-muted">${t.description}</div>
              <div class="divider"></div>
              <div class="tutor-stats">${t.sessionCount} sessions · Avg score ${t.avgScore}</div>
            </div>
          `,
            )
            .join('')}
        </div>
        <div class="wizard-nav">
          <button class="btn btn-secondary" onclick="goStep1()">← Back</button>
          <button class="btn btn-primary btn-lg" onclick="startSession()" ${!State.selectedTutor ? 'disabled style="opacity:0.4;cursor:not-allowed"' : ''}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Start Session
          </button>
        </div>
      </div>`;
  }

  document.getElementById('view-container').innerHTML = `
    <div>
      <div class="page-header">
        <div class="page-title">New Interview</div>
        <div class="page-subtitle">Set up your mock interview session</div>
      </div>
      <div class="page-content" id="wizard-root">
        ${step1HTML()}
      </div>
    </div>`;

  window.selectPackage = (slug) => {
    State.selectedPackage = packages.find((p) => p.slug === slug);
    document.getElementById('wizard-root').innerHTML = step1HTML();
    attachWizardGlobals(step1HTML, step2HTML, packages, tutors);
  };
  window.goStep2 = () => {
    if (!State.selectedPackage) return;
    State.wizardStep = 2;
    document.getElementById('wizard-root').innerHTML = step2HTML();
    attachWizardGlobals(step1HTML, step2HTML, packages, tutors);
  };
  window.goStep1 = () => {
    State.wizardStep = 1;
    document.getElementById('wizard-root').innerHTML = step1HTML();
    attachWizardGlobals(step1HTML, step2HTML, packages, tutors);
  };
  window.selectTutor = (slug) => {
    State.selectedTutor = tutors.find((t) => t.slug === slug);
    document.getElementById('wizard-root').innerHTML = step2HTML();
    attachWizardGlobals(step1HTML, step2HTML, packages, tutors);
  };
  window.startSession = async () => {
    if (!State.selectedPackage || !State.selectedTutor) return;
    const btn = document.querySelector('.btn-primary.btn-lg');
    if (btn) {
      btn.textContent = 'Connecting…';
      btn.disabled = true;
    }
    await MockAPI.startSession(State.selectedPackage, State.selectedTutor);
    navigate('session');
  };
}

function attachWizardGlobals(s1fn, s2fn, packages, tutors) {}

// ════════════════════════════════════════════════════
//  VIEW: SESSION
// ════════════════════════════════════════════════════
async function renderSession() {
  const pkg = State.selectedPackage || { name: 'Behavioral', icon: '🧠', questionCount: 8 };
  const tutor = State.selectedTutor || {
    name: 'Priya',
    initials: 'PR',
    color: '#EC4899',
    slug: 'priya',
  };
  const transcript = State.data.transcript_demo;

  State.sessionSeconds = 0;
  State.sessionMicOn = true;
  State.transcriptIndex = 0;

  document.getElementById('view-container').innerHTML = `
    <div class="session-layout">
      <div class="session-topbar">
        <div class="session-pkg-label">
          <span>${pkg.icon || '🎯'}</span>
          <span>${pkg.name} Interview</span>
          <span class="badge badge-blue">LIVE</span>
        </div>
        <div class="session-timer" id="session-timer">00:00</div>
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="session-q-counter" id="q-counter">Question 1 of ${pkg.questionCount || 8}</div>
          <button class="btn btn-danger" onclick="endSession()">End Interview</button>
        </div>
      </div>

      <div class="session-body">
        <div class="session-stage">
          <div class="session-stage-bg"></div>
          <div class="tutor-bubble speaking" id="tutor-bubble" style="background:${tutor.color}">
            ${tutor.initials}
          </div>
          <div class="waveform" id="waveform">
            ${Array(9)
              .fill(0)
              .map(() => '<div class="wave-bar"></div>')
              .join('')}
          </div>
          <div class="session-status" id="session-status">
            <span class="status-dot-animated"></span>Speaking…
          </div>
          <button class="mic-btn" id="mic-btn" onclick="toggleMic()" title="Toggle mic">🎤</button>
        </div>

        <div class="transcript-panel">
          <div class="transcript-header">Live Transcript</div>
          <div class="transcript-body" id="transcript-body"></div>
        </div>
      </div>
    </div>`;

  State.sessionTimer = setInterval(() => {
    State.sessionSeconds++;
    const el = document.getElementById('session-timer');
    if (el) el.textContent = fmtTime(State.sessionSeconds);
  }, 1000);

  const statuses = ['Speaking…', 'Listening…', 'Thinking…', 'Speaking…'];
  let si = 0;
  const statusInterval = setInterval(() => {
    const el = document.getElementById('session-status');
    const bubble = document.getElementById('tutor-bubble');
    if (!el) {
      clearInterval(statusInterval);
      return;
    }
    si = (si + 1) % statuses.length;
    const s = statuses[si];
    el.innerHTML = `<span class="status-dot-animated"></span>${s}`;
    if (bubble) bubble.classList.toggle('speaking', s === 'Speaking…');
  }, 3500);

  let msgCount = 0;
  const addMsg = (msg) => {
    const body = document.getElementById('transcript-body');
    if (!body) return;
    const color = msg.role === 'tutor' ? tutor.color : '#7C3AED';
    const initials = msg.role === 'tutor' ? tutor.initials : 'K';
    const div = document.createElement('div');
    div.className = `msg ${msg.role}`;
    div.innerHTML = `
      <div class="msg-avatar" style="background:${color}">${initials}</div>
      <div>
        <div class="msg-bubble">${msg.text}</div>
        <div class="msg-time">${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
      </div>`;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    if (msg.role === 'tutor' && msgCount < pkg.questionCount) {
      msgCount++;
      const counter = document.getElementById('q-counter');
      if (counter)
        counter.textContent = `Question ${Math.min(msgCount, pkg.questionCount)} of ${pkg.questionCount}`;
    }
  };

  State.transcriptInterval = setInterval(() => {
    if (State.transcriptIndex < transcript.length) {
      addMsg(transcript[State.transcriptIndex]);
      State.transcriptIndex++;
    } else {
      clearInterval(State.transcriptInterval);
    }
  }, 4000);

  addMsg(transcript[0]);
  State.transcriptIndex = 1;

  window.toggleMic = () => {
    State.sessionMicOn = !State.sessionMicOn;
    const btn = document.getElementById('mic-btn');
    const wave = document.getElementById('waveform');
    if (btn) {
      btn.textContent = State.sessionMicOn ? '🎤' : '🔇';
      btn.classList.toggle('muted', !State.sessionMicOn);
    }
    if (wave) {
      wave.classList.toggle('idle', !State.sessionMicOn);
    }
    toast(
      State.sessionMicOn ? 'Microphone on' : 'Microphone muted',
      State.sessionMicOn ? 'success' : 'info',
    );
  };

  window.endSession = async () => {
    const btn = document.querySelector('.btn-danger');
    if (btn) {
      btn.textContent = 'Ending…';
      btn.disabled = true;
    }
    clearSessionTimers();
    await MockAPI.endSession(State.activeSessionId);
    toast('Session ended. Generating analysis…', 'success');
    setTimeout(() => {
      toast('🔄 Analyzing your communication patterns…', 'info', 4000);
      setTimeout(() => {
        const commToastEl = document.createElement('div');
        commToastEl.className = 'toast success';
        commToastEl.innerHTML =
          "✅ Communication analysis ready &nbsp;<button onclick=\"navigate('analysis',{analysisId:'anal_001'});this.closest('.toast').remove()\" style=\"background:none;border:none;color:inherit;font-weight:700;cursor:pointer;text-decoration:underline;\">View →</button>";
        document.getElementById('toast-container').appendChild(commToastEl);
        setTimeout(() => commToastEl.remove(), 6000);
      }, 2000);
    }, 1200);
    setTimeout(() => navigate('analysis', { analysisId: 'anal_001' }), 1000);
  };
}

function clearSessionTimers() {
  if (State.sessionTimer) {
    clearInterval(State.sessionTimer);
    State.sessionTimer = null;
  }
  if (State.transcriptInterval) {
    clearInterval(State.transcriptInterval);
    State.transcriptInterval = null;
  }
}

// ── AI Response Engine ─────────────────────────────
function getAIResponse(userText) {
  const t = userText.toLowerCase();
  const { sessions, analysis, stats } = State.data;
  const completed = (sessions || []).filter((s) => s.status === 'COMPLETED');
  const latest = completed[0];
  const latestAnal = latest && analysis[latest.analysisId];

  if (
    /last.*(session|interview)|recent.*session|how did i do|review.*session|my.*performance/.test(t)
  ) {
    if (!latest)
      return {
        text: "You haven't completed any sessions yet! Let's start your first one.",
        actions: [{ label: 'Start First Session', view: 'new-interview' }],
      };
    return {
      text: `Your most recent session was **${latest.packageName}** with **${latest.tutorName}** on ${fmtDate(latest.startedAt)}.\n\n**Overall Score: ${latest.score}/10**\n\n${latestAnal ? `**Score breakdown:**\n- Communication: ${latestAnal.scores.communication}/10\n- Technical: ${latestAnal.scores.technical}/10\n- Problem Solving: ${latestAnal.scores.problemSolving}/10\n- Confidence: ${latestAnal.scores.confidence}/10\n\n**Top strength:** ${latestAnal.strengths[0]}\n\n**Key improvement:** ${latestAnal.improvements[0]}` : ''}\n\nWant the full analysis or tips on what to practice next?`,
      actions: [
        {
          label: 'View Full Analysis',
          view: 'analysis',
          params: { analysisId: latest.analysisId },
        },
        { label: 'What to Practice Next', trigger: 'What should I focus on improving?' },
      ],
    };
  }

  if (/improv|weakness|weak|focus on|work on|get better|practice more|what.*should i/.test(t)) {
    const recentImprove = [
      ...new Set(completed.slice(0, 3).flatMap((s) => analysis[s.analysisId]?.improvements || [])),
    ].slice(0, 4);
    return {
      text: `Based on your last **${Math.min(completed.length, 3)} sessions**, here are your prioritized improvement areas:\n\n${recentImprove.map((imp, i) => `**${i + 1}.** ${imp}`).join('\n\n')}\n\n**My recommendation:** Tackle behavioral quantification first — highest ROI. Then focus on DSA optimization patterns (sliding window, two pointers). Your base scores are solid; these refinements will push you to 8.5+ average.`,
      actions: [
        { label: 'Start Behavioral Session', view: 'new-interview' },
        { label: 'View History', view: 'history' },
      ],
    };
  }

  if (/stat|progress|overview|overall.*score|my score|streak|how am i doing/.test(t)) {
    return {
      text: `**Your iPrep Progress Overview:**\n\nSessions: ${stats.totalSessions} total, ${stats.completedSessions} completed\nAverage Score: ${stats.avgScore}/10\nBest Category: ${stats.bestCategory} (${stats.bestScore}/10)\nStudy Streak: ${stats.studyStreakDays} days\nTotal Practice: ${stats.totalMinutes} minutes\n\n**Trend:** +0.8 pts improvement vs last week.\n\n**Next milestone:** Hit 8.0 average — you're only ${(8.0 - stats.avgScore).toFixed(1)} pts away. At this pace, that's 2 more focused sessions.`,
      actions: [
        { label: 'View All Sessions', view: 'history' },
        { label: 'Start a Session', view: 'new-interview' },
      ],
    };
  }

  if (/new.*interview|start.*session|want.*practice|let.*start|begin.*interview|schedule/.test(t)) {
    return {
      text: `Let's get you into a session! Based on your scores, here are the highest-ROI options right now:\n\n**1. Behavioral** — Aim for 9.0 (currently 8.2). Practice quantifying impact.\n**2. DSA** — Biggest gap (6.8). Focus on sliding window patterns.\n**3. System Design** — Score 7.5. Add rate limiting + observability to every design.\n\n**Quick pick:** 30 minutes? Behavioral. 60 minutes? DSA with Alex.\n\nClick below to set up your session:`,
      actions: [{ label: 'Start Interview Now', view: 'new-interview' }],
    };
  }

  if (/dsa|algorithm|leetcode|data structure|sliding window|two pointer|dynamic.*program/.test(t)) {
    const dsaSessions = completed.filter((s) => s.packageSlug === 'dsa');
    const avgDSA = dsaSessions.length
      ? (dsaSessions.reduce((a, s) => a + s.score, 0) / dsaSessions.length).toFixed(1)
      : 'N/A';
    return {
      text: `**DSA Performance — ${dsaSessions.length} sessions, avg ${avgDSA}/10:**\n\n**Your strengths:** Tree DFS/BFS, brute-force identification, edge case awareness for arrays.\n\n**What needs work:**\n- Sliding window pattern (missed in your last DSA session)\n- Space complexity trade-offs (never mentioned)\n- Hash map optimization: O(n2) to O(n)\n\n**7-day plan:**\n- Days 1-2: 10 Sliding Window problems (Easy to Medium)\n- Days 3-4: 8 Two Pointer problems\n- Day 5: 6 HashMap pattern problems\n- Days 6-7: Full 60-min mock session with Alex\n\n**One tip:** Before every problem, state the pattern name + target complexity. If you cannot name it, study it first.`,
      actions: [
        { label: 'Start DSA Session', view: 'new-interview' },
        { label: 'View DSA Analysis', view: 'analysis', params: { analysisId: 'anal_002' } },
      ],
    };
  }

  if (/behavioral|star method|leadership|conflict|teamwork|story/.test(t)) {
    return {
      text: `**Behavioral Interview — your strongest category (8.2/10):**\n\n**What's working:**\n- Consistent STAR framework across all answers\n- Specific, memorable stories (the hackathon story was excellent)\n- Strong emotional intelligence in conflict scenarios\n- Good voice confidence and energy\n\n**To get to 9.0+:**\n- Quantify every result: not "we improved performance" but "latency dropped 40%, crash rate went from daily to zero"\n- Cut answer length by 15 seconds (aim for 60-75s, not 90s)\n- Your weakness answer sounds rehearsed — prepare a more authentic, specific version\n\n**Quick drill:** Take 3 past stories. Add a specific number to each result. Practice saying them in 60 seconds.`,
      actions: [
        { label: 'Practice Behavioral', view: 'new-interview' },
        { label: 'View Analysis', view: 'analysis', params: { analysisId: 'anal_001' } },
      ],
    };
  }

  if (/system design|architecture|scalab|distributed|design.*system|url.*shortener/.test(t)) {
    return {
      text: `**System Design — 7.5/10 with Morgan:**\n\n**Your instincts are solid:**\n- CDN + load balancer identified upfront\n- Asked clarifying requirements first (Morgan loves this)\n- DynamoDB choice well-justified\n\n**The 3 gaps that cost you roughly 1 point each:**\n\n**1. Rate Limiting** — Every public API needs it. Use token bucket: 100 reads/min per IP, 10 writes/min per user.\n\n**2. Cache Eviction Policy** — You said "use a cache" but not LRU vs LFU. For URL shorteners, LFU keeps popular URLs warm.\n\n**3. Observability** — Morgan's rule: always answer "how would you know this is broken at 3am?" Metrics, logs, alerting.\n\n**These 3 items guarantee 8.5+.**`,
      actions: [
        { label: 'Practice System Design', view: 'new-interview' },
        { label: 'View Analysis', view: 'analysis', params: { analysisId: 'anal_003' } },
      ],
    };
  }

  if (/hr|salary|negotiat|culture fit|offer|career goal/.test(t)) {
    return {
      text: `**HR Round — your best score: 9.0/10!**\n\nPriya said your answers felt authentic, not rehearsed. That's rare and valuable.\n\n**What you're already doing right:**\n- Clear, honest career goals\n- Good salary anchoring (you set the range first)\n- Positive framing even for difficult questions\n\n**Minor refinements:**\n- Have a specific "why this company" prepared for each application\n- Prepare 3 thoughtful questions to ask the interviewer\n- Practice the "tell me about yourself" to exactly 90 seconds\n\n**Verdict:** HR is your competitive advantage. Maintain it while closing the technical gaps.`,
      actions: [{ label: 'Practice HR Round', view: 'new-interview' }],
    };
  }

  if (/\balex\b/.test(t)) {
    return {
      text: `**About Alex — Technical and DSA specialist:**\n\nDirect, challenging, no-nonsense. Alex doesn't sugarcoat. He'll push you until you find the optimal solution — or admit you don't know it.\n\n**Your record with Alex:**\n- DSA Session 1: 6.8/10\n- DSA Session 2: 6.2/10\n- Technical Session: 7.1/10\n\n**What Alex rewards:**\n- Stating pattern name + optimal complexity before coding\n- Discussing space vs time trade-offs proactively\n- Clean verbalization of thought process\n\n**Alex's golden rule:** "If you cannot name the pattern, you haven't mastered it."`,
      actions: [{ label: 'Session with Alex', view: 'new-interview' }],
    };
  }

  if (/\bpriya\b/.test(t)) {
    return {
      text: `**About Priya — Behavioral and HR specialist:**\n\nWarm and supportive but rigorous. She'll probe your STAR answers with follow-up questions until they're airtight.\n\n**Your record with Priya:**\n- Behavioral: 8.2/10\n- HR Round: 9.0/10\n\n**Priya's focus:** Authentic storytelling, STAR structure, emotional intelligence in conflict scenarios.\n\n**Priya's tip:** "The best behavioral answer is a story you've actually lived. Don't construct — recall."`,
      actions: [{ label: 'Session with Priya', view: 'new-interview' }],
    };
  }

  if (/communication|filler|words|um.*filler|basically.*filler|like.*filler/.test(t)) {
    const latest = completed[0];
    const ca = latest && latestAnal?.communicationAnalysis;
    if (!ca)
      return {
        text: `I don't have communication analysis data yet. Complete a session and the analysis will run automatically!\n\nYour top filler words to watch: **"like"**, **"basically"**, **"um"**, **"kind of"**.\n\nTry replacing them with: *such as*, *in essence*, *(silent pause)*, *to some extent*.`,
        actions: [
          { label: 'Start a Session', view: 'new-interview' },
          { label: 'View Communication Coach', view: 'communication' },
        ],
      };
    const top3 = ca.fillerWordStats
      .slice(0, 3)
      .map((f) => `- **"${f.word}"** — ${f.count}× (${f.severity} severity)`)
      .join('\n');
    const rep = ca.topReplacements[0];
    return {
      text: `**Your Communication Analysis — ${latest.packageName} session:**\n\nCommunication Score: **${ca.overallCommunicationScore}/10**\n\n**Top 3 filler words:**\n${top3}\n\n**Quick win:** Replace **"${rep.original}"** with **${rep.betterAlternatives.slice(0, 2).join(' or ')}**.\n\nExample: ${rep.exampleInContext}\n\nVisit the Communication Coach for your lifetime stats and a practice drill.`,
      actions: [
        { label: 'View Communication Coach', view: 'communication' },
        {
          label: 'View Full Analysis',
          view: 'analysis',
          params: { analysisId: latest.analysisId },
        },
      ],
    };
  }

  if (/sentence.*rewrite|rewrite|express|articulate|professional.*word|how.*sound/.test(t)) {
    const latest = completed[0];
    const ca = latest && latestAnal?.communicationAnalysis;
    if (!ca || !ca.sentenceRewrites?.length)
      return {
        text: `**Pro tip: pause instead of filler words.**\n\nWhen you feel the urge to say "um" or "basically", take a **deliberate 1-2 second pause** instead. Silence reads as confidence to interviewers.\n\n**One sentence rewrite drill:**\n- ❌ "So basically I kind of just figured it out"\n- ✅ "I identified the root cause and implemented a targeted fix"\n\nPause. Name the action. State the result.`,
        actions: [{ label: 'View Communication Coach', view: 'communication' }],
      };
    const rw = ca.sentenceRewrites[0];
    return {
      text: `**Sentence rewrite from your last session:**\n\n❌ You said:\n"${rw.original}"\n\n✅ Stronger version:\n"${rw.rewritten}"\n\n💡 *${rw.improvement}*\n\n**Core drill:** Before each answer, pause 1 second. Commit to the first word being a strong verb or your name: "I led...", "I built...", "The result was...". Fillers disappear when you start with intention.`,
      actions: [
        { label: 'View Communication Coach', view: 'communication' },
        { label: 'Practice Now', view: 'new-interview' },
      ],
    };
  }

  if (/\bmorgan\b/.test(t)) {
    return {
      text: `**About Morgan — System Design and PM specialist (Pro):**\n\nMethodical and strategic. Expects you to think at scale before you design. Will ask about trade-offs, failure modes, and operational concerns that most candidates ignore.\n\n**Your record with Morgan:**\n- System Design: 7.5/10\n- PM Round: 7.9/10\n\n**Morgan's checklist:** Functional requirements — Non-functional — Core components — Failure modes — Monitoring.\n\n**Morgan's tip:** "Before any design, ask: what are the top 3 ways this fails at 10x scale?"`,
      actions: [{ label: 'Session with Morgan', view: 'new-interview' }],
    };
  }

  return {
    text: `I'm your **iPrep AI Assistant** — I have full context of your interview history, scores, and analysis.\n\nHere's what I can help with:\n\n- **Session reviews** — "How did my last behavioral session go?"\n- **Improvement planning** — "What should I focus on?"\n- **Progress tracking** — "Show me my overall stats"\n- **Session setup** — "I want to start a new interview"\n- **Topic deep-dives** — "Give me DSA tips" or "Tell me about Alex"\n\nWhat would you like to explore?`,
    actions: [
      { label: 'My Progress', trigger: 'Show me my overall stats and progress' },
      {
        label: 'What to Improve',
        trigger: 'What should I focus on improving based on my sessions?',
      },
      { label: 'Start Interview', view: 'new-interview' },
    ],
  };
}

function formatAIText(text) {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+?)\*/g, '<em>$1</em>');

  const paras = html.split('\n\n');
  return paras
    .map((para) => {
      const lines = para.split('\n');
      const isList =
        lines.length > 1 && lines.every((l) => /^[-•]\s/.test(l) || /^\d+\.\s/.test(l));
      if (isList) {
        const items = lines
          .map((l) => `<li>${l.replace(/^[-•]\s+/, '').replace(/^\d+\.\s+/, '')}</li>`)
          .join('');
        return `<ul>${items}</ul>`;
      }
      return `<p>${lines.join('<br>')}</p>`;
    })
    .join('');
}

function convTimeLabel(isoStr) {
  const d = new Date(isoStr);
  const now = new Date();
  const diff = (now - d) / 86400000;
  if (diff < 1) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  if (diff < 2) return 'Yesterday';
  if (diff < 7) return d.toLocaleDateString('en-IN', { weekday: 'short' });
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function groupConvsByDate(convs) {
  const groups = { Today: [], Yesterday: [], 'Last 7 days': [], Earlier: [] };
  const now = new Date();
  convs.forEach((c) => {
    const diff = (now - new Date(c.updatedAt)) / 86400000;
    if (diff < 1) groups['Today'].push(c);
    else if (diff < 2) groups['Yesterday'].push(c);
    else if (diff < 7) groups['Last 7 days'].push(c);
    else groups['Earlier'].push(c);
  });
  return groups;
}

function renderConvListHTML(convs, activeId) {
  const groups = groupConvsByDate(convs);
  let html = '';
  for (const [label, items] of Object.entries(groups)) {
    if (!items.length) continue;
    html += `<div class="conv-group-label">${label}</div>`;
    items.forEach((c) => {
      const lastMsg = c.messages[c.messages.length - 1];
      const preview = lastMsg ? lastMsg.text.replace(/\*\*/g, '').slice(0, 55) + '...' : '';
      html += `
        <div class="conv-item ${c.id === activeId ? 'active' : ''}" onclick="selectConversation('${c.id}')">
          <div class="conv-item-title">${c.title}</div>
          <div class="conv-item-preview">${preview}</div>
          <div class="conv-item-time">${convTimeLabel(c.updatedAt)}</div>
        </div>`;
    });
  }
  return (
    html ||
    '<div style="padding:16px;font-size:12px;color:var(--text-faint);text-align:center;">No conversations yet</div>'
  );
}

function renderMessagesHTML(messages) {
  // Initialize global action registry if needed
  window._chatActions = window._chatActions || {};

  return messages
    .map((msg) => {
      const isAI = msg.role === 'ai';
      let actionsHTML = '';
      if ((msg.actions || []).length) {
        const btns = msg.actions
          .map((a) => {
            const actionId = 'ca_' + Math.random().toString(36).slice(2);
            window._chatActions[actionId] = a;
            return `<button class="chat-action-btn" onclick="handleChatAction('${actionId}')">${a.label}</button>`;
          })
          .join('');
        actionsHTML = `<div class="chat-actions">${btns}</div>`;
      }
      if (isAI) {
        return `
        <div class="chat-msg ai">
          <div class="ai-avatar">iP</div>
          <div class="chat-bubble-wrap">
            <div class="chat-bubble">${formatAIText(msg.text)}</div>
            ${actionsHTML}
            <div class="chat-msg-time">${new Date(msg.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>`;
      }
      return `
      <div class="chat-msg user">
        <div class="user-chat-avatar">K</div>
        <div class="chat-bubble-wrap">
          <div class="chat-bubble">${msg.text}</div>
          <div class="chat-msg-time">${new Date(msg.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>`;
    })
    .join('');
}

// ════════════════════════════════════════════════════
//  VIEW: CHAT
// ════════════════════════════════════════════════════
async function renderChat(convId) {
  const convs = await MockAPI.getConversations();
  const activeId = convId || State.currentConvId || null;
  const activeConv = activeId ? convs.find((c) => c.id === activeId) : null;
  State.currentConvId = activeId;

  // Reset action registry on each render
  window._chatActions = {};

  const suggestions = [
    'How did my last session go?',
    'What should I focus on improving?',
    'Show me my progress overview',
    'Give me DSA practice tips',
    'I want to start a new interview',
  ];

  document.getElementById('view-container').innerHTML = `
    <div class="chat-layout">
      <div class="chat-topbar">
        <div class="chat-topbar-copy">
          <div class="chat-topbar-title">iPrep AI Assistant</div>
          <div class="chat-topbar-meta">Ask anything about your interview prep</div>
        </div>
        <div class="chat-topbar-actions">
          <button class="new-chat-btn" onclick="createNewChat()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Chat
          </button>
        </div>
      </div>

      <div class="chat-body">
        <!-- Conversation list -->
        <div class="conv-sidebar">
          <div class="conv-list" id="conv-list">
            ${renderConvListHTML(convs, activeId)}
          </div>
        </div>

        <!-- Chat area -->
        <div class="chat-area">
        ${
          activeConv
            ? `
          <div class="chat-messages" id="chat-messages">
            ${renderMessagesHTML(activeConv.messages)}
          </div>
        `
            : `
          <div class="chat-messages" id="chat-messages">
            <div class="chat-empty">
              <div class="chat-empty-logo">iP</div>
              <div class="chat-empty-title">Your AI Interview Coach</div>
              <div class="chat-empty-sub">I know your full history — sessions, scores, weaknesses, and strengths. Ask me anything.</div>
              <div class="chat-suggestions">
                ${suggestions.map((s) => `<button class="chat-suggestion-chip" onclick="handleSuggestion(this)">${s}</button>`).join('')}
              </div>
            </div>
          </div>
        `
        }
          <div class="chat-input-bar">
            <div class="chat-input-wrap">
              <textarea class="chat-textarea" id="chat-input" placeholder="Ask about your sessions, get tips, or start a new interview..." rows="1"></textarea>
              <button class="chat-send-btn" id="chat-send" onclick="sendChatMessage()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
            <div class="chat-input-hint">Stored in local database &middot; Powered by iPrep AI</div>
          </div>
        </div>
      </div>
    </div>`;

  // Wire textarea auto-resize + enter-to-send
  const textarea = document.getElementById('chat-input');
  if (textarea) {
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 160) + 'px';
    });
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });
    textarea.focus();
  }

  // Scroll messages to bottom
  const msgEl = document.getElementById('chat-messages');
  if (msgEl && activeConv) msgEl.scrollTop = msgEl.scrollHeight;

  // Wire global handlers
  window.selectConversation = async (id) => {
    State.currentConvId = id;
    await renderChat(id);
  };

  window.createNewChat = async () => {
    State.currentConvId = null;
    const welcomeMsg = {
      text: "Hi Kundalik! I'm your iPrep AI Assistant. I have full context of your interview history, scores, and analysis.\n\nWhat would you like to explore today?",
      actions: [
        { label: 'My Progress', trigger: 'Show me my overall stats and progress' },
        { label: 'What to Improve', trigger: 'What should I focus on improving?' },
        { label: 'Start Interview', view: 'new-interview' },
      ],
    };
    const newConv = await MockAPI.createConversation('New conversation', welcomeMsg);
    State.currentConvId = newConv.id;
    await renderChat(newConv.id);
  };

  window.handleSuggestion = async (el) => {
    const text = el.textContent;
    const input = document.getElementById('chat-input');
    if (input) input.value = text;
    await sendChatMessage();
  };

  window.handleChatAction = async (id) => {
    const action = window._chatActions[id];
    if (!action) return;
    if (action.view) {
      navigate(action.view, action.params || {});
    } else if (action.trigger) {
      const input = document.getElementById('chat-input');
      if (input) input.value = action.trigger;
      await sendChatMessage();
    }
  };

  window.sendChatMessage = async () => {
    const input = document.getElementById('chat-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    input.style.height = 'auto';

    // Create conversation if none active
    if (!State.currentConvId) {
      const titleKeywords = {
        interview: 'Interview planning',
        dsa: 'DSA prep tips',
        behavioral: 'Behavioral feedback',
        system: 'System design review',
        improv: 'Improvement plan',
        stat: 'Progress overview',
        hr: 'HR round tips',
      };
      let title = text.slice(0, 38) + (text.length > 38 ? '...' : '');
      for (const [kw, t] of Object.entries(titleKeywords)) {
        if (text.toLowerCase().includes(kw)) {
          title = t;
          break;
        }
      }
      const welcomeMsg = { text: '...', actions: [] };
      const newConv = await MockAPI.createConversation(title, welcomeMsg);
      State.currentConvId = newConv.id;
      newConv.messages = []; // clear placeholder so first msg is from user
    }

    const convId = State.currentConvId;
    const conv = (State.data.conversations || []).find((c) => c.id === convId);
    if (!conv) return;

    // Add user message to state immediately
    const userMsg = {
      id: 'cmsg_' + Date.now(),
      role: 'user',
      text,
      ts: new Date().toISOString(),
      actions: [],
    };
    conv.messages.push(userMsg);
    conv.updatedAt = new Date().toISOString();

    // Update title from first user message if it was a new conv with empty messages
    if (conv.messages.length === 1) {
      conv.title = text.slice(0, 38) + (text.length > 38 ? '...' : '');
    }

    // Re-render messages + show typing indicator
    const msgContainer = document.getElementById('chat-messages');
    if (msgContainer) {
      msgContainer.innerHTML = renderMessagesHTML(conv.messages);
      // Add typing indicator
      const typingEl = document.createElement('div');
      typingEl.className = 'typing-indicator';
      typingEl.id = 'typing-indicator';
      typingEl.innerHTML = `
        <div class="ai-avatar">iP</div>
        <div class="typing-dots">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>`;
      msgContainer.appendChild(typingEl);
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }

    // Update conv list
    const convListEl = document.getElementById('conv-list');
    if (convListEl) {
      const allConvs = await MockAPI.getConversations();
      convListEl.innerHTML = renderConvListHTML(allConvs, convId);
    }

    // Get AI response after simulated delay
    const aiResp = getAIResponse(text);
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 900));

    // Add AI message to state
    const aiMsg = {
      id: 'cmsg_' + Date.now(),
      role: 'ai',
      text: aiResp.text,
      ts: new Date().toISOString(),
      actions: aiResp.actions || [],
    };
    conv.messages.push(aiMsg);
    conv.updatedAt = new Date().toISOString();

    // Remove typing indicator, append AI message
    if (msgContainer) {
      const typing = document.getElementById('typing-indicator');
      if (typing) typing.remove();
      const wrapper = document.createElement('div');
      wrapper.innerHTML = renderMessagesHTML([aiMsg]);
      const child = wrapper.firstElementChild;
      if (child) msgContainer.appendChild(child);
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }

    // Update conv list again with new preview
    if (convListEl) {
      const allConvs = await MockAPI.getConversations();
      convListEl.innerHTML = renderConvListHTML(allConvs, convId);
    }
  };
}

// ════════════════════════════════════════════════════
//  VIEW: ANALYSIS
// ════════════════════════════════════════════════════
async function renderAnalysis(analysisId) {
  const data = await MockAPI.getAnalysis(analysisId || 'anal_001');
  if (!data) {
    document.getElementById('view-container').innerHTML = `
      <div class="page-content"><div class="empty-state"><div class="empty-icon">📊</div><div class="empty-title">Analysis not found</div></div></div>`;
    return;
  }

  const session = (State.data.sessions || []).find((s) => s.id === data.sessionId) || {};
  const sc = data.scores;

  document.getElementById('view-container').innerHTML = `
    <div>
      <div class="page-header">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;">
          <div>
            <div class="page-title">${session.packageName || 'Behavioral'} Analysis</div>
            <div class="page-subtitle" style="margin-top:4px;">
              with ${session.tutorName || 'Priya'} · ${fmtDate(session.startedAt || new Date())} · ${fmtDuration(session.durationSec || 1920)}
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:10px;margin-top:4px;">
            <span class="badge badge-purple">Analyzed by ${data.provider}</span>
            <button class="btn btn-secondary btn-sm" onclick="exportAnalysis()">Export PDF</button>
          </div>
        </div>
      </div>
      <div class="page-content">

        <div class="scores-grid mb-24">
          <div class="score-ring-wrap overall">
            ${scoreRing(sc.overall, 10, 88, 7, '#7C3AED')}
            <div class="score-label fw-600">Overall</div>
          </div>
          <div class="score-ring-wrap">
            ${scoreRing(sc.communication, 10, 72, 6)}
            <div class="score-label">Communication</div>
          </div>
          <div class="score-ring-wrap">
            ${scoreRing(sc.technical, 10, 72, 6)}
            <div class="score-label">Technical</div>
          </div>
          <div class="score-ring-wrap">
            ${scoreRing(sc.problemSolving, 10, 72, 6)}
            <div class="score-label">Problem Solving</div>
          </div>
          <div class="score-ring-wrap">
            ${scoreRing(sc.confidence, 10, 72, 6)}
            <div class="score-label">Confidence</div>
          </div>
        </div>

        <div class="analysis-grid mb-24">
          <div class="card card-p">
            <div class="fw-600 mb-4" style="color:var(--success)">✓ Strengths</div>
            <div class="tag-list">
              ${data.strengths.map((s) => `<span class="tag tag-green">${s}</span>`).join('')}
            </div>
          </div>
          <div class="card card-p">
            <div class="fw-600 mb-4" style="color:var(--warning)">⚠ Improvements</div>
            <div class="tag-list">
              ${data.improvements.map((i) => `<span class="tag tag-amber">${i}</span>`).join('')}
            </div>
          </div>
        </div>

        <!-- Analysis section tabs -->
        <div class="tabs mb-16">
          <button class="tab-btn active" id="atab-answers" onclick="switchAnalysisTab('answers')">Answer Feedback</button>
          <button class="tab-btn" id="atab-report" onclick="switchAnalysisTab('report')">Full Report</button>
          ${data.communicationAnalysis ? `<button class="tab-btn" id="atab-comm" onclick="switchAnalysisTab('comm')">🗣️ Communication</button>` : ''}
        </div>

        <!-- Answers tab -->
        <div id="apanel-answers">
          ${data.answerFeedback
            .map(
              (fb, i) => `
            <div class="accordion-item" id="acc-${i}">
              <div class="accordion-head" onclick="toggleAccordion(${i})">
                <div class="accordion-q">${fb.question}</div>
                <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
                  <div class="score-chip ${scoreClass(fb.score)}">${fb.score}</div>
                  <span class="chevron">▼</span>
                </div>
              </div>
              <div class="accordion-body" id="acc-body-${i}">
                <div class="answer-block">
                  <div class="answer-label">Your Answer</div>
                  <div class="answer-text">"${fb.userAnswer}"</div>
                </div>
                <div class="divider" style="margin:10px 0;"></div>
                <div class="answer-block">
                  <div class="answer-label">AI Feedback</div>
                  <div class="feedback-text">${fb.feedback}</div>
                </div>
              </div>
            </div>
          `,
            )
            .join('')}
        </div>

        <!-- Report tab -->
        <div id="apanel-report" style="display:none;">
          <div class="report-section">
            <div class="report-content" id="report-content"></div>
          </div>
        </div>

        <!-- Communication tab -->
        ${
          data.communicationAnalysis
            ? `
        <div id="apanel-comm" style="display:none;">
          ${commAnalysisHTML(data.communicationAnalysis)}
        </div>`
            : ''
        }

        <div style="display:flex;gap:12px;margin-top:24px;">
          <button class="btn btn-primary" onclick="navigate('new-interview')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Practice Again
          </button>
          <button class="btn btn-secondary" onclick="navigate('history')">View All Sessions</button>
          <button class="btn btn-secondary" onclick="navigate('communication')">View Communication Coach →</button>
        </div>
      </div>
    </div>`;

  document.getElementById('report-content').textContent = data.report;

  window.switchAnalysisTab = (tab) => {
    ['answers', 'report', 'comm'].forEach((t) => {
      const btn = document.getElementById(`atab-${t}`);
      const panel = document.getElementById(`apanel-${t}`);
      if (btn) btn.classList.toggle('active', t === tab);
      if (panel) panel.style.display = t === tab ? '' : 'none';
    });
  };

  window.toggleAccordion = (i) => {
    const item = document.getElementById(`acc-${i}`);
    const body = document.getElementById(`acc-body-${i}`);
    if (!item || !body) return;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.accordion-item.open').forEach((el) => {
      el.classList.remove('open');
      el.querySelector('.accordion-body').classList.remove('open');
    });
    if (!isOpen) {
      item.classList.add('open');
      body.classList.add('open');
    }
  };

  window.exportAnalysis = () => {
    toast('Export to PDF coming soon!', 'info');
  };

  window.toggleAccordion(0);
}

function commAnalysisHTML(ca) {
  const maxCount = Math.max(...(ca.fillerWordStats || []).map((f) => f.count), 1);
  const fillerBars = (ca.fillerWordStats || [])
    .map((f) => {
      const alt = (ca.topReplacements || []).find(
        (r) => r.original === f.word || r.original.startsWith(f.word),
      );
      const altText = alt ? alt.betterAlternatives[0] : '—';
      return `
      <div class="comm-bar-row">
        <div class="comm-bar-word">"${f.word}"</div>
        <div class="comm-bar-track"><div class="comm-bar-fill ${f.severity}" style="width:${Math.round((f.count / maxCount) * 100)}%"></div></div>
        <div class="comm-bar-count">${f.count}×</div>
        <div class="comm-bar-severity"><span class="severity-badge severity-${f.severity}">${f.severity}</span></div>
        <div class="comm-bar-alt">→ ${altText}</div>
      </div>`;
    })
    .join('');

  const rewrites = (ca.sentenceRewrites || [])
    .map(
      (r) => `
    <div class="rewrite-card">
      <div class="rewrite-before">
        <div class="rewrite-label before">❌ You said</div>
        <div class="rewrite-text">"${r.original}"</div>
      </div>
      <div class="rewrite-after">
        <div class="rewrite-label after">✅ Better</div>
        <div class="rewrite-text">"${r.rewritten}"</div>
      </div>
      <div class="rewrite-improvement">💡 ${r.improvement}</div>
    </div>`,
    )
    .join('');

  const strengths = (ca.strengthsInCommunication || [])
    .map(
      (s) => `<div style="padding:4px 0;font-size:13px;color:var(--text-secondary);">✓ ${s}</div>`,
    )
    .join('');

  return `
    <div class="comm-analysis-section">
      <div class="comm-score-strip">
        <div class="comm-score-big">${ca.overallCommunicationScore}</div>
        <div class="comm-score-meta">
          <div class="comm-score-label">Communication Score</div>
          <div class="comm-score-sub">Auto-analyzed · ${new Date(ca.analyzedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        <div style="margin-left:auto;text-align:right;font-size:12px;color:var(--text-muted);">
          ${ca.totalUserWords} words · ${ca.totalUserTurns} turns
        </div>
      </div>

      <div class="fw-600 mb-12" style="font-size:14px;">Filler Words Detected</div>
      ${fillerBars}

      <div class="fw-600 mb-12 mt-20" style="font-size:14px;">Sentence Rewrites</div>
      ${rewrites}

      ${
        strengths
          ? `
        <div class="fw-600 mb-8 mt-16" style="font-size:14px;">What You Did Well</div>
        <div class="card card-p" style="margin-bottom:8px;">${strengths}</div>
      `
          : ''
      }
    </div>`;
}

// ════════════════════════════════════════════════════
//  VIEW: COMMUNICATION  (standalone lifetime coach)
// ════════════════════════════════════════════════════
async function renderCommunication() {
  const stats = await MockAPI.getStats();
  const lc = stats.lifetimeCommunication;
  if (!lc) {
    document.getElementById('view-container').innerHTML =
      `<div class="page-content"><div class="empty-state"><div class="empty-icon">🗣️</div><div class="empty-title">No communication data yet</div><div class="empty-sub">Complete a session to see analysis.</div></div></div>`;
    return;
  }

  const maxAllTime = Math.max(...(lc.allTimeFillerStats || []).map((f) => f.count), 1);
  const topFiller = lc.allTimeFillerStats?.[0] || { word: 'like', count: 87 };

  const allTimeBars = (lc.allTimeFillerStats || [])
    .map((f) => {
      const PROFESSIONAL_MAP = {
        like: 'such as / for example',
        basically: 'fundamentally / in essence',
        um: '(silent pause)',
        just: '(remove — weakens point)',
        'kind of': 'somewhat / partially',
        honestly: 'candidly / to be direct',
      };
      const alt = PROFESSIONAL_MAP[f.word] || '—';
      return `
      <div class="comm-bar-row">
        <div class="comm-bar-word">"${f.word}"</div>
        <div class="comm-bar-track"><div class="comm-bar-fill ${f.severity}" style="width:${Math.round((f.count / maxAllTime) * 100)}%"></div></div>
        <div class="comm-bar-count">${f.count}×</div>
        <div class="comm-bar-severity"><span class="severity-badge severity-${f.severity}">${f.severity}</span></div>
        <div class="comm-bar-alt">→ ${alt}</div>
      </div>`;
    })
    .join('');

  const trendCols = (lc.improvementTrend || [])
    .map((t) => {
      const h = Math.max(4, Math.round((t.score / 10) * 48));
      return `
      <div class="trend-col">
        <div class="trend-score-label">${t.score}</div>
        <div class="trend-bar-seg" style="height:${h}px;" title="${t.sessionLabel}: ${t.score}"></div>
        <div class="trend-label">${t.sessionLabel}</div>
      </div>`;
    })
    .join('');

  const vocabRows = [
    ['basically', 'fundamentally, in essence', 'more precise'],
    ['"like" (filler)', 'such as, for example', 'adds clarity'],
    ['kind of', 'to some extent, partially', 'sounds decisive'],
    ['sort of', 'to a degree, in a sense', 'sounds confident'],
    ['honestly', 'candidly, to be direct', 'professional tone'],
    ['"just" (hedge)', '(remove entirely)', 'strengthens claims'],
    ['um / uh', '(silent pause)', 'signals calm thought'],
    ['obviously', '(remove)', 'avoids condescension'],
    ['you know', '(pause + continue)', 'removes filler'],
  ]
    .map(
      ([retire, use, why]) => `
    <tr>
      <td><span class="vocab-retire">"${retire}"</span></td>
      <td class="vocab-use">${use}</td>
      <td class="vocab-why">${why}</td>
    </tr>`,
    )
    .join('');

  const sessionRows = (lc.recentSessionScores || [])
    .map(
      (s) => `
    <div class="comm-session-row" onclick="navigate('analysis',{analysisId:'${(State.data.sessions.find((ss) => ss.id === s.sessionId) || {}).analysisId || 'anal_001'}'})">
      <div class="comm-sess-info">
        <div class="comm-sess-name">${s.packageName} with ${s.tutorName}</div>
        <div class="comm-sess-meta">${fmtDate(s.date)}</div>
      </div>
      <div class="comm-sess-bar-wrap">
        <div style="font-size:11px;color:var(--text-muted);">${s.score}/10</div>
        <div class="comm-sess-bar-track"><div class="comm-sess-bar-fill" style="width:${s.score * 10}%"></div></div>
      </div>
      <div class="comm-sess-score">${s.score}</div>
      <button class="btn btn-secondary btn-sm" style="flex-shrink:0;" onclick="event.stopPropagation();navigate('analysis',{analysisId:'${(State.data.sessions.find((ss) => ss.id === s.sessionId) || {}).analysisId || 'anal_001'}'})">View Details</button>
    </div>`,
    )
    .join('');

  document.getElementById('view-container').innerHTML = `
    <div>
      <div class="page-header">
        <div class="page-title">🗣️ Communication Coach</div>
        <div class="page-subtitle">Track and improve how you express yourself across all interviews</div>
      </div>
      <div class="page-content">

        <div class="comm-stats-grid mb-24">
          <div class="comm-stat-card">
            <div class="comm-stat-val">${lc.avgCommunicationScore}/10</div>
            <div class="comm-stat-lbl">Avg Score</div>
            <div class="comm-stat-sub">across all sessions</div>
          </div>
          <div class="comm-stat-card">
            <div class="comm-stat-val">${lc.totalFillerWordsAllTime}</div>
            <div class="comm-stat-lbl">Filler Words</div>
            <div class="comm-stat-sub">total all time</div>
          </div>
          <div class="comm-stat-card">
            <div class="comm-stat-val">${(lc.recentSessionScores || []).length}</div>
            <div class="comm-stat-lbl">Sessions Analyzed</div>
            <div class="comm-stat-sub">with comm data</div>
          </div>
          <div class="comm-stat-card">
            <div class="comm-stat-val" style="font-size:18px;">"${lc.topFillerAllTime}"</div>
            <div class="comm-stat-lbl">Top Culprit</div>
            <div class="comm-stat-sub">${topFiller.count}× all time</div>
          </div>
        </div>

        <div class="card card-p mb-24">
          <div class="fw-600 mb-8" style="font-size:14px;">Score Trend (last ${(lc.improvementTrend || []).length} sessions)</div>
          <div class="trend-wrap">${trendCols}</div>
          <div style="font-size:12px;color:var(--text-muted);">📈 ${lc.mostImprovedArea}</div>
        </div>

        <div class="card card-p mb-24">
          <div class="fw-600 mb-16" style="font-size:14px;">Your Top Filler Words — All Time</div>
          ${allTimeBars}
        </div>

        <div class="card mb-24" style="overflow:hidden;">
          <div class="fw-600" style="font-size:14px;padding:16px 20px 12px;border-bottom:1px solid var(--bg-border);">Professional Vocabulary Reference</div>
          <table class="vocab-table">
            <thead><tr><th>Retire</th><th>Use Instead</th><th>Why</th></tr></thead>
            <tbody>${vocabRows}</tbody>
          </table>
        </div>

        <div class="focus-card mb-24">
          <div class="focus-card-title">🎯 Focus Area — ${lc.nextFocusArea.split(' ')[0].replace("'", '').replace('"', '')}</div>
          <div class="focus-card-text">${lc.nextFocusArea}</div>
          <div class="focus-card-stat">You used <strong>"${lc.topFillerAllTime}"</strong> ${topFiller.count}× all time. Target: reduce by 50% in next 3 sessions.</div>
          <button class="btn btn-primary btn-sm" onclick="navigate('new-interview')">Start Practice Session →</button>
        </div>

        ${
          sessionRows
            ? `
          <div class="fw-600 mb-12" style="font-size:14px;">Recent Session Communication Scores</div>
          <div class="card" style="overflow:hidden;margin-bottom:24px;">${sessionRows}</div>
        `
            : ''
        }

      </div>
    </div>`;
}

// ════════════════════════════════════════════════════
//  VIEW: HISTORY  (accordion cards with recording/transcript)
// ════════════════════════════════════════════════════
async function renderHistory() {
  const sessions = await MockAPI.getSessions();
  const filters = ['all', 'behavioral', 'technical', 'dsa', 'hr', 'pm', 'system-design'];

  function recordingPanelHTML(s) {
    const dur = s.recordingDurationSec || 0;
    const pct = 18; // mock playhead at 18%
    const fillPct = pct + '%';
    const thumbPct = pct + '%';
    return `
      <div class="recording-player">
        <div class="player-info">🎙️ Recording — ${s.packageName} with ${s.tutorName} · ${fmtDate(s.startedAt)}</div>
        <div class="player-scrubber">
          <div class="scrubber-track" onclick="toast('Recording playback is simulated','info')">
            <div class="scrubber-fill" style="width:${fillPct}"></div>
            <div class="scrubber-thumb" style="left:${thumbPct}"></div>
          </div>
          <div class="scrubber-times"><span>${fmtTime(Math.floor(dur * 0.18))}</span><span>${fmtTime(dur)}</span></div>
        </div>
        <div class="player-controls">
          <button class="player-btn" onclick="toast('Recording playback is simulated','info')" title="Restart">⏮</button>
          <button class="player-btn" onclick="toast('Recording playback is simulated','info')" title="Rewind">⏪</button>
          <button class="player-btn play-btn" onclick="toast('Recording playback is simulated','info')" title="Play">▶</button>
          <button class="player-btn" onclick="toast('Recording playback is simulated','info')" title="Forward">⏩</button>
          <button class="player-btn" onclick="toast('Recording playback is simulated','info')" title="End">⏭</button>
          <span class="player-volume" style="margin-left:12px;">🔊</span>
          <button class="btn btn-secondary btn-sm" style="margin-left:auto;" onclick="toast('Exported to ~/Downloads/${s.tutorSlug}-${s.id}.mp3','success')">⬇ Export</button>
        </div>
        <div class="player-speed">
          Speed:
          ${['0.75x', '1x', '1.25x', '1.5x', '2x'].map((sp) => `<button class="speed-btn ${sp === '1x' ? 'active' : ''}" onclick="toast('Speed set to ${sp} (simulated)','info')">${sp}</button>`).join('')}
        </div>
      </div>`;
  }

  function transcriptPanelHTML(s) {
    const turns = s.transcript || [];
    if (!turns.length)
      return `<div style="padding:32px;text-align:center;color:var(--text-muted);">No transcript available for this session.</div>`;
    return `
      <div class="transcript-view">
        <div class="transcript-view-toolbar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px;color:var(--text-muted)"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input class="search-input" style="max-width:280px;padding:5px 10px;font-size:12px;" type="text" placeholder="Search transcript…" id="transcript-search-${s.id}" oninput="searchTranscript('${s.id}')"/>
          <button class="btn btn-secondary btn-sm" style="margin-left:auto;" onclick="toast('Transcript saved to ~/Downloads/${s.id}.txt','success')">⬇ Download</button>
        </div>
        <div class="transcript-turns" id="transcript-turns-${s.id}">
          ${turns
            .map((t) => {
              const isAI = t.speaker === 'ai';
              return `
              <div class="turn ${isAI ? 'turn-ai' : 'turn-user'}" data-text="${(t.text || '').replace(/"/g, '&quot;')}">
                <div class="turn-meta">
                  <span class="turn-speaker">${isAI ? '🤖 ' + s.tutorName : '👤 You'}</span>
                  <span class="turn-ts">${fmtTime(t.timestampSec || 0)}</span>
                </div>
                <div class="turn-text">"${t.text}"</div>
              </div>`;
            })
            .join('')}
        </div>
      </div>`;
  }

  function sessionCardHTML(s) {
    const isExpanded = State.expandedHistoryRow === s.id;
    const activePanel = State.expandedHistoryPanel;
    return `
      <div class="hcard" id="hcard-${s.id}">
        <div class="hcard-row" onclick="toggleHistoryPanel('${s.id}', 'recording')">
          <div class="hcol hcol-date">${fmtDate(s.startedAt)}</div>
          <div class="hcol hcol-pkg">${s.packageName}</div>
          <div class="hcol hcol-tutor">
            <div class="tutor-avatar" style="background:${tutorColor(s.tutorSlug)};width:26px;height:26px;font-size:10px;">${tutorInitials(s.tutorSlug)}</div>
            ${s.tutorName}
          </div>
          <div class="hcol hcol-dur">${fmtDuration(s.durationSec)}</div>
          <div class="hcol hcol-score">${s.score ? `<div class="score-chip ${scoreClass(s.score)}" style="width:32px;height:32px;font-size:12px;">${s.score}</div>` : '<span class="text-muted">—</span>'}</div>
          <div class="hcol hcol-status"><span class="badge ${statusBadge(s.status)}">${s.status}</span></div>
          <div class="hcol hcol-acts" onclick="event.stopPropagation()">
            ${s.hasRecording ? `<button class="btn btn-secondary btn-sm" onclick="toggleHistoryPanel('${s.id}','recording')">▶ Play</button>` : ''}
            ${(s.transcript || []).length ? `<button class="btn btn-secondary btn-sm" onclick="toggleHistoryPanel('${s.id}','transcript')">📄 Transcript</button>` : ''}
            ${s.analysisId ? `<button class="btn btn-secondary btn-sm" onclick="navigate('analysis',{analysisId:'${s.analysisId}'})">📊 Analysis</button>` : ''}
          </div>
        </div>
        <div class="hcard-expand ${isExpanded ? 'open' : ''}" id="hexpand-${s.id}">
          ${
            isExpanded
              ? `
            <div class="hexpand-tabs">
              ${s.hasRecording ? `<button class="hexpand-tab ${activePanel === 'recording' ? 'active' : ''}" onclick="toggleHistoryPanel('${s.id}','recording')">▶ Recording</button>` : ''}
              ${(s.transcript || []).length ? `<button class="hexpand-tab ${activePanel === 'transcript' ? 'active' : ''}" onclick="toggleHistoryPanel('${s.id}','transcript')">📄 Transcript</button>` : ''}
            </div>
            <div id="hpanel-${s.id}">
              ${activePanel === 'recording' ? recordingPanelHTML(s) : transcriptPanelHTML(s)}
            </div>
          `
              : ''
          }
        </div>
      </div>`;
  }

  function cardsHTML(filtered) {
    if (!filtered.length)
      return `
      <div class="empty-state" style="padding:48px 0;">
        <div class="empty-icon">📋</div>
        <div class="empty-title">No sessions found</div>
        <div class="empty-sub">Try a different filter or start your first session.</div>
      </div>`;
    return filtered.map((s) => sessionCardHTML(s)).join('');
  }

  document.getElementById('view-container').innerHTML = `
    <div>
      <div class="page-header">
        <div class="page-title">Session History</div>
        <div class="page-subtitle">${sessions.length} total sessions</div>
      </div>
      <div class="page-content">
        <div class="history-toolbar">
          <div class="search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input class="search-input" type="text" placeholder="Search sessions…" id="history-search" oninput="filterHistory()"/>
          </div>
          <div class="filter-chips">
            ${filters
              .map(
                (f) => `
              <button class="chip ${State.historyFilter === f ? 'active' : ''}" onclick="setHistoryFilter('${f}')">
                ${f === 'all' ? 'All' : f.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>`,
              )
              .join('')}
          </div>
        </div>
        <div class="history-cards">
          <div class="hcard-header">
            <div class="hcol-header hcol-date">Date</div>
            <div class="hcol-header hcol-pkg">Package</div>
            <div class="hcol-header hcol-tutor">Tutor</div>
            <div class="hcol-header hcol-dur">Duration</div>
            <div class="hcol-header hcol-score">Score</div>
            <div class="hcol-header hcol-status">Status</div>
            <div class="hcol-header hcol-acts">Actions</div>
          </div>
          <div id="history-cards-body">
            ${cardsHTML(sessions)}
          </div>
        </div>
      </div>
    </div>`;

  function getFiltered() {
    const q = (document.getElementById('history-search')?.value || '').toLowerCase();
    return sessions.filter((s) => {
      const matchFilter = State.historyFilter === 'all' || s.packageSlug === State.historyFilter;
      const matchSearch =
        !q || s.packageName.toLowerCase().includes(q) || s.tutorName.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }

  window.toggleHistoryPanel = (sessionId, panel) => {
    if (State.expandedHistoryRow === sessionId && State.expandedHistoryPanel === panel) {
      State.expandedHistoryRow = null;
      State.expandedHistoryPanel = null;
    } else {
      State.expandedHistoryRow = sessionId;
      State.expandedHistoryPanel = panel;
    }
    document.getElementById('history-cards-body').innerHTML = cardsHTML(getFiltered());
  };

  window.searchTranscript = (sessionId) => {
    const q = (
      document.getElementById(`transcript-search-${sessionId}`)?.value || ''
    ).toLowerCase();
    const turns = document.querySelectorAll(`#transcript-turns-${sessionId} .turn`);
    turns.forEach((el) => {
      const text = (el.dataset.text || '').toLowerCase();
      el.style.display = !q || text.includes(q) ? '' : 'none';
    });
  };

  window.setHistoryFilter = (f) => {
    State.historyFilter = f;
    document
      .querySelectorAll('.chip')
      .forEach((el) =>
        el.classList.toggle(
          'active',
          el.textContent.trim().toLowerCase().replace(/ /g, '-') === f ||
            (f === 'all' && el.textContent.trim() === 'All'),
        ),
      );
    document.getElementById('history-cards-body').innerHTML = cardsHTML(getFiltered());
  };

  window.filterHistory = () => {
    document.getElementById('history-cards-body').innerHTML = cardsHTML(getFiltered());
  };
}

// ════════════════════════════════════════════════════
//  VIEW: FILES  (two-panel: tree + editor)
// ════════════════════════════════════════════════════
async function renderFiles() {
  const fs = await MockAPI.getFileSystem();

  function fileIcon(type) {
    return type === 'md' ? '📝' : '📄';
  }

  function treeHTML() {
    let html = '';
    fs.folders.forEach((folder) => {
      const isExpanded = State.expandedFolders.has(folder.id);
      html += `
        <div class="ftree-item folder ${isExpanded ? '' : 'collapsed'}" onclick="toggleFolder('${folder.id}')">
          <span class="ftree-icon">${isExpanded ? '📂' : '📁'}</span>
          <span class="ftree-name">${folder.name}</span>
          <span class="ftree-chevron">▼</span>
        </div>`;
      if (isExpanded) {
        folder.files.forEach((file) => {
          html += `
            <div class="ftree-item file-item ${State.selectedFileId === file.id ? 'active' : ''}" onclick="selectFile('${file.id}')">
              <span class="ftree-icon">${fileIcon(file.type)}</span>
              <span class="ftree-name">${file.name}</span>
            </div>`;
        });
      }
    });
    if (fs.rootFiles.length) {
      html += `<div style="height:1px;background:var(--bg-border);margin:6px 0;"></div>`;
      fs.rootFiles.forEach((file) => {
        html += `
          <div class="ftree-item file-item ${State.selectedFileId === file.id ? 'active' : ''}" onclick="selectFile('${file.id}')">
            <span class="ftree-icon">${fileIcon(file.type)}</span>
            <span class="ftree-name">${file.name}</span>
          </div>`;
      });
    }
    return (
      html || `<div style="padding:16px;font-size:12px;color:var(--text-faint);">No files yet</div>`
    );
  }

  function editorHTML() {
    if (!State.selectedFileId)
      return `
      <div class="feditor-empty">
        <div class="feditor-empty-icon">📂</div>
        <div class="feditor-empty-text">Select a file from the left panel or create a new one.</div>
      </div>`;

    const allFiles = [...fs.rootFiles, ...fs.folders.flatMap((f) => f.files)];
    const file = allFiles.find((f) => f.id === State.selectedFileId);
    if (!file)
      return `<div class="feditor-empty"><div class="feditor-empty-text">File not found.</div></div>`;

    if (file.type !== 'md') {
      return `
        <div class="feditor-topbar">
          <div class="feditor-filename">${fileIcon(file.type)} ${file.name}</div>
          <button class="btn btn-secondary btn-sm" onclick="toast('Downloaded ${file.name}','success')">⬇ Download</button>
        </div>
        <div class="fviewer-panel">
          <div class="fviewer-box">
            <div class="fviewer-icon">📄</div>
            <div class="fviewer-name">${file.name}</div>
            <div class="fviewer-meta">${file.sizeKB} KB · Uploaded ${fmtDate(file.createdAt)}</div>
            <div class="fviewer-note">Preview not available in demo mode.<br>Real app will render via PDF.js</div>
          </div>
        </div>`;
    }

    const updatedAgo = Math.max(1, Math.floor((Date.now() - new Date(file.updatedAt)) / 60000));
    const updatedLabel = updatedAgo < 60 ? `${updatedAgo} min ago` : fmtDate(file.updatedAt);

    if (State.editorMode === 'preview') {
      return `
        <div class="feditor-topbar">
          <div class="feditor-filename">📝 ${file.name}</div>
          <div class="feditor-tabs">
            <button class="feditor-tab" onclick="setEditorMode('edit')">Edit</button>
            <button class="feditor-tab active">Preview</button>
          </div>
        </div>
        <div class="feditor-body">
          <div class="feditor-preview">${renderMarkdown(file.content || '')}</div>
        </div>
        <div class="feditor-statusbar"><span>Last saved: ${updatedLabel}</span><span>${file.sizeKB} KB</span></div>`;
    }

    return `
      <div class="feditor-topbar">
        <div class="feditor-filename">📝 ${file.name}</div>
        <div class="feditor-tabs">
          <button class="feditor-tab active">Edit</button>
          <button class="feditor-tab" onclick="setEditorMode('preview')">Preview</button>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="saveCurrentFile()">Save ✓</button>
      </div>
      <div class="feditor-body">
        <textarea class="feditor-textarea" id="feditor-textarea" oninput="onEditorInput()">${(file.content || '').replace(/</g, '&lt;')}</textarea>
      </div>
      <div class="feditor-statusbar">
        <span id="autosave-status">Last saved: ${updatedLabel}</span>
        <span>${file.sizeKB} KB</span>
      </div>`;
  }

  function modalHTML() {
    if (!State.fileModal) return '';
    const allFolders = fs.folders;
    const folderOptions = `<option value="">Root (no folder)</option>${allFolders.map((f) => `<option value="${f.id}">${f.name}</option>`).join('')}`;
    if (State.fileModal === 'new-file')
      return `
      <div class="modal-overlay" onclick="if(event.target===this)closeFileModal()">
        <div class="modal-box">
          <div class="modal-title">New Markdown File</div>
          <div class="modal-field"><label class="modal-label">File name (.md auto-added)</label><input class="modal-input" id="modal-fname" placeholder="my-notes" autofocus/></div>
          <div class="modal-field"><label class="modal-label">Save in folder</label><select class="modal-select" id="modal-folder">${folderOptions}</select></div>
          <div class="modal-footer"><button class="btn btn-secondary" onclick="closeFileModal()">Cancel</button><button class="btn btn-primary" onclick="confirmCreateFile()">Create</button></div>
        </div>
      </div>`;
    if (State.fileModal === 'new-folder')
      return `
      <div class="modal-overlay" onclick="if(event.target===this)closeFileModal()">
        <div class="modal-box">
          <div class="modal-title">New Folder</div>
          <div class="modal-field"><label class="modal-label">Folder name</label><input class="modal-input" id="modal-foldername" placeholder="My Notes" autofocus/></div>
          <div class="modal-footer"><button class="btn btn-secondary" onclick="closeFileModal()">Cancel</button><button class="btn btn-primary" onclick="confirmCreateFolder()">Create</button></div>
        </div>
      </div>`;
    if (State.fileModal === 'upload')
      return `
      <div class="modal-overlay" onclick="if(event.target===this)closeFileModal()">
        <div class="modal-box" style="min-width:420px;">
          <div class="modal-title">Upload Files</div>
          <div class="dropzone" onclick="document.getElementById('upload-input').click()">
            <div class="dropzone-icon">⬆️</div>
            <div class="dropzone-text">Drag files here or click to browse</div>
            <div class="dropzone-hint">Supported: .md  .pdf  .docx</div>
            <input type="file" id="upload-input" accept=".md,.pdf,.docx" style="display:none" onchange="handleUploadFile(this)"/>
          </div>
          <div class="modal-field"><label class="modal-label">Save to folder</label><select class="modal-select" id="modal-upload-folder">${folderOptions}</select></div>
          <div class="storage-note">Stored at: ~/.iprep/uploads/ (change in Settings → Storage)</div>
          <div class="modal-footer"><button class="btn btn-secondary" onclick="closeFileModal()">Cancel</button><button class="btn btn-primary" onclick="confirmUpload()">Upload</button></div>
        </div>
      </div>`;
    return '';
  }

  function renderView() {
    document.getElementById('view-container').innerHTML = `
      <div class="files-view">
        <div class="files-appbar">
          <div class="files-appbar-title">
            <div class="page-title">📁 Files</div>
            <div class="files-appbar-actions">
              <button class="btn btn-secondary btn-sm" onclick="openFileModal('new-file')">+ New File</button>
              <button class="btn btn-secondary btn-sm" onclick="openFileModal('new-folder')">+ New Folder</button>
              <button class="btn btn-primary btn-sm" onclick="openFileModal('upload')">⬆ Upload</button>
            </div>
          </div>
        </div>
        <div class="files-layout">
          <div class="files-tree-panel">
            <div class="files-tree-header">
              <span class="files-tree-title">Files</span>
            </div>
            <div class="files-tree-scroll" id="files-tree">${treeHTML()}</div>
          </div>
          <div class="files-editor-panel" id="files-editor">${editorHTML()}</div>
        </div>
        ${modalHTML()}
      </div>`;
  }

  renderView();

  function refreshTree() {
    const el = document.getElementById('files-tree');
    if (el) el.innerHTML = treeHTML();
  }
  function refreshEditor() {
    const el = document.getElementById('files-editor');
    if (el) el.innerHTML = editorHTML();
  }
  function refreshModal() {
    const existing = document.querySelector('.modal-overlay');
    if (existing) existing.remove();
    const html = modalHTML();
    if (html) {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      document.querySelector('.view-container > div')?.appendChild(tmp.firstElementChild);
    }
  }

  window.toggleFolder = (folderId) => {
    if (State.expandedFolders.has(folderId)) State.expandedFolders.delete(folderId);
    else State.expandedFolders.add(folderId);
    refreshTree();
  };

  window.selectFile = (id) => {
    if (State.filesAutoSaveTimer) {
      clearTimeout(State.filesAutoSaveTimer);
      State.filesAutoSaveTimer = null;
    }
    State.selectedFileId = id;
    State.editorMode = 'edit';
    refreshTree();
    refreshEditor();
  };

  window.setEditorMode = (mode) => {
    State.editorMode = mode;
    refreshEditor();
  };

  window.onEditorInput = () => {
    const status = document.getElementById('autosave-status');
    if (status) status.textContent = 'Saving…';
    if (State.filesAutoSaveTimer) clearTimeout(State.filesAutoSaveTimer);
    State.filesAutoSaveTimer = setTimeout(async () => {
      const ta = document.getElementById('feditor-textarea');
      if (!ta || !State.selectedFileId) return;
      await MockAPI.saveFile(State.selectedFileId, ta.value);
      const s = document.getElementById('autosave-status');
      if (s) s.textContent = 'Saved';
    }, 2000);
  };

  window.saveCurrentFile = async () => {
    const ta = document.getElementById('feditor-textarea');
    if (!ta || !State.selectedFileId) return;
    await MockAPI.saveFile(State.selectedFileId, ta.value);
    toast('Saved', 'success', 1500);
    const s = document.getElementById('autosave-status');
    if (s) s.textContent = 'Saved just now';
  };

  window.openFileModal = (type) => {
    State.fileModal = type;
    refreshModal();
  };
  window.closeFileModal = () => {
    State.fileModal = null;
    const el = document.querySelector('.modal-overlay');
    if (el) el.remove();
  };

  window.confirmCreateFile = async () => {
    const name = (document.getElementById('modal-fname')?.value || '').trim();
    if (!name) {
      toast('Enter a file name', 'error');
      return;
    }
    const folderId = document.getElementById('modal-folder')?.value || null;
    const file = await MockAPI.createFile(name, folderId || null);
    if (folderId) State.expandedFolders.add(folderId);
    State.selectedFileId = file.id;
    State.editorMode = 'edit';
    State.fileModal = null;
    renderView();
    toast(`Created ${file.name}`, 'success');
    window.selectFile = (id) => {
      State.selectedFileId = id;
      State.editorMode = 'edit';
      refreshTree();
      refreshEditor();
    };
  };

  window.confirmCreateFolder = async () => {
    const name = (document.getElementById('modal-foldername')?.value || '').trim();
    if (!name) {
      toast('Enter a folder name', 'error');
      return;
    }
    const folder = await MockAPI.createFolder(name);
    State.expandedFolders.add(folder.id);
    State.fileModal = null;
    renderView();
    toast(`Created folder "${folder.name}"`, 'success');
  };

  window.handleUploadFile = (input) => {
    const file = input.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['md', 'pdf', 'docx'].includes(ext)) {
      toast('Only .md, .pdf, .docx files allowed', 'error');
      return;
    }
    const nameEl = document.querySelector('.dropzone-text');
    if (nameEl) nameEl.textContent = file.name + ' selected';
  };

  window.confirmUpload = async () => {
    const input = document.getElementById('upload-input');
    const folderId = document.getElementById('modal-upload-folder')?.value || null;
    const fileName = input?.files[0]?.name || 'file.pdf';
    const ext = fileName.split('.').pop().toLowerCase();
    if (!['md', 'pdf', 'docx'].includes(ext)) {
      toast('Only .md, .pdf, .docx files allowed', 'error');
      return;
    }
    const newFile = await MockAPI.uploadFile(fileName, ext, folderId || null);
    if (folderId) State.expandedFolders.add(folderId);
    State.selectedFileId = newFile.id;
    State.fileModal = null;
    renderView();
    toast(`Uploaded ${fileName}`, 'success');
  };

  window.deleteFile = async (id) => {
    await MockAPI.deleteFile(id);
    if (State.selectedFileId === id) State.selectedFileId = null;
    refreshTree();
    refreshEditor();
    toast('File deleted', 'error');
  };

  window.deleteFolder = async (id) => {
    await MockAPI.deleteFolder(id);
    State.expandedFolders.delete(id);
    refreshTree();
    toast('Folder deleted', 'error');
  };
}

function renderMarkdown(md) {
  return md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^---$/gm, '<hr>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])(.+)$/gm, (m) => (m.startsWith('<') ? m : `<p>${m}</p>`));
}

// ════════════════════════════════════════════════════
//  VIEW: SETTINGS
// ════════════════════════════════════════════════════
async function renderSettings() {
  const providers = await MockAPI.getProviders();

  function providerStatusIcon(status) {
    if (status === 'active') return '<span style="color:var(--success)">✓ Active</span>';
    if (status === 'warning') return '<span style="color:var(--warning)">⚠ Warning</span>';
    return '<span style="color:var(--text-faint)">✗ Inactive</span>';
  }

  document.getElementById('view-container').innerHTML = `
    <div>
      <div class="page-header">
        <div class="page-title">Settings</div>
        <div class="page-subtitle">Configure your providers, API keys, and preferences</div>
      </div>
      <div class="page-content">
        <div class="tabs">
          <button class="tab-btn ${State.settingsTab === 'providers' ? 'active' : ''}" onclick="switchTab('providers')">Providers</button>
          <button class="tab-btn ${State.settingsTab === 'keys' ? 'active' : ''}" onclick="switchTab('keys')">API Keys</button>
          <button class="tab-btn ${State.settingsTab === 'prefs' ? 'active' : ''}" onclick="switchTab('prefs')">Preferences</button>
        </div>

        <!-- Providers Tab -->
        <div class="tab-panel ${State.settingsTab === 'providers' ? 'active' : ''}" id="tab-providers">
          <div class="fw-600 mb-16" style="font-size:14px;color:var(--text-muted)">Provider chain — iPrep tries these in order (cheapest first)</div>
          <div class="provider-list">
            ${providers
              .map(
                (p, i) => `
              <div class="provider-row">
                <div class="provider-left">
                  <div class="provider-dot ${p.status}"></div>
                  <div>
                    <div class="provider-name">${i + 1}. ${p.name}</div>
                    <div class="provider-note">${p.note}</div>
                  </div>
                </div>
                <div style="display:flex;align-items:center;gap:10px;">
                  ${p.version ? `<span class="provider-version">v${p.version}</span>` : ''}
                  ${p.installHint ? `<span class="provider-hint">${p.installHint}</span>` : ''}
                  <span style="font-size:12px;font-weight:600;">${providerStatusIcon(p.status)}</span>
                </div>
              </div>`,
              )
              .join('')}
          </div>
        </div>

        <!-- API Keys Tab -->
        <div class="tab-panel ${State.settingsTab === 'keys' ? 'active' : ''}" id="tab-keys">
          <div class="fw-600 mb-16" style="font-size:14px;color:var(--text-muted)">Bring Your Own Key — stored locally, never sent to iPrep servers</div>
          <div class="keys-grid">
            ${[
              {
                label: 'Deepgram API Key',
                key: 'deepgram',
                placeholder: 'dg_live_xxxxx…',
                value: 'dg_live_■■■■■■■■■■■■■■■■',
              },
              {
                label: 'Anthropic (Claude) API Key',
                key: 'anthropic',
                placeholder: 'sk-ant-xxxxx…',
                value: '',
              },
              { label: 'Google Gemini API Key', key: 'gemini', placeholder: 'AIzaSy…', value: '' },
              { label: 'OpenAI API Key', key: 'openai', placeholder: 'sk-xxxxx…', value: '' },
            ]
              .map(
                (field) => `
              <div class="key-field">
                <label>${field.label}</label>
                <div class="key-input-wrap">
                  <input class="key-input" type="password" id="key-${field.key}"
                    placeholder="${field.placeholder}" value="${field.value}" />
                  <button class="eye-btn" onclick="toggleKeyVisibility('${field.key}')">👁</button>
                </div>
              </div>`,
              )
              .join('')}
            <div style="display:flex;gap:10px;margin-top:8px;">
              <button class="btn btn-primary" onclick="saveKeys()">Save Keys</button>
              <button class="btn btn-secondary" onclick="toast('Keys cleared (mock)', 'info')">Clear All</button>
            </div>
          </div>
        </div>

        <!-- Preferences Tab -->
        <div class="tab-panel ${State.settingsTab === 'prefs' ? 'active' : ''}" id="tab-prefs">
          <div class="card card-p-lg">
            <div class="pref-row">
              <div>
                <div class="pref-label">Default Tutor</div>
                <div class="pref-sub">Used when starting a new session</div>
              </div>
              <select class="select-input">
                <option>Alex</option>
                <option selected>Priya</option>
                <option>Morgan</option>
              </select>
            </div>
            <div class="pref-row">
              <div>
                <div class="pref-label">Default Package</div>
                <div class="pref-sub">Pre-selected on New Interview</div>
              </div>
              <select class="select-input">
                <option selected>Behavioral</option>
                <option>Technical</option>
                <option>DSA</option>
                <option>HR Round</option>
              </select>
            </div>
            <div class="pref-row">
              <div>
                <div class="pref-label">Voice Mode</div>
                <div class="pref-sub">Enable voice for interview sessions</div>
              </div>
              <div class="toggle on" onclick="this.classList.toggle('on')"></div>
            </div>
            <div class="pref-row">
              <div>
                <div class="pref-label">Auto-analyze on End</div>
                <div class="pref-sub">Run analysis automatically when session ends</div>
              </div>
              <div class="toggle on" onclick="this.classList.toggle('on')"></div>
            </div>
            <div class="pref-row">
              <div>
                <div class="pref-label">Dark Theme</div>
                <div class="pref-sub">Toggle between dark and light mode</div>
              </div>
              <div class="toggle ${State.theme === 'dark' ? 'on' : ''}" onclick="toggleTheme()"></div>
            </div>
          </div>
          <button class="btn btn-primary mt-16" onclick="toast('Preferences saved!', 'success')">Save Preferences</button>
        </div>
      </div>
    </div>`;

  window.switchTab = (tab) => {
    State.settingsTab = tab;
    document.querySelectorAll('.tab-btn').forEach((b, i) => {
      const tabs = ['providers', 'keys', 'prefs'];
      b.classList.toggle('active', tabs[i] === tab);
    });
    document.querySelectorAll('.tab-panel').forEach((p, i) => {
      const tabs = ['tab-providers', 'tab-keys', 'tab-prefs'];
      p.classList.toggle('active', p.id === `tab-${tab}`);
    });
  };

  window.toggleKeyVisibility = (key) => {
    const input = document.getElementById(`key-${key}`);
    if (input) input.type = input.type === 'password' ? 'text' : 'password';
  };

  window.saveKeys = () => {
    toast('API keys saved locally!', 'success');
  };
}

// ════════════════════════════════════════════════════
//  BOOT
// ════════════════════════════════════════════════════
async function boot() {
  const savedTheme = localStorage.getItem('iprep-theme') || 'dark';
  State.theme = savedTheme;
  document.documentElement.dataset.theme = savedTheme;
  const sun = document.getElementById('icon-sun');
  const moon = document.getElementById('icon-moon');
  const label = document.getElementById('theme-label');
  if (sun) sun.style.display = savedTheme === 'dark' ? '' : 'none';
  if (moon) moon.style.display = savedTheme === 'light' ? '' : 'none';
  if (label) label.textContent = savedTheme === 'dark' ? 'Light Mode' : 'Dark Mode';

  await MockAPI.load();

  document.querySelectorAll('.nav-item').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(el.dataset.view);
    });
  });

  const hash = window.location.hash.replace('#', '') || 'dashboard';
  navigate(hash);
}

boot().catch(console.error);
