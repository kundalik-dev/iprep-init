/* ============================================================
   STATE
   ============================================================ */
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
  settingsTab: 'providers',
  historyFilter: 'all',
  expandedHistoryRow: null,
  expandedHistoryPanel: {},
  selectedFileId: null,
  editorMode: 'edit',
  expandedFolders: new Set(['folder_001', 'folder_002']),
  filesAutoSaveTimer: null,
  currentConvId: null,
  currentAnalysisTab: 'overview',
  data: null,
};

/* ============================================================
   ICONS (SVG strings)
   ============================================================ */
const IC = {
  check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  x: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  info: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  warn: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  mic: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
  micOff: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
  send: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  plus: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  trash: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  eye: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
  download: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  chevDown: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  save: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
  upload: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>`,
  folder: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
};

/* ============================================================
   MOCK API
   ============================================================ */
const MockAPI = {
  _delay: (ms = 300) => new Promise(r => setTimeout(r, ms + Math.random() * 200)),

  async load() {
    const res = await fetch('mock-data.json');
    State.data = await res.json();
    return State.data;
  },

  async getTutors()   { await this._delay(200); return State.data.tutors; },
  async getPackages() { await this._delay(200); return State.data.packages; },
  async getSessions() { await this._delay(300); return State.data.sessions; },
  async getAnalysis(id) { await this._delay(400); return State.data.analysis[id] || null; },
  async getProviders()  { await this._delay(200); return State.data.providers; },
  async getStats()      { await this._delay(200); return State.data.stats; },

  async startSession(pkgSlug, tutorSlug) {
    await this._delay(500);
    const id = 'sess_live_' + Date.now();
    State.activeSessionId = id;
    return { id, packageSlug: pkgSlug, tutorSlug };
  },

  async endSession(id) {
    await this._delay(600);
    return { analysisId: 'anal_001' };
  },

  async getConversations() { await this._delay(250); return [...State.data.conversations]; },

  async createConversation(title) {
    await this._delay(300);
    const id = 'conv_' + Date.now();
    const conv = {
      id, title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [{
        id: 'msg_' + Date.now(),
        role: 'ai',
        text: "Hey! I'm your AI interview coach. I have access to your prep notes and session history to give you personalized guidance.\n\nWhat would you like to work on today?",
        ts: new Date().toISOString(),
        actions: [
          { label: 'Review Last Session', trigger: 'How did I do in my last session?' },
          { label: 'What to Improve', trigger: 'What should I focus on to improve?' },
          { label: 'Start Practice', view: 'new-interview' },
        ]
      }]
    };
    State.data.conversations.unshift(conv);
    return conv;
  },

  async addMessage(convId, role, text) {
    await this._delay(100);
    const conv = State.data.conversations.find(c => c.id === convId);
    if (!conv) return null;
    const msg = { id: 'msg_' + Date.now(), role, text, ts: new Date().toISOString(), actions: [] };
    conv.messages.push(msg);
    conv.updatedAt = new Date().toISOString();
    return msg;
  },
};

/* ============================================================
   HELPERS
   ============================================================ */
function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatRelativeDate(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d} days ago`;
  return formatDate(iso);
}

function formatDuration(sec) {
  if (!sec) return '—';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m >= 60) { const h = Math.floor(m / 60); return `${h}h ${m % 60}m`; }
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function formatTimer(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatTimestamp(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function scoreColor(score) {
  if (!score) return 'var(--text-m)';
  if (score >= 85) return 'var(--success)';
  if (score >= 70) return 'var(--warning)';
  return 'var(--error)';
}

function scoreLabel(score) {
  if (!score) return 'N/A';
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Strong';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Developing';
  return 'Needs Work';
}

function difficultyColor(d) {
  const map = { Easy: 'var(--success)', Medium: 'var(--warning)', Hard: 'var(--error)', Expert: 'var(--accent-v)' };
  return map[d] || 'var(--text-m)';
}

function tutorColor(slug) {
  const t = (State.data?.tutors || []).find(t => t.slug === slug);
  return t ? t.color : '#8B5CF6';
}

function tutorInitials(slug) {
  const t = (State.data?.tutors || []).find(t => t.slug === slug);
  return t ? t.initials : '??';
}

function getLatestCompletedSession() {
  return (State.data?.sessions || [])
    .filter(s => s.status === 'COMPLETED')
    .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))[0] || null;
}

function getAnalysisForSession(sessionId) {
  const s = (State.data?.sessions || []).find(s => s.id === sessionId);
  if (!s?.analysisId) return null;
  return State.data.analysis[s.analysisId] || null;
}

function getAllFiles() {
  const fs = State.data?.fileSystem;
  if (!fs) return [];
  const files = [...(fs.rootFiles || [])];
  (fs.folders || []).forEach(f => files.push(...(f.files || [])));
  return files;
}

function findFile(id) {
  return getAllFiles().find(f => f.id === id) || null;
}

function renderMarkdown(text) {
  if (!text) return '';
  let html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/```[\s\S]*?```/g, m => {
      const code = m.slice(3, -3).replace(/^[a-z]*\n/, '');
      return `<pre style="background:var(--bg-elevated);padding:12px 14px;border-radius:8px;overflow-x:auto;margin:10px 0;font-size:12px;line-height:1.6;font-family:'JetBrains Mono',monospace;border:1px solid var(--bg-border)"><code>${code}</code></pre>`;
    })
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:20px;font-weight:800;color:var(--text-p);margin:16px 0 10px;letter-spacing:-0.5px">$1</h1>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\|(.+)\|/g, m => {
      const cells = m.split('|').filter(c => c.trim() && !c.match(/^[-\s|]+$/));
      return cells.length ? '<tr>' + cells.map(c => `<td style="padding:6px 12px;border:1px solid var(--bg-border)">${c.trim()}</td>`).join('') + '</tr>' : '';
    })
    .replace(/(<tr>.*<\/tr>)/gs, '<table style="border-collapse:collapse;width:100%;margin:12px 0;font-size:12px">$1</table>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  return `<p>${html}</p>`;
}

function formatAIChatText(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/```([\s\S]*?)```/g, (_, code) => `<pre style="background:rgba(0,0,0,0.3);padding:10px 12px;border-radius:8px;font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.6;margin:8px 0;overflow-x:auto">${code.replace(/^\w+\n/, '')}</pre>`)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/^[-*] (.+)$/gm, '<li style="margin-bottom:3px">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li style="margin-bottom:3px">$1</li>')
    .replace(/(<li[^>]*>[\s\S]*?<\/li>)+/g, '<ul style="padding-left:16px;margin:6px 0">$&</ul>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

/* ============================================================
   TOAST
   ============================================================ */
let _toastId = 0;
function showToast(title, msg = '', type = 'info', duration = 4000) {
  const id = ++_toastId;
  const iconMap = { success: IC.check, error: IC.x, warning: IC.warn, info: IC.info };
  const colorMap = { success: 'var(--success)', error: 'var(--error)', warning: 'var(--warning)', info: 'var(--accent-v)' };
  const el = document.createElement('div');
  el.className = 'toast';
  el.id = 'toast-' + id;
  el.innerHTML = `
    <span class="toast-icon" style="color:${colorMap[type]}">${iconMap[type] || IC.info}</span>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      ${msg ? `<div class="toast-msg">${msg}</div>` : ''}
    </div>
    <div class="toast-bar ${type}" style="animation-duration:${duration}ms"></div>
  `;
  el.onclick = () => removeToast(id);
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => removeToast(id), duration);
}

function removeToast(id) {
  const el = document.getElementById('toast-' + id);
  if (!el) return;
  el.classList.add('removing');
  setTimeout(() => el.remove(), 220);
}

/* ============================================================
   ROUTER
   ============================================================ */
function clearSessionTimers() {
  if (State.sessionTimer) { clearInterval(State.sessionTimer); State.sessionTimer = null; }
  if (State.transcriptInterval) { clearInterval(State.transcriptInterval); State.transcriptInterval = null; }
  if (State.filesAutoSaveTimer) { clearTimeout(State.filesAutoSaveTimer); State.filesAutoSaveTimer = null; }
}

function navigate(view, params = {}) {
  if (view !== 'session') clearSessionTimers();
  State.currentView = view;
  State._navParams = params;
  window.location.hash = view;
  renderView(params);
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.route === view);
  });
}

async function renderView(params = {}) {
  const root = document.getElementById('view-root');
  root.innerHTML = `<div class="loading-screen"><div class="spinner"></div></div>`;

  const p = params || State._navParams || {};
  const view = State.currentView;

  try {
    if      (view === 'dashboard')     await renderDashboard();
    else if (view === 'new-interview') await renderNewInterview();
    else if (view === 'session')       await renderSession(p);
    else if (view === 'analysis')      await renderAnalysis(p);
    else if (view === 'history')       await renderHistory();
    else if (view === 'chat')          await renderChat();
    else if (view === 'files')         await renderFiles();
    else if (view === 'communication') await renderCommunication();
    else if (view === 'settings')      await renderSettings();
    else                               await renderDashboard();
  } catch (e) {
    console.error('Render error:', e);
    root.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Something went wrong</div><div class="empty-text">${e.message}</div></div>`;
  }

  setTimeout(() => { const c = root.firstElementChild; if (c) c.classList.add('view-enter'); }, 10);
}

/* ============================================================
   COMPONENTS
   ============================================================ */
function scoreRing(score, size = 100, stroke = 7) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = score ? circ - (score / 100) * circ : circ;
  const color = scoreColor(score);
  return `
    <div class="score-ring-wrap" style="width:${size}px;height:${size}px">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform:rotate(-90deg)">
        <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--bg-border)" stroke-width="${stroke}"/>
        <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}"
          stroke-dasharray="${circ}" stroke-dashoffset="${circ}" stroke-linecap="round"
          class="score-ring-progress" data-target="${offset}" style="stroke-dashoffset:${circ}"/>
      </svg>
      <div class="score-ring-label">
        <span class="score-ring-num" style="font-size:${Math.round(size*0.22)}px;color:${color}">${score || '—'}</span>
        <span class="score-ring-unit">/100</span>
      </div>
    </div>`;
}

function scoreBar(label, value) {
  return `
    <div class="score-bar-row">
      <span class="score-bar-label">${label}</span>
      <div class="score-bar-track">
        <div class="score-bar-fill" data-width="${value}" style="width:0%"></div>
      </div>
      <span class="score-bar-val" style="color:${scoreColor(value)}">${value}</span>
    </div>`;
}

function tutorAv(slug, size = 34) {
  return `<div class="sr-avatar" style="background:${tutorColor(slug)};width:${size}px;height:${size}px;font-size:${Math.round(size*0.33)}px">${tutorInitials(slug)}</div>`;
}

function animateScores() {
  setTimeout(() => {
    document.querySelectorAll('.score-ring-progress').forEach(el => {
      el.style.strokeDashoffset = el.dataset.target;
    });
    document.querySelectorAll('.score-bar-fill').forEach(el => {
      el.style.width = el.dataset.width + '%';
    });
    document.querySelectorAll('.trend-bar').forEach(el => {
      el.style.height = el.dataset.height;
    });
  }, 80);
}

/* ============================================================
   DASHBOARD
   ============================================================ */
async function renderDashboard() {
  const [sessions, stats] = await Promise.all([MockAPI.getSessions(), MockAPI.getStats()]);
  const recent = sessions.filter(s => s.status === 'COMPLETED').slice(0, 4);
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  document.getElementById('view-root').innerHTML = `
    <div style="padding:0">
      <div class="page-header">
        <div class="page-header-left">
          <div class="page-title">Dashboard</div>
          <div class="page-subtitle">Your interview prep at a glance</div>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-primary" onclick="navigate('new-interview')">
            ${IC.plus} New Interview
          </button>
        </div>
      </div>
      <div class="page-body">

        <div class="dashboard-hero">
          <div class="hero-text">
            <span class="hero-greeting">${greet} 👋</span>
            <div class="hero-title">${greet.split(' ')[1] === 'morning' ? 'Ready to ace today?' : greet.includes('afternoon') ? 'Keep the momentum going!' : 'Evening practice session?'}</div>
            <div class="hero-sub">${stats.studyStreakDays}-day streak · ${stats.sessionsThisWeek} sessions this week · ${stats.totalMinutes} total minutes practiced</div>
          </div>
          <div class="hero-actions">
            <button class="btn btn-secondary" onclick="navigate('history')">View History</button>
            <button class="btn btn-primary btn-lg" onclick="navigate('new-interview')">${IC.plus} Start Interview</button>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon-row">
              <div class="stat-icon purple">🎯</div>
              <span class="stat-trend trend-up">+2 this week</span>
            </div>
            <div class="stat-val">${stats.completedSessions}</div>
            <div class="stat-label">Sessions Completed</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon-row">
              <div class="stat-icon blue">⭐</div>
              <span class="stat-trend trend-up">+4 pts</span>
            </div>
            <div class="stat-val gradient-text">${stats.avgScore}</div>
            <div class="stat-label">Average Score</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon-row">
              <div class="stat-icon green">🏆</div>
              <span class="stat-trend trend-up">${stats.bestScore}</span>
            </div>
            <div class="stat-val" style="font-size:16px;font-weight:700;letter-spacing:-0.3px">${stats.bestCategory}</div>
            <div class="stat-label">Best Category</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon-row">
              <div class="stat-icon orange">🔥</div>
              <span class="stat-trend trend-up">Personal best</span>
            </div>
            <div class="stat-val">${stats.studyStreakDays}</div>
            <div class="stat-label">Day Streak</div>
          </div>
        </div>

        <div class="dash-grid">
          <div>
            <div class="section-header-row">
              <span class="section-title">Recent Sessions</span>
              <button class="btn btn-ghost btn-sm" onclick="navigate('history')">View all →</button>
            </div>
            ${recent.map(s => `
              <div class="recent-session-item" onclick="${s.analysisId ? `navigate('analysis',{id:'${s.analysisId}'})` : `navigate('history')`}">
                ${tutorAv(s.tutorSlug, 38)}
                <div class="rsi-body">
                  <div class="rsi-name">${s.packageName}</div>
                  <div class="rsi-meta">${s.tutorName} · ${formatRelativeDate(s.startedAt)} · ${formatDuration(s.durationSec)}</div>
                </div>
                <div>
                  <div class="rsi-score" style="color:${scoreColor(s.score)}">${s.score || '—'}</div>
                  <div style="font-size:10px;color:var(--text-m);text-align:right">${scoreLabel(s.score)}</div>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="display:flex;flex-direction:column;gap:14px">
            <div class="tip-card">
              <div class="tip-label">💡 Practice Tip</div>
              <div class="tip-text">${stats.practiceTip}</div>
            </div>

            <div class="card card-sm">
              <div class="section-title" style="margin-bottom:10px">Quick Stats</div>
              <div class="quick-stats-grid">
                <div class="qs-item">
                  <div class="qs-val">${Math.round(stats.totalMinutes / 60)}h</div>
                  <div class="qs-label">Total Practice</div>
                </div>
                <div class="qs-item">
                  <div class="qs-val">${stats.sessionsThisWeek}</div>
                  <div class="qs-label">This Week</div>
                </div>
                <div class="qs-item">
                  <div class="qs-val">${stats.lifetimeCommunication.avgCommunicationScore}</div>
                  <div class="qs-label">Comm. Score</div>
                </div>
                <div class="qs-item">
                  <div class="qs-val">${stats.lifetimeCommunication.totalFillerWordsAllTime}</div>
                  <div class="qs-label">Total Fillers</div>
                </div>
              </div>
            </div>

            <div class="card card-sm" style="cursor:pointer" onclick="navigate('communication')">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
                <span class="section-title" style="margin-bottom:0">Communication Trend</span>
                <span style="font-size:11px;color:var(--success)">${stats.lifetimeCommunication.improvementTrend}</span>
              </div>
              <div class="trend-chart">
                ${stats.lifetimeCommunication.recentSessionScores.map((rs, i) => {
                  const pct = rs.score;
                  return `<div class="trend-bar-wrap">
                    <div class="trend-bar" data-height="${pct * 0.7}px" style="height:4px" title="Score: ${pct}"></div>
                    <span class="trend-bar-label">${rs.date.slice(5)}</span>
                  </div>`;
                }).join('')}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>`;

  animateScores();
}

/* ============================================================
   NEW INTERVIEW WIZARD
   ============================================================ */
async function renderNewInterview() {
  if (!State.selectedPackage) State.wizardStep = 1;
  if (!State.selectedTutor && State.wizardStep > 1) State.wizardStep = 2;

  const [packages, tutors] = await Promise.all([MockAPI.getPackages(), MockAPI.getTutors()]);

  const steps = [
    { n: 1, name: 'Choose Package' },
    { n: 2, name: 'Choose Tutor' },
    { n: 3, name: 'Review & Start' },
  ];

  const stepHTML = steps.map((s, i) => `
    <div class="step-item">
      <div class="step-dot ${State.wizardStep > s.n ? 'done' : State.wizardStep === s.n ? 'active' : ''}">
        ${State.wizardStep > s.n ? IC.check : s.n}
      </div>
      <div class="step-info">
        <div class="step-num">Step ${s.n}</div>
        <div class="step-name">${s.name}</div>
      </div>
      ${i < steps.length - 1 ? `<div class="step-line ${State.wizardStep > s.n ? 'done' : ''}"></div>` : ''}
    </div>
  `).join('');

  let bodyHTML = '';

  if (State.wizardStep === 1) {
    bodyHTML = `
      <div class="section-title mb-4">Select an interview package</div>
      <div class="pkg-grid">
        ${packages.map(p => `
          <div class="pkg-card ${State.selectedPackage?.slug === p.slug ? 'selected' : ''}" onclick="selectPackage('${p.slug}')">
            ${p.isPro ? '<span class="badge badge-pro" style="position:absolute;top:10px;right:10px;font-size:9px">PRO</span>' : ''}
            <span class="pkg-icon">${p.icon}</span>
            <div class="pkg-name">${p.name}</div>
            <div class="pkg-desc">${p.description}</div>
            <div class="pkg-meta">
              <span class="badge badge-muted">${p.difficulty}</span>
              <span class="badge badge-muted">${p.duration}m</span>
              <span class="badge badge-muted">${p.questionCount}Q</span>
            </div>
          </div>
        `).join('')}
      </div>`;
  } else if (State.wizardStep === 2) {
    bodyHTML = `
      <div class="section-title mb-4">Choose your AI tutor</div>
      <div class="tutor-grid">
        ${tutors.map(t => `
          <div class="tutor-card ${State.selectedTutor?.slug === t.slug ? 'selected' : ''}" onclick="selectTutor('${t.slug}')">
            ${t.isPro ? '<span class="badge badge-pro" style="position:absolute;top:10px;right:10px;font-size:9px">PRO</span>' : ''}
            <div class="tutor-avatar" style="background:${t.color}">${t.initials}</div>
            <div class="tutor-name">${t.name}</div>
            <div class="tutor-spec">${t.specialty}</div>
            <div class="tutor-tags">${t.personality.map(p => `<span class="tutor-tag">${p}</span>`).join('')}</div>
            <div style="font-size:11px;color:var(--text-m);margin-bottom:12px;padding:0 4px;line-height:1.5">${t.description}</div>
            <div class="tutor-stats">
              <div style="text-align:center"><div class="tutor-stat-val">${t.avgScore}</div><div class="tutor-stat-label">Avg Score</div></div>
              <div style="text-align:center"><div class="tutor-stat-val">${t.sessionCount}</div><div class="tutor-stat-label">Sessions</div></div>
            </div>
          </div>
        `).join('')}
      </div>`;
  } else {
    const pkg = packages.find(p => p.slug === State.selectedPackage?.slug) || State.selectedPackage;
    const tutor = tutors.find(t => t.slug === State.selectedTutor?.slug) || State.selectedTutor;
    bodyHTML = `
      <div class="section-title mb-4">Review your selection</div>
      <div class="review-card">
        <div class="review-item">
          <div class="review-icon">${pkg?.icon || '📦'}</div>
          <div>
            <div class="review-label">Interview Package</div>
            <div class="review-val">${pkg?.name}</div>
            <div style="font-size:12px;color:var(--text-m);margin-top:3px">${pkg?.description}</div>
          </div>
        </div>
        <div class="review-item">
          <div class="review-icon" style="background:${tutor?.color || '#8B5CF6'}20">
            <span style="font-size:14px;font-weight:700;color:${tutor?.color}">${tutor?.initials}</span>
          </div>
          <div>
            <div class="review-label">AI Tutor</div>
            <div class="review-val">${tutor?.name}</div>
            <div style="font-size:12px;color:var(--text-m);margin-top:3px">${tutor?.specialty}</div>
          </div>
        </div>
        <div class="review-item">
          <div class="review-icon">⏱</div>
          <div>
            <div class="review-label">Estimated Duration</div>
            <div class="review-val">${pkg?.duration} minutes</div>
          </div>
        </div>
        <div class="review-item">
          <div class="review-icon">🎙</div>
          <div>
            <div class="review-label">Mode</div>
            <div class="review-val">Voice Interview</div>
          </div>
        </div>
        <div class="review-item">
          <div class="review-icon">❓</div>
          <div>
            <div class="review-label">Questions</div>
            <div class="review-val">${pkg?.questionCount} questions</div>
          </div>
        </div>
      </div>
      <div style="margin-top:16px;padding:14px 16px;background:var(--accent-soft);border:1px solid rgba(139,92,246,0.2);border-radius:10px;font-size:12px;color:var(--text-s)">
        <strong style="color:var(--accent-v)">📁 Your notes are ready:</strong> ${getAllFiles().filter(f=>f.type==='md').length} markdown notes will be used as context to personalize this interview to your background.
      </div>`;
  }

  document.getElementById('view-root').innerHTML = `
    <div>
      <div class="page-header">
        <div class="page-header-left">
          <div class="page-title">New Interview</div>
          <div class="page-subtitle">Configure your mock interview session</div>
        </div>
      </div>
      <div class="page-body">
        <div class="wizard-wrap">
          <div class="step-indicator">${stepHTML}</div>
          ${bodyHTML}
          <div class="wizard-footer">
            <button class="btn btn-secondary" onclick="${State.wizardStep > 1 ? `goToStep(${State.wizardStep - 1})` : `navigate('dashboard')`}">
              ${State.wizardStep > 1 ? '← Back' : 'Cancel'}
            </button>
            ${State.wizardStep < 3
              ? `<button class="btn btn-primary" onclick="goToStep(${State.wizardStep + 1})" ${(State.wizardStep === 1 && !State.selectedPackage) || (State.wizardStep === 2 && !State.selectedTutor) ? 'disabled' : ''}>
                  Continue →
                </button>`
              : `<button class="btn btn-primary btn-lg" onclick="startInterview()">🚀 Start Interview</button>`
            }
          </div>
        </div>
      </div>
    </div>`;
}

window.selectPackage = (slug) => {
  const pkg = State.data.packages.find(p => p.slug === slug);
  State.selectedPackage = pkg;
  document.querySelectorAll('.pkg-card').forEach(el => el.classList.remove('selected'));
  document.querySelectorAll('.pkg-card').forEach(el => {
    if (el.onclick?.toString().includes(slug)) el.classList.add('selected');
  });
  renderNewInterview();
};

window.selectTutor = (slug) => {
  const tutor = State.data.tutors.find(t => t.slug === slug);
  State.selectedTutor = tutor;
  renderNewInterview();
};

window.goToStep = (step) => {
  if (step === 2 && !State.selectedPackage) { showToast('Select a package first', '', 'warning'); return; }
  if (step === 3 && !State.selectedTutor)  { showToast('Select a tutor first', '', 'warning'); return; }
  State.wizardStep = step;
  renderNewInterview();
};

window.startInterview = async () => {
  if (!State.selectedPackage || !State.selectedTutor) return;
  showToast('Starting session…', 'Setting up your interview', 'info');
  await MockAPI.startSession(State.selectedPackage.slug, State.selectedTutor.slug);
  State.transcriptIndex = 0;
  State.sessionSeconds = 0;
  State.sessionMicOn = true;
  navigate('session');
};

/* ============================================================
   SESSION
   ============================================================ */
async function renderSession() {
  const pkg = State.selectedPackage;
  const tutor = State.selectedTutor;
  const transcript = State.data.transcript_demo;

  document.getElementById('view-root').innerHTML = `
    <div class="session-view">
      <div class="session-topbar">
        <div class="session-info">
          <div class="session-pkg-badge">${pkg?.icon || '🎯'} ${pkg?.name || 'Interview'}</div>
          <div class="session-tutor">
            <div class="session-tutor-av" style="background:${tutor?.color || '#8B5CF6'}">${tutor?.initials || 'AI'}</div>
            <span style="font-size:13px;font-weight:500;color:var(--text-s)">${tutor?.name || 'AI Tutor'}</span>
          </div>
          <span class="badge badge-success" style="animation:livePulse 1.5s infinite">● LIVE</span>
        </div>
        <div class="session-timer-val" id="session-timer">00:00</div>
        <button class="btn btn-danger" onclick="endSession()">End Session</button>
      </div>

      <div class="session-body">
        <div class="session-stage">
          <div class="waveform active" id="waveform">
            ${Array.from({length: 12}, () => '<div class="wf-bar"></div>').join('')}
          </div>
          <div class="session-status-text" id="session-status">
            <strong>${tutor?.name || 'AI'}</strong> is speaking…
          </div>
          <div class="session-controls">
            <button class="mic-btn ${State.sessionMicOn ? 'active' : 'muted'}" id="mic-btn" onclick="toggleMic()">
              ${State.sessionMicOn ? IC.mic : IC.micOff}
            </button>
            <span style="font-size:12px;color:var(--text-m)">${State.sessionMicOn ? 'Mic On' : 'Mic Off'}</span>
          </div>
          <div style="font-size:12px;color:var(--text-m);text-align:center;max-width:300px;line-height:1.6">
            Your notes & resume are loaded as context.<br>Answers will be personalized to your background.
          </div>
        </div>

        <div class="transcript-panel">
          <div class="transcript-header">
            <div class="transcript-live-dot"></div>
            Live Transcript
          </div>
          <div class="transcript-scroll" id="transcript-scroll"></div>
        </div>
      </div>
    </div>`;

  State.sessionTimer = setInterval(() => {
    State.sessionSeconds++;
    const el = document.getElementById('session-timer');
    if (el) el.textContent = formatTimer(State.sessionSeconds);
  }, 1000);

  State.transcriptInterval = setInterval(() => {
    const turn = transcript[State.transcriptIndex];
    if (!turn) { clearInterval(State.transcriptInterval); return; }
    const scroll = document.getElementById('transcript-scroll');
    if (!scroll) { clearInterval(State.transcriptInterval); return; }
    const status = document.getElementById('session-status');
    const waveform = document.getElementById('waveform');

    const div = document.createElement('div');
    div.className = 'transcript-turn';
    div.innerHTML = `
      <span class="tt-speaker ${turn.speaker}">${turn.speaker === 'ai' ? (tutor?.name || 'AI') : 'You'}</span>
      <div class="tt-text ${turn.speaker}">${turn.text}</div>`;
    scroll.appendChild(div);
    scroll.scrollTop = scroll.scrollHeight;

    if (status) {
      if (turn.speaker === 'ai') {
        status.innerHTML = `<strong>${tutor?.name || 'AI'}</strong> is speaking…`;
        if (waveform) waveform.classList.add('active');
      } else {
        status.innerHTML = `<strong>You</strong> are responding…`;
        if (waveform) waveform.classList.remove('active');
        setTimeout(() => { if (waveform) waveform.classList.add('active'); }, 4000);
      }
    }

    State.transcriptIndex++;
  }, 4500);
}

window.toggleMic = () => {
  State.sessionMicOn = !State.sessionMicOn;
  const btn = document.getElementById('mic-btn');
  if (btn) {
    btn.className = `mic-btn ${State.sessionMicOn ? 'active' : 'muted'}`;
    btn.innerHTML = State.sessionMicOn ? IC.mic : IC.micOff;
  }
  showToast(State.sessionMicOn ? 'Microphone on' : 'Microphone muted', '', State.sessionMicOn ? 'success' : 'warning');
};

window.endSession = async () => {
  clearSessionTimers();
  showToast('Session complete!', 'Processing your responses…', 'success');
  setTimeout(() => showToast('Generating analysis…', 'Scoring your performance', 'info', 3000), 1500);

  const result = await MockAPI.endSession(State.activeSessionId);
  State.wizardStep = 1;
  State.selectedPackage = null;
  State.selectedTutor = null;

  navigate('analysis', { id: result.analysisId });

  setTimeout(() => showToast('Analyzing communication patterns…', 'Detecting filler words & phrasing', 'info', 4000), 1500);
  setTimeout(() => showToast('Communication analysis ready!', 'View detailed breakdown in Analysis', 'success', 5000), 6000);
};

/* ============================================================
   ANALYSIS
   ============================================================ */
async function renderAnalysis(params = {}) {
  const id = params.id || 'anal_001';
  const analysis = await MockAPI.getAnalysis(id);
  if (!analysis) { document.getElementById('view-root').innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">Analysis not found</div></div>`; return; }

  const session = State.data.sessions.find(s => s.id === analysis.sessionId);
  const tabs = ['Overview', 'Scores', 'Feedback', 'Report', ...(analysis.communicationAnalysis ? ['Communication'] : [])];

  document.getElementById('view-root').innerHTML = `
    <div>
      <div class="page-header">
        <div class="page-header-left">
          <button class="btn btn-ghost btn-sm" onclick="navigate('history')" style="margin-bottom:8px">← Back to History</button>
          <div class="page-title">Analysis Report</div>
          <div class="page-subtitle">${session ? `${session.packageName} · ${session.tutorName} · ${formatDate(session.startedAt)}` : ''}</div>
        </div>
        <div class="page-header-actions">
          <span class="badge badge-muted">${analysis.provider}</span>
          <span class="badge badge-success">Complete</span>
        </div>
      </div>
      <div class="page-body">

        <div class="analysis-hero">
          <div class="overall-ring-section">
            <div class="overall-ring-label">Overall Score</div>
            ${scoreRing(analysis.scores.overall, 120, 8)}
            <div class="overall-ring-caption" style="color:${scoreColor(analysis.scores.overall)};font-weight:600">${scoreLabel(analysis.scores.overall)}</div>
          </div>
          <div style="flex:1">
            <div class="score-grid-title">Score Breakdown</div>
            <div class="score-grid">
              ${scoreBar('Communication', analysis.scores.communication)}
              ${scoreBar('Technical', analysis.scores.technical)}
              ${scoreBar('Problem Solving', analysis.scores.problemSolving)}
              ${scoreBar('Confidence', analysis.scores.confidence)}
              ${scoreBar('Overall', analysis.scores.overall)}
            </div>
          </div>
        </div>

        <div class="analysis-tabs">
          ${tabs.map(t => `<button class="analysis-tab ${State.currentAnalysisTab === t.toLowerCase() ? 'active' : ''}" onclick="switchAnalysisTab('${t.toLowerCase()}')">${t}</button>`).join('')}
        </div>

        <div id="analysis-tab-content">
          ${renderAnalysisTabContent(analysis, State.currentAnalysisTab)}
        </div>
      </div>
    </div>`;

  animateScores();
}

function renderAnalysisTabContent(analysis, tab) {
  if (tab === 'overview') {
    return `
      <div class="two-col">
        <div>
          <div class="section-title">Strengths</div>
          ${analysis.strengths.map(s => `<div class="strength-item"><div class="strength-dot"></div>${s}</div>`).join('')}
        </div>
        <div>
          <div class="section-title">Areas to Improve</div>
          ${analysis.improvements.map(s => `<div class="improvement-item"><div class="improvement-dot"></div>${s}</div>`).join('')}
        </div>
      </div>`;
  }
  if (tab === 'scores') {
    const s = analysis.scores;
    return `
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:14px">
        ${[['Communication',s.communication],['Technical',s.technical],['Problem Solving',s.problemSolving],['Confidence',s.confidence],['Overall',s.overall]].map(([label,val]) => `
          <div class="card" style="text-align:center;padding:20px 14px">
            ${scoreRing(val, 80, 6)}
            <div style="font-size:12px;color:var(--text-m);margin-top:10px;font-weight:500">${label}</div>
          </div>
        `).join('')}
      </div>`;
  }
  if (tab === 'feedback') {
    return `
      <div>
        <div class="section-title mb-4">Per-Question Feedback</div>
        ${analysis.answerFeedback.map((f, i) => `
          <div class="accordion-item">
            <div class="accordion-header" onclick="toggleAccordion(this)">
              <span class="accordion-question">Q${i+1}: ${f.question}</span>
              <span class="accordion-score" style="color:${scoreColor(f.score)}">${f.score}</span>
              <span class="accordion-chevron">${IC.chevDown}</span>
            </div>
            <div class="accordion-body">
              <div class="accordion-answer">"${f.userAnswer}"</div>
              <div class="accordion-feedback">${f.feedback}</div>
            </div>
          </div>
        `).join('')}
      </div>`;
  }
  if (tab === 'report') {
    return `<div class="report-content card" style="padding:28px">${renderMarkdown(analysis.report)}</div>`;
  }
  if (tab === 'communication' && analysis.communicationAnalysis) {
    const ca = analysis.communicationAnalysis;
    return `
      <div>
        <div class="comm-score-row">
          <div class="comm-stat"><div class="comm-stat-val" style="color:${scoreColor(ca.overallCommunicationScore)}">${ca.overallCommunicationScore}</div><div class="comm-stat-label">Comm. Score</div></div>
          <div class="comm-stat"><div class="comm-stat-val">${ca.totalUserWords}</div><div class="comm-stat-label">Words Spoken</div></div>
          <div class="comm-stat"><div class="comm-stat-val">${ca.totalUserTurns}</div><div class="comm-stat-label">Turns Taken</div></div>
          <div class="comm-stat"><div class="comm-stat-val">${ca.fillerWordStats.reduce((a,f) => a+f.count,0)}</div><div class="comm-stat-label">Filler Words</div></div>
        </div>

        <div class="two-col">
          <div>
            <div class="section-title mb-4">Filler Word Analysis</div>
            ${ca.fillerWordStats.map(f => `
              <div class="filler-item">
                <span class="filler-word">"${f.word}"</span>
                <div class="filler-bar-wrap">
                  <div class="score-bar-track"><div class="score-bar-fill" data-width="${Math.min(f.count*8,100)}" style="width:0%;background:${f.severity==='high'?'var(--error)':f.severity==='medium'?'var(--warning)':'var(--info)'}"></div></div>
                </div>
                <span class="filler-count">${f.count}×</span>
                <span class="badge ${f.severity==='high'?'badge-error':f.severity==='medium'?'badge-warning':'badge-info'}">${f.severity}</span>
              </div>
            `).join('')}

            <div class="section-title mt-4 mb-4">Strengths</div>
            ${ca.strengthsInCommunication.map(s => `<div class="strength-item"><div class="strength-dot"></div>${s}</div>`).join('')}
          </div>

          <div>
            <div class="section-title mb-4">Better Alternatives</div>
            ${ca.topReplacements.map(r => `
              <div class="replacement-item" style="margin-bottom:12px">
                <div class="replacement-word">"${r.original}"</div>
                <div class="replacement-alts">${r.betterAlternatives.map(a => `<span class="alt-chip">${a}</span>`).join('')}</div>
                <div class="replacement-example">${r.exampleInContext}</div>
              </div>
            `).join('')}

            <div class="section-title mt-4 mb-4">Sentence Rewrites</div>
            ${ca.sentenceRewrites.map(rw => `
              <div class="rewrite-item">
                <div class="rewrite-original">❌ ${rw.original}</div>
                <div class="rewrite-arrow">↓ ${rw.improvement}</div>
                <div class="rewrite-new">✓ ${rw.rewritten}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>`;
  }
  return '';
}

window.switchAnalysisTab = (tab) => {
  State.currentAnalysisTab = tab;
  document.querySelectorAll('.analysis-tab').forEach(el => el.classList.toggle('active', el.onclick?.toString().includes(`'${tab}'`)));
  const analysis = Object.values(State.data.analysis).find(a => a.id === (State._navParams?.id || 'anal_001'));
  if (analysis) {
    document.getElementById('analysis-tab-content').innerHTML = renderAnalysisTabContent(analysis, tab);
    animateScores();
  }
};

window.toggleAccordion = (header) => {
  const body = header.nextElementSibling;
  const isOpen = header.classList.contains('open');
  document.querySelectorAll('.accordion-header.open').forEach(h => {
    h.classList.remove('open');
    h.nextElementSibling.classList.remove('open');
  });
  if (!isOpen) { header.classList.add('open'); body.classList.add('open'); }
};

/* ============================================================
   HISTORY
   ============================================================ */
async function renderHistory() {
  const sessions = await MockAPI.getSessions();
  const filtered = State.historyFilter === 'all' ? sessions : sessions.filter(s => s.status === State.historyFilter.toUpperCase());

  document.getElementById('view-root').innerHTML = `
    <div>
      <div class="page-header">
        <div class="page-header-left">
          <div class="page-title">Session History</div>
          <div class="page-subtitle">${sessions.length} total sessions · ${sessions.filter(s=>s.status==='COMPLETED').length} completed</div>
        </div>
      </div>
      <div class="page-body">
        <div class="history-filters">
          ${[['all','All Sessions'],['completed','Completed'],['abandoned','Abandoned']].map(([val,label]) => `
            <button class="chip ${State.historyFilter===val?'active':''}" onclick="filterHistory('${val}')">${label}</button>
          `).join('')}
        </div>

        <div class="session-table" id="session-table">
          ${filtered.length === 0
            ? `<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-title">No sessions found</div></div>`
            : filtered.map(s => renderSessionRow(s)).join('')
          }
        </div>
      </div>
    </div>`;
}

function renderSessionRow(s) {
  const isExpanded = State.expandedHistoryRow === s.id;
  const panel = State.expandedHistoryPanel[s.id] || 'recording';
  const analysisAction = s.analysisId
    ? `<button class="sr-action-btn" onclick="navigate('analysis',{id:'${s.analysisId}'})">Analysis</button>`
    : `<span class="sr-action-placeholder" aria-hidden="true"></span>`;
  const recordingAction = s.hasRecording
    ? `<button class="sr-action-btn" onclick="openHistoryPanel('${s.id}','recording')">Recording</button>`
    : `<span class="sr-action-placeholder" aria-hidden="true"></span>`;
  const transcriptAction = s.transcript?.length
    ? `<button class="sr-action-btn" onclick="openHistoryPanel('${s.id}','transcript')">Transcript</button>`
    : `<span class="sr-action-placeholder" aria-hidden="true"></span>`;
  return `
    <div class="session-row ${isExpanded ? 'expanded' : ''}" id="row-${s.id}">
      <div class="session-row-header" onclick="expandHistoryRow('${s.id}')">
        ${tutorAv(s.tutorSlug, 34)}
        <div class="sr-body">
          <div class="sr-title">${s.packageName}</div>
          <div class="sr-meta">${s.tutorName} · ${formatDate(s.startedAt)} · ${formatDuration(s.durationSec)}</div>
        </div>
        <span class="badge sr-status ${s.status==='COMPLETED'?'badge-success':s.status==='ACTIVE'?'badge-info':'badge-muted'}">${s.status}</span>
        <div class="sr-score" style="color:${scoreColor(s.score)}">${s.score || '—'}</div>
        <div class="sr-actions" onclick="event.stopPropagation()">
          ${analysisAction}
          ${recordingAction}
          ${transcriptAction}
        </div>
        <span class="sr-chevron">${IC.chevDown}</span>
      </div>
      ${isExpanded ? `
        <div class="session-panel">
          <div class="panel-tabs">
            ${s.hasRecording ? `<button class="panel-tab ${panel==='recording'?'active':''}" onclick="openHistoryPanel('${s.id}','recording')">🎧 Recording</button>` : ''}
            ${s.transcript?.length ? `<button class="panel-tab ${panel==='transcript'?'active':''}" onclick="openHistoryPanel('${s.id}','transcript')">📝 Transcript</button>` : ''}
          </div>
          <div class="panel-content">
            ${panel === 'recording' && s.hasRecording ? renderRecordingPlayer(s) : ''}
            ${panel === 'transcript' && s.transcript?.length ? renderTranscriptPanel(s) : ''}
          </div>
        </div>
      ` : ''}
    </div>`;
}

function renderRecordingPlayer(s) {
  return `
    <div class="recording-player">
      <div class="player-title">🎧 ${s.packageName} — ${formatDate(s.startedAt)}</div>
      <div class="player-progress-row">
        <span class="player-time" id="player-time-${s.id}">0:00</span>
        <div class="player-track"><div class="player-fill" id="player-fill-${s.id}"></div></div>
        <span class="player-dur">${formatTimer(s.recordingDurationSec || 0)}</span>
      </div>
      <div class="player-controls">
        <button class="player-btn" onclick="playerAction('${s.id}','rewind')" title="Back 10s">⏮</button>
        <button class="player-btn play-btn" id="play-btn-${s.id}" onclick="playerAction('${s.id}','play')">▶</button>
        <button class="player-btn" onclick="playerAction('${s.id}','forward')" title="Ahead 10s">⏭</button>
      </div>
      <div class="player-speeds">
        ${['0.5x','1x','1.5x','2x'].map(sp => `<button class="speed-chip ${sp==='1x'?'active':''}" onclick="setPlaybackSpeed('${s.id}','${sp}')">${sp}</button>`).join('')}
      </div>
      <div style="display:flex;justify-content:flex-end">
        <button class="btn btn-secondary btn-sm" onclick="exportRecording('${s.id}')">${IC.download} Export Recording</button>
      </div>
    </div>`;
}

function renderTranscriptPanel(s) {
  const turns = s.transcript || [];
  return `
    <div>
      <div class="transcript-search-bar">
        <input class="input" placeholder="Search transcript…" oninput="handleTranscriptSearch('${s.id}',this.value)" style="font-size:12px;padding:7px 11px" />
        <button class="btn btn-secondary btn-sm" onclick="exportTranscript('${s.id}')">${IC.download} Export</button>
      </div>
      <div class="transcript-list" id="transcript-list-${s.id}">
        ${turns.map(t => `
          <div class="transcript-turn-item" data-text="${t.text.toLowerCase()}">
            <span class="tt-ts">${formatTimestamp(t.timestampSec)}</span>
            <div class="tt-body">
              <div class="tt-sp-label ${t.speaker}">${t.speaker === 'ai' ? 'AI Tutor' : 'You'}</div>
              <div class="tt-content">${t.text}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;
}

window.filterHistory = (filter) => { State.historyFilter = filter; renderHistory(); };

window.expandHistoryRow = (id) => {
  State.expandedHistoryRow = State.expandedHistoryRow === id ? null : id;
  if (!State.expandedHistoryPanel[id]) State.expandedHistoryPanel[id] = 'recording';
  renderHistory();
};

window.openHistoryPanel = (id, panel) => {
  State.expandedHistoryRow = id;
  State.expandedHistoryPanel[id] = panel;
  renderHistory();
};

window.playerAction = (id, action) => {
  const msgMap = { play: 'Playback is simulated — no real audio file', rewind: 'Rewound 10 seconds (simulated)', forward: 'Advanced 10 seconds (simulated)' };
  showToast(action === 'play' ? 'Simulated Playback' : action === 'rewind' ? 'Rewind' : 'Fast Forward', msgMap[action], 'info');
};

window.setPlaybackSpeed = (id, speed) => {
  document.querySelectorAll(`[onclick*="${id}"]`).forEach(btn => {
    if (btn.classList.contains('speed-chip')) btn.classList.toggle('active', btn.textContent === speed);
  });
  showToast(`Speed set to ${speed}`, 'Playback speed changed (simulated)', 'info');
};

window.exportRecording = (id) => {
  showToast('Recording saved', `session_${id}_recording.wav downloaded to Downloads`, 'success');
};

window.exportTranscript = (id) => {
  showToast('Transcript saved', `session_${id}_transcript.txt downloaded to Downloads`, 'success');
};

window.handleTranscriptSearch = (id, query) => {
  const list = document.getElementById(`transcript-list-${id}`);
  if (!list) return;
  const q = query.toLowerCase().trim();
  list.querySelectorAll('.transcript-turn-item').forEach(item => {
    const text = item.dataset.text || '';
    const match = !q || text.includes(q);
    item.style.display = match ? '' : 'none';
    const content = item.querySelector('.tt-content');
    if (content && q) {
      const orig = item.querySelector('.tt-body .tt-content');
      content.innerHTML = text.includes(q)
        ? item.querySelector('.tt-body').children[1].textContent.replace(new RegExp(`(${q})`, 'gi'), '<mark class="highlight">$1</mark>')
        : content.textContent;
    }
  });
};

/* ============================================================
   AI CHAT
   ============================================================ */
async function renderChat() {
  const convs = await MockAPI.getConversations();
  if (!State.currentConvId && convs.length) State.currentConvId = convs[0].id;
  const activeConv = convs.find(c => c.id === State.currentConvId);

  document.getElementById('view-root').innerHTML = `
    <div class="chat-layout">
      <div class="chat-sidebar">
        <div class="chat-sb-header">
          <div class="chat-sb-title">AI Coach</div>
          <button class="btn btn-primary btn-sm w-full" onclick="createConversation()">${IC.plus} New Chat</button>
        </div>
        <div class="conv-list">
          ${convs.map(c => `
            <div class="conv-item ${c.id === State.currentConvId ? 'active' : ''}" onclick="selectConversation('${c.id}')">
              <div class="conv-item-title">${c.title}</div>
              <div class="conv-item-meta">${formatRelativeDate(c.updatedAt)} · ${c.messages.length} messages</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="chat-main">
        ${activeConv ? `
          <div class="chat-header">
            <div>
              <div class="chat-title">${activeConv.title}</div>
              <div class="chat-meta">${activeConv.messages.length} messages · Updated ${formatRelativeDate(activeConv.updatedAt)}</div>
            </div>
            <div class="files-context-banner" style="font-size:11px;padding:7px 10px;margin:0">
              📁 <strong>${getAllFiles().filter(f=>f.type==='md').length} notes loaded</strong> as AI context
            </div>
          </div>
          <div class="chat-messages" id="chat-messages">
            ${activeConv.messages.map(m => renderMessage(m)).join('')}
          </div>
          <div class="chat-input-area">
            <div class="chat-input-row">
              <textarea class="chat-input" id="chat-input" placeholder="Ask your AI coach anything…" rows="1"
                onkeydown="chatKeydown(event)" oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,120)+'px'"></textarea>
              <button class="btn btn-primary btn-icon" onclick="sendChatMessage()">${IC.send}</button>
            </div>
          </div>
        ` : `<div class="empty-state"><div class="empty-icon">💬</div><div class="empty-title">No conversation selected</div><button class="btn btn-primary" onclick="createConversation()">Start a Chat</button></div>`}
      </div>
    </div>`;

  const msgs = document.getElementById('chat-messages');
  if (msgs) msgs.scrollTop = msgs.scrollHeight;
}

function renderMessage(m) {
  const _chatActionsRegistry = window._chatActions = window._chatActions || {};
  const actionBtns = (m.actions || []).map(a => {
    const rid = 'ca_' + Math.random().toString(36).slice(2);
    _chatActionsRegistry[rid] = a;
    return `<button class="msg-action-btn" onclick="chatAction('${rid}')">${a.label}</button>`;
  }).join('');

  return `
    <div class="message ${m.role}">
      <div class="msg-avatar ${m.role}">${m.role === 'ai' ? 'AI' : 'You'}</div>
      <div class="msg-body">
        <div class="msg-bubble">${formatAIChatText(m.text)}</div>
        ${actionBtns ? `<div class="msg-actions">${actionBtns}</div>` : ''}
        <div class="msg-time">${formatRelativeDate(m.ts)}</div>
      </div>
    </div>`;
}

window.selectConversation = (id) => { State.currentConvId = id; renderChat(); };

window.createConversation = async () => {
  const title = 'New Chat — ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const conv = await MockAPI.createConversation(title);
  State.currentConvId = conv.id;
  renderChat();
};

window.chatKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
};

window.sendChatMessage = async () => {
  const input = document.getElementById('chat-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text || !State.currentConvId) return;
  input.value = '';
  input.style.height = 'auto';

  await MockAPI.addMessage(State.currentConvId, 'user', text);

  const msgs = document.getElementById('chat-messages');
  const conv = State.data.conversations.find(c => c.id === State.currentConvId);
  if (msgs && conv) {
    msgs.innerHTML = conv.messages.map(m => renderMessage(m)).join('');
    const typingEl = document.createElement('div');
    typingEl.className = 'typing-indicator';
    typingEl.id = 'typing';
    typingEl.innerHTML = `
      <div class="msg-avatar ai">AI</div>
      <div class="typing-bubble"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
    msgs.appendChild(typingEl);
    msgs.scrollTop = msgs.scrollHeight;
  }

  const delay = 1200 + Math.random() * 800;
  setTimeout(async () => {
    const aiText = getAIResponse(text);
    const aiMsg = await MockAPI.addMessage(State.currentConvId, 'ai', aiText.text);
    if (aiMsg) aiMsg.actions = aiText.actions || [];
    const typing = document.getElementById('typing');
    if (typing) typing.remove();
    const updatedConv = State.data.conversations.find(c => c.id === State.currentConvId);
    if (msgs && updatedConv) {
      msgs.innerHTML = updatedConv.messages.map(m => renderMessage(m)).join('');
      msgs.scrollTop = msgs.scrollHeight;
    }
  }, delay);
};

window.chatAction = (rid) => {
  const a = (window._chatActions || {})[rid];
  if (!a) return;
  if (a.view) navigate(a.view, a.params || {});
  else if (a.trigger) {
    const input = document.getElementById('chat-input');
    if (input) { input.value = a.trigger; sendChatMessage(); }
  }
};

/* ============================================================
   AI CHAT ENGINE
   ============================================================ */
function getAIResponse(userText) {
  const t = userText.toLowerCase();
  const sessions = (State.data?.sessions || []).filter(s => s.status === 'COMPLETED').sort((a,b) => new Date(b.startedAt)-new Date(a.startedAt));
  const latest = sessions[0];
  const latestA = latest?.analysisId ? State.data.analysis[latest.analysisId] : null;
  const stats = State.data?.stats;
  const comm = stats?.lifetimeCommunication;
  const notes = getAllFiles().filter(f => f.type === 'md');

  if (/last session|recent|how did i do|my score|results/.test(t)) {
    if (!latest) return { text: "I don't see any completed sessions yet. Let's start one!", actions: [{ label: 'Start Interview', view: 'new-interview' }] };
    return {
      text: `Your most recent session was **${latest.packageName}** with ${latest.tutorName} on ${formatDate(latest.startedAt)}.\n\n**Score: ${latest.score}/100** — ${scoreLabel(latest.score)}\n\n${latestA ? `**Key Strengths:**\n${latestA.strengths.slice(0,2).map(s=>`- ${s}`).join('\n')}\n\n**Top Improvement:**\n- ${latestA.improvements[0]}` : 'Full analysis is available in the History view.'}`,
      actions: latestA ? [{ label: 'View Full Analysis', view: 'analysis', params: { id: latestA.id } }, { label: 'Practice Again', view: 'new-interview' }] : [{ label: 'View History', view: 'history' }]
    };
  }

  if (/improve|weakness|focus|practice next|what should|prioriti|next step/.test(t)) {
    const improvements = [];
    sessions.slice(0,3).forEach(s => { const a = s.analysisId ? State.data.analysis[s.analysisId] : null; if (a) improvements.push(...a.improvements); });
    const unique = [...new Set(improvements)].slice(0,4);
    return {
      text: `Based on your last ${Math.min(sessions.length,3)} sessions, here are your **top improvement areas** ranked by impact:\n\n${unique.map((u,i) => `${i+1}. ${u}`).join('\n')}\n\nFocus on #1 first — it'll have the highest impact on your overall score.`,
      actions: [{ label: 'Start Targeted Practice', view: 'new-interview' }, { label: 'See Communication Stats', view: 'communication' }]
    };
  }

  if (/stats|progress|streak|total time|how many|overview/.test(t)) {
    return {
      text: `Here's your **progress overview:**\n\n- **Sessions Completed:** ${stats.completedSessions}\n- **Average Score:** ${stats.avgScore}/100\n- **Best Category:** ${stats.bestCategory} (${stats.bestScore})\n- **Study Streak:** ${stats.studyStreakDays} days\n- **Total Practice:** ${stats.totalMinutes} minutes\n- **Communication Score:** ${comm.avgCommunicationScore}/100\n\n${comm.improvementTrend} on communication. Keep it up!`,
      actions: [{ label: 'View History', view: 'history' }, { label: 'Communication Stats', view: 'communication' }]
    };
  }

  if (/dsa|algorithm|leetcode|array|tree|graph|sort|dynamic programming|dp|two pointer|sliding window/.test(t)) {
    return {
      text: `Your DSA sessions show **strong pattern recognition** — you identify optimal approaches quickly. Here's where to focus:\n\n**Current gaps from Alex's analysis:**\n1. **Think out loud** — your final solutions are correct but reasoning is invisible to interviewers\n2. **Clarifying questions** — always ask constraints before coding (sorted? duplicates? negatives?)\n3. **Edge cases** — build a checklist: empty, single, all-same, no-solution\n\n**7-day sprint plan:**\n- Days 1–2: Arrays & Hash Maps (Two Sum, Group Anagrams)\n- Days 3–4: Trees & Graphs (BFS/DFS, LCA)\n- Days 5–6: Dynamic Programming (Coin Change, LCS)\n- Day 7: Full mock + review`,
      actions: [{ label: 'Start DSA Session', view: 'new-interview' }, { label: 'View DSA Analysis', view: 'analysis', params: { id: 'anal_002' } }]
    };
  }

  if (/behavioral|star method|leadership|conflict|teamwork|tell me about/.test(t)) {
    return {
      text: `Your behavioral sessions with Priya show **solid STAR structure** and strong quantification. Your outage story (47min vs 4h) is genuinely compelling.\n\n**Where to push harder:**\n- **Reflection depth** — add what you *personally learned* (the "R" in STAR-AR)\n- **Story variety** — you've used the outage story twice. Build 5–6 distinct scenarios\n- **Filler words** — 14 instances in your last session. Practice recording yourself\n\n**Quick drill:** Answer "Tell me about a time you failed" and time yourself. Aim for 2 minutes with a clear reflection section.`,
      actions: [{ label: 'Practice Behavioral', view: 'new-interview' }, { label: 'View Analysis', view: 'analysis', params: { id: 'anal_001' } }]
    };
  }

  if (/system design|architecture|distributed|microservice|scale|design a|url|feed|messaging/.test(t)) {
    return {
      text: `Your system design work shows solid fundamentals. Morgan flagged **3 critical gaps** that FAANG interviewers always probe:\n\n1. **Rate limiting** — always discuss token bucket or sliding window for public APIs\n2. **Observability** — mention Prometheus, distributed tracing (Jaeger), and alerting thresholds\n3. **Failure modes** — what happens when the cache is cold? When primary DB fails?\n\n**Practice order:** Pastebin → TinyURL → Instagram Feed (increasing complexity)\n\nAdding these three sections alone could move your score from 72 → 88+.`,
      actions: [{ label: 'Practice System Design', view: 'new-interview' }, { label: 'View Design Analysis', view: 'analysis', params: { id: 'anal_003' } }]
    };
  }

  if (/hr|salary|culture fit|notice period|compensation|expectations/.test(t)) {
    return {
      text: `Your HR Round score was **91/100** — excellent! You handled salary framing well and showed flexibility.\n\n**Key HR tips to keep sharp:**\n- Always anchor salary with research context ("Based on market data for this role and location…")\n- Frame notice period as negotiable flexibility rather than a hard constraint\n- Align culture questions with company values *specifically* — generic answers lose points\n\nYour confidence in the HR round transfers well — the challenge is maintaining that in technical pressure.`,
      actions: [{ label: 'Practice HR Round', view: 'new-interview' }]
    };
  }

  if (/\balex\b/.test(t)) {
    return { text: `**Alex Chen** specializes in Technical & DSA interviews. Direct, analytical, and challenge-driven — Alex won't let you skip edge cases or vague complexity analysis.\n\n**Your sessions with Alex:** Avg score ~${Math.round((79+83+74)/3)}/100. Strongest area: pattern recognition. Weakest: verbalized reasoning.\n\nAlex is ideal for: LeetCode practice, technical screens, and anyone who needs to sharpen their "think out loud" habit.`, actions: [{ label: 'Practice with Alex', view: 'new-interview' }] };
  }

  if (/\bpriya\b/.test(t)) {
    return { text: `**Priya Sharma** specializes in Behavioral & HR interviews. Supportive and empathetic, she helps you structure authentic stories using the STAR method.\n\n**Your sessions with Priya:** Your strongest area. She's helped you develop the production outage story into a compelling leadership narrative.\n\nPriya is ideal for: FAANG behavioral prep, culture fit questions, and anyone who struggles with structure in storytelling.`, actions: [{ label: 'Practice with Priya', view: 'new-interview' }] };
  }

  if (/\bmorgan\b/.test(t)) {
    return { text: `**Morgan Blake** (Pro) specializes in System Design & Product. Strategic, big-picture thinker who brings FAANG-level expectations.\n\n**Your sessions with Morgan:** Score 72/100 — room to grow. Morgan's identified rate limiting, observability, and failure modes as your key gaps.\n\nMorgan is ideal for: Staff/Principal-level prep, system design rounds, and product manager interviews.`, actions: [{ label: 'Practice with Morgan', view: 'new-interview' }] };
  }

  if (/communication|filler|word choice|\bum\b|\blike\b|basically|phrasing/.test(t)) {
    const top = comm?.allTimeFillerStats[0];
    return {
      text: `Your **communication analysis** across all sessions:\n\n- **Avg Communication Score:** ${comm.avgCommunicationScore}/100\n- **Total Filler Words:** ${comm.totalFillerWordsAllTime} across all sessions\n- **Most Common Filler:** "${comm.topFillerAllTime}" (${top?.count} times)\n- **Trend:** ${comm.improvementTrend}\n- **Most Improved:** ${comm.mostImprovedArea}\n\n**Focus this week:** ${comm.nextFocusArea}\n\nThe fastest fix: record yourself answering one question and count your fillers. Awareness alone reduces them by ~40%.`,
      actions: [{ label: 'Full Communication Stats', view: 'communication' }, { label: 'Practice Session', view: 'new-interview' }]
    };
  }

  if (/rewrite|rephrase|express|articulate|professional|better way to say|how do i say/.test(t)) {
    const latestCA = latestA?.communicationAnalysis;
    if (latestCA?.sentenceRewrites?.length) {
      const rw = latestCA.sentenceRewrites[0];
      return {
        text: `Here's a rewrite from your latest session:\n\n❌ **Original:**\n"${rw.original}"\n\n✅ **Rewritten:**\n"${rw.rewritten}"\n\n**Why it's better:** ${rw.improvement}\n\nWant more rewrites? Check the full communication analysis.`,
        actions: [{ label: 'View Communication Analysis', view: 'analysis', params: { id: latestA.id } }]
      };
    }
    return { text: "Complete a voice session first and I'll have real sentence rewrites from your actual responses ready for you.", actions: [{ label: 'Start Session', view: 'new-interview' }] };
  }

  if (/notes|files|my notes|resume|context|study material|cheatsheet|prep material/.test(t)) {
    const noteFiles = notes;
    return {
      text: `I have access to **${noteFiles.length} of your notes** as context:\n\n${noteFiles.map(f => `- 📄 ${f.name}`).join('\n')}\n\nThese notes are used to personalize your mock interviews — when you start a session, the AI tutor uses your background, study patterns, and focus areas from these notes to generate more relevant questions.\n\nWant to add more notes? Go to Notes & Files to create or upload.`,
      actions: [{ label: 'Manage Notes', view: 'files' }, { label: 'Start Customized Interview', view: 'new-interview' }]
    };
  }

  if (/give me a|practice|quiz me|test me|question/.test(t)) {
    const questions = [
      "Tell me about the most technically complex project you've worked on. What made it hard and how did you overcome it?",
      "Given a sorted array, find if there exist two elements whose sum equals a target. Explain your approach and complexity.",
      "Design a notification system that handles 50 million events per day. Start with your requirements.",
      "Describe a time you had to influence stakeholders without direct authority. What was your strategy?",
      "What's your current expected compensation range, and how did you arrive at it?",
    ];
    const q = questions[Math.floor(Math.random() * questions.length)];
    return { text: `Here's a practice question:\n\n**"${q}"**\n\nTake 30 seconds to structure your thoughts, then respond. I'll give you feedback based on your answer.`, actions: [{ label: 'Start Full Session', view: 'new-interview' }] };
  }

  return {
    text: `I'm your AI interview coach with access to your **${sessions.length} sessions**, **${notes.length} notes**, and analysis data.\n\nHere's what I can help with:\n\n- 🔍 **Review** your last session or any specific score\n- 📈 **Improvement plan** based on your weak areas\n- 💡 **DSA, behavioral, system design** coaching\n- 🎤 **Communication feedback** and filler word reduction\n- 📝 **Rewrite sentences** from your actual sessions\n- 🎯 **Practice questions** tailored to your level\n\nWhat would you like to work on?`,
    actions: [
      { label: 'Last Session Review', trigger: 'How did I do in my last session?' },
      { label: 'What to Improve', trigger: 'What should I focus on to improve?' },
      { label: 'Start Practice', view: 'new-interview' },
    ]
  };
}

/* ============================================================
   FILES
   ============================================================ */
async function renderFiles() {
  const fs = State.data.fileSystem;

  document.getElementById('view-root').innerHTML = `
    <div class="files-layout">
      <div class="file-tree">
        <div class="file-tree-header">
          <span class="file-tree-title">Files</span>
          <div class="file-tree-actions">
            <button class="tree-action-btn" onclick="createFile()" title="New markdown file">+md</button>
            <button class="tree-action-btn" onclick="createFolder()" title="New folder">+📁</button>
            <button class="tree-action-btn" onclick="uploadFile()" title="Upload file">${IC.upload}</button>
          </div>
        </div>
        <div class="file-tree-body">
          ${fs.folders.map(f => renderFolderNode(f)).join('')}
          ${fs.rootFiles.length ? `
            <div style="padding:6px 8px;font-size:10px;color:var(--text-m);text-transform:uppercase;letter-spacing:0.5px;font-weight:600;margin-top:8px">Root Files</div>
            ${fs.rootFiles.map(f => renderFileNode(f)).join('')}
          ` : ''}
        </div>
        <div class="tree-storage-info">📁 ${fs.storageRoot} · ${getAllFiles().length} files</div>
      </div>

      <div class="editor-area" id="editor-area">
        ${State.selectedFileId ? renderEditorContent() : `
          <div class="no-file-selected">
            <div class="no-file-icon">📝</div>
            <div class="no-file-text">Select a file to view or edit</div>
            <button class="btn btn-primary btn-sm" onclick="createFile()" style="margin-top:8px">+ New Note</button>
          </div>`}
      </div>
    </div>`;
}

function renderFolderNode(folder) {
  const isOpen = State.expandedFolders.has(folder.id);
  return `
    <div class="tree-folder">
      <div class="tree-folder-row ${isOpen ? 'open' : ''}" onclick="toggleFolder('${folder.id}')">
        <span class="tree-chevron">▶</span>
        <span class="tree-folder-icon">${isOpen ? '📂' : '📁'}</span>
        <span class="tree-folder-name">${folder.name}</span>
        <span class="tree-folder-count">${folder.files.length}</span>
      </div>
      <div class="tree-files" style="${isOpen ? 'display:block' : 'display:none'}">
        ${folder.files.map(f => renderFileNode(f)).join('')}
        ${folder.files.length === 0 ? `<div style="padding:5px 8px;font-size:11px;color:var(--text-m)">Empty folder</div>` : ''}
      </div>
    </div>`;
}

function renderFileNode(file) {
  const icons = { md: '📝', pdf: '📄', docx: '📋' };
  return `
    <div class="tree-file ${State.selectedFileId === file.id ? 'selected' : ''}" onclick="selectFile('${file.id}')">
      <span class="tree-file-icon">${icons[file.type] || '📄'}</span>
      <span class="tree-file-name">${file.name}</span>
      <button class="tree-action-btn" onclick="event.stopPropagation();deleteFile('${file.id}')" title="Delete" style="opacity:0;transition:opacity 0.15s"
        onmouseenter="this.style.opacity=1" onmouseleave="this.style.opacity=0">${IC.trash}</button>
    </div>`;
}

function renderEditorContent() {
  const file = findFile(State.selectedFileId);
  if (!file) return `<div class="no-file-selected"><div class="no-file-icon">🔍</div><div class="no-file-text">File not found</div></div>`;

  if (file.type !== 'md') {
    return `
      <div class="editor-toolbar">
        <span class="editor-filename">${file.name}</span>
        <span class="badge badge-muted">${file.type.toUpperCase()}</span>
        <span class="text-muted text-sm">${file.sizeKB} KB</span>
      </div>
      <div class="file-placeholder">
        <div class="placeholder-icon">${file.type === 'pdf' ? '📄' : '📋'}</div>
        <div class="placeholder-name">${file.name}</div>
        <div class="placeholder-meta">${file.type.toUpperCase()} · ${file.sizeKB} KB · Updated ${formatRelativeDate(file.updatedAt)}</div>
        <div class="placeholder-note">Preview is simulated. In the full app, this ${file.type.toUpperCase()} would render inline with full content access for AI context generation.</div>
        <button class="btn btn-secondary btn-sm" onclick="showToast('Download simulated','File would download in production','info')">${IC.download} Download</button>
      </div>`;
  }

  return `
    <div class="editor-toolbar">
      <span class="editor-filename">${file.name}</span>
      <div class="editor-mode-tabs">
        <button class="editor-mode-btn ${State.editorMode==='edit'?'active':''}" onclick="switchEditorMode('edit')">Edit</button>
        <button class="editor-mode-btn ${State.editorMode==='preview'?'active':''}" onclick="switchEditorMode('preview')">Preview</button>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="saveFile('${file.id}')">${IC.save} Save</button>
      <button class="btn btn-danger btn-sm" onclick="deleteFile('${file.id}')">${IC.trash}</button>
    </div>
    <div class="editor-body">
      ${State.editorMode === 'edit'
        ? `<textarea class="editor-textarea" id="editor-textarea" oninput="fileEditorChange('${file.id}',this.value)">${file.content || ''}</textarea>`
        : `<div class="editor-preview report-content">${renderMarkdown(file.content || '')}</div>`
      }
    </div>`;
}

window.toggleFolder = (id) => {
  if (State.expandedFolders.has(id)) State.expandedFolders.delete(id);
  else State.expandedFolders.add(id);
  renderFiles();
};

window.selectFile = (id) => { State.selectedFileId = id; State.editorMode = 'edit'; renderFiles(); };

window.switchEditorMode = (mode) => { State.editorMode = mode; document.getElementById('editor-area').innerHTML = renderEditorContent(); };

window.fileEditorChange = (id, val) => {
  const file = findFile(id);
  if (file) file.content = val;
  clearTimeout(State.filesAutoSaveTimer);
  State.filesAutoSaveTimer = setTimeout(() => showToast('Auto-saved', file?.name, 'success', 2000), 2000);
};

window.saveFile = (id) => {
  const ta = document.getElementById('editor-textarea');
  const file = findFile(id);
  if (file && ta) { file.content = ta.value; file.updatedAt = new Date().toISOString(); }
  showToast('Saved', findFile(id)?.name, 'success');
};

window.deleteFile = (id) => {
  const file = findFile(id);
  if (!file) return;
  const fs = State.data.fileSystem;
  fs.rootFiles = fs.rootFiles.filter(f => f.id !== id);
  fs.folders.forEach(folder => { folder.files = folder.files.filter(f => f.id !== id); });
  if (State.selectedFileId === id) State.selectedFileId = null;
  showToast('Deleted', file.name, 'warning');
  renderFiles();
};

window.deleteFolder = (id) => {
  const fs = State.data.fileSystem;
  fs.folders = fs.folders.filter(f => f.id !== id);
  State.expandedFolders.delete(id);
  showToast('Folder deleted', '', 'warning');
  renderFiles();
};

window.createFile = () => {
  const name = prompt('File name (without .md):');
  if (!name) return;
  const fs = State.data.fileSystem;
  const file = { id: 'file_' + Date.now(), name: name + '.md', type: 'md', sizeKB: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), folderId: null, content: `# ${name}\n\n` };
  fs.rootFiles.push(file);
  State.selectedFileId = file.id;
  State.editorMode = 'edit';
  showToast('Created', file.name, 'success');
  renderFiles();
};

window.createFolder = () => {
  const name = prompt('Folder name:');
  if (!name) return;
  State.data.fileSystem.folders.push({ id: 'folder_' + Date.now(), name, createdAt: new Date().toISOString(), files: [] });
  showToast('Folder created', name, 'success');
  renderFiles();
};

window.uploadFile = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.md,.pdf,.docx';
  input.onchange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    const file = { id: 'file_' + Date.now(), name: f.name, type: ext, sizeKB: Math.round(f.size / 1024 * 10) / 10, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), folderId: null, content: ext === 'md' ? '' : null };
    State.data.fileSystem.rootFiles.push(file);
    State.selectedFileId = file.id;
    showToast('Uploaded', f.name + ' added to your notes', 'success');
    renderFiles();
  };
  input.click();
};

/* ============================================================
   COMMUNICATION
   ============================================================ */
async function renderCommunication() {
  const stats = await MockAPI.getStats();
  const comm = stats.lifetimeCommunication;
  const maxBar = Math.max(...comm.recentSessionScores.map(s => s.score));

  document.getElementById('view-root').innerHTML = `
    <div>
      <div class="page-header">
        <div class="page-header-left">
          <div class="page-title">Communication Coach</div>
          <div class="page-subtitle">Lifetime communication quality across all sessions</div>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-primary" onclick="navigate('new-interview')">Practice Now</button>
        </div>
      </div>
      <div class="page-body">

        <div class="comm-overview">
          <div class="comm-big-stat">
            <div class="comm-big-val gradient-text">${comm.avgCommunicationScore}</div>
            <div class="comm-big-label">Avg Communication Score</div>
            <span class="comm-trend trend-up">${comm.improvementTrend}</span>
          </div>
          <div class="comm-big-stat">
            <div class="comm-big-val" style="color:var(--error)">${comm.totalFillerWordsAllTime}</div>
            <div class="comm-big-label">Total Filler Words</div>
            <span class="comm-trend trend-down">All sessions</span>
          </div>
          <div class="comm-big-stat">
            <div class="comm-big-val">${comm.recentSessionScores.length}</div>
            <div class="comm-big-label">Sessions Analyzed</div>
            <span class="comm-trend trend-up badge-info" style="background:var(--info-bg);color:var(--info)">Communication</span>
          </div>
          <div class="comm-big-stat">
            <div class="comm-big-val" style="font-size:20px;font-weight:700">"${comm.topFillerAllTime}"</div>
            <div class="comm-big-label">Top Filler Word</div>
            <span class="comm-trend trend-down">${comm.allTimeFillerStats[0]?.count} total uses</span>
          </div>
        </div>

        <div class="two-col" style="margin-bottom:24px">
          <div class="card">
            <div class="section-title mb-4">Score Trend — Recent Sessions</div>
            <div class="trend-chart" style="height:100px">
              ${comm.recentSessionScores.map(rs => {
                const h = Math.round((rs.score / 100) * 90);
                const session = State.data.sessions.find(s => s.id === rs.sessionId);
                return `<div class="trend-bar-wrap" onclick="${session?.analysisId ? `navigate('analysis',{id:'${session.analysisId}'})` : ''}" style="${session?.analysisId ? 'cursor:pointer' : ''}">
                  <div class="trend-bar" data-height="${h}px" style="height:4px" title="${rs.score}/100 — ${rs.date}"></div>
                  <span class="trend-bar-label">${rs.date.slice(5)}</span>
                </div>`;
              }).join('')}
            </div>
          </div>

          <div class="card">
            <div class="section-title mb-4">This Week's Focus</div>
            <div style="font-size:22px;font-weight:800;color:var(--accent-v);margin-bottom:8px">${comm.nextFocusArea}</div>
            <div style="font-size:13px;color:var(--text-s);line-height:1.6;margin-bottom:14px">Most improved: <strong>${comm.mostImprovedArea}</strong></div>
            <div class="files-context-banner">
              <strong>Tip:</strong> Record yourself answering one question, then count every filler word. Awareness alone reduces usage by ~40%.
            </div>
          </div>
        </div>

        <div class="two-col">
          <div>
            <div class="section-title mb-4">All-Time Filler Words</div>
            ${comm.allTimeFillerStats.map(f => `
              <div class="filler-item">
                <span class="filler-word">"${f.word}"</span>
                <div class="filler-bar-wrap">
                  <div class="score-bar-track">
                    <div class="score-bar-fill" data-width="${Math.round((f.count/comm.allTimeFillerStats[0].count)*100)}" style="width:0%;background:${f.severity==='high'?'var(--error)':f.severity==='medium'?'var(--warning)':'var(--info)'}"></div>
                  </div>
                </div>
                <span class="filler-count">${f.count}×</span>
                <span style="font-size:11px;color:var(--text-m)">${f.percentOfTotal}%</span>
                <span class="badge ${f.severity==='high'?'badge-error':f.severity==='medium'?'badge-warning':'badge-info'}">${f.severity}</span>
              </div>
            `).join('')}

            <div class="section-title mt-4 mb-4">Recent Session Scores</div>
            ${comm.recentSessionScores.slice().reverse().map(rs => {
              const session = State.data.sessions.find(s => s.id === rs.sessionId);
              return `<div class="recent-session-item" ${session?.analysisId ? `onclick="navigate('analysis',{id:'${session.analysisId}'})"` : ''} style="${session?.analysisId ? 'cursor:pointer' : ''}">
                ${session ? tutorAv(session.tutorSlug, 34) : '<div style="width:34px;height:34px;border-radius:8px;background:var(--bg-border)"></div>'}
                <div class="rsi-body">
                  <div class="rsi-name">${session?.packageName || rs.sessionId}</div>
                  <div class="rsi-meta">${rs.date}</div>
                </div>
                <div class="rsi-score" style="color:${scoreColor(rs.score)}">${rs.score}</div>
              </div>`;
            }).join('')}
          </div>

          <div>
            <div class="section-title mb-4">Professional Replacements</div>
            ${(State.data.analysis.anal_001?.communicationAnalysis?.topReplacements || []).map(r => `
              <div class="replacement-item">
                <div class="replacement-word">"${r.original}"</div>
                <div class="replacement-alts">${r.betterAlternatives.map(a => `<span class="alt-chip">${a}</span>`).join('')}</div>
                <div class="replacement-example">${r.exampleInContext}</div>
              </div>
            `).join('')}

            <div class="section-title mt-4 mb-4">Sentence Rewrites</div>
            ${(State.data.analysis.anal_001?.communicationAnalysis?.sentenceRewrites || []).map(rw => `
              <div class="rewrite-item">
                <div class="rewrite-original">❌ ${rw.original}</div>
                <div class="rewrite-arrow">↓ ${rw.improvement}</div>
                <div class="rewrite-new">✓ ${rw.rewritten}</div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    </div>`;

  animateScores();
}

/* ============================================================
   SETTINGS
   ============================================================ */
async function renderSettings() {
  const providers = await MockAPI.getProviders();
  const providerIcons = { 'Speech-to-Text': '🎙', 'AI Analysis': '🧠', 'Local AI': '💻' };

  const tabContent = {
    providers: `
      <div class="settings-section-title">AI Providers</div>
      <div class="settings-section-sub">Configured providers for speech, analysis, and coaching. Fallback chain runs top to bottom.</div>
      ${providers.map(p => `
        <div class="provider-card">
          <div class="provider-icon">${providerIcons[p.type] || '⚙'}</div>
          <div class="provider-body">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:2px">
              <div class="provider-name">${p.name}</div>
              <span class="status-dot ${p.status.replace('-','-')}">${p.status.replace(/-/g,' ')}</span>
            </div>
            <div class="provider-type">${p.type}${p.version ? ` · ${p.version}` : ''}</div>
            <div class="provider-note">${p.note}</div>
            ${p.installHint ? `<div class="provider-hint">${p.installHint}</div>` : ''}
          </div>
        </div>
      `).join('')}`,

    apikeys: `
      <div class="settings-section-title">API Keys</div>
      <div class="settings-section-sub">Keys are stored locally and never sent to iPrep servers. Used only for direct provider calls.</div>
      <div class="api-key-form">
        ${[['Deepgram','deepgram','STT provider for live transcription'],['Anthropic / Claude','anthropic','Primary AI analysis engine'],['Google Gemini','gemini','Fallback AI provider'],['OpenAI','openai','Secondary fallback AI']].map(([label,key,hint]) => `
          <div class="api-key-row">
            <div class="input-label">${label}</div>
            <div class="input-with-action">
              <input class="input" type="password" id="key-${key}" placeholder="${hint}…" value="" autocomplete="off"/>
              <button class="input-action-btn" onclick="toggleKeyVisibility('key-${key}',this)">${IC.eye}</button>
            </div>
          </div>
        `).join('')}
        <button class="btn btn-primary" onclick="saveAPIKeys()" style="width:fit-content">Save Keys</button>
      </div>`,

    preferences: `
      <div class="settings-section-title">Preferences</div>
      <div class="settings-section-sub">Customize your default interview experience.</div>
      <div class="settings-form">
        <div class="input-group">
          <div class="input-label">Default Tutor</div>
          <select class="input" id="pref-tutor">
            ${(State.data?.tutors||[]).map(t => `<option value="${t.slug}">${t.name}</option>`).join('')}
          </select>
        </div>
        <div class="input-group">
          <div class="input-label">Default Package</div>
          <select class="input" id="pref-pkg">
            ${(State.data?.packages||[]).map(p => `<option value="${p.slug}">${p.name}</option>`).join('')}
          </select>
        </div>
        <div class="settings-divider"></div>
        <div class="toggle-wrap">
          <div class="toggle-info">
            <div class="toggle-title">Voice Mode</div>
            <div class="toggle-desc">Enable microphone input during sessions</div>
          </div>
          <label class="toggle-switch"><input type="checkbox" checked id="pref-voice"><span class="toggle-slider"></span></label>
        </div>
        <div class="toggle-wrap">
          <div class="toggle-info">
            <div class="toggle-title">Auto-Analyze on End</div>
            <div class="toggle-desc">Automatically generate analysis when session ends</div>
          </div>
          <label class="toggle-switch"><input type="checkbox" checked id="pref-auto"><span class="toggle-slider"></span></label>
        </div>
        <div class="toggle-wrap">
          <div class="toggle-info">
            <div class="toggle-title">Dark Theme</div>
            <div class="toggle-desc">Toggle between dark and light interface</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" ${document.documentElement.dataset.theme !== 'light' ? 'checked' : ''} onchange="toggleTheme()">
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="settings-divider"></div>
        <button class="btn btn-primary" onclick="savePreferences()" style="width:fit-content">Save Preferences</button>
      </div>`
  };

  document.getElementById('view-root').innerHTML = `
    <div>
      <div class="page-header">
        <div class="page-header-left">
          <div class="page-title">Settings</div>
          <div class="page-subtitle">Configure providers, API keys, and preferences</div>
        </div>
      </div>
      <div class="page-body">
        <div class="settings-layout">
          <div class="settings-nav">
            ${[['providers','⚡ Providers'],['apikeys','🔑 API Keys'],['preferences','⚙ Preferences']].map(([key,label]) => `
              <button class="settings-nav-item ${State.settingsTab===key?'active':''}" onclick="switchSettingsTab('${key}')">${label}</button>
            `).join('')}
          </div>
          <div id="settings-content">
            ${tabContent[State.settingsTab] || tabContent.providers}
          </div>
        </div>
      </div>
    </div>`;
}

window.switchSettingsTab = (tab) => {
  State.settingsTab = tab;
  renderSettings();
};

window.saveAPIKeys = () => showToast('API Keys Saved', 'Keys stored locally in this session', 'success');
window.savePreferences = () => showToast('Preferences Saved', 'Your settings have been updated', 'success');

window.toggleKeyVisibility = (id, btn) => {
  const input = document.getElementById(id);
  if (!input) return;
  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';
  btn.innerHTML = isPass ? IC.eyeOff : IC.eye;
};

/* ============================================================
   THEME
   ============================================================ */
window.toggleTheme = () => {
  const root = document.documentElement;
  const isLight = root.dataset.theme === 'light';
  root.dataset.theme = isLight ? 'dark' : 'light';
  localStorage.setItem('iprep-theme', root.dataset.theme);
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.innerHTML = root.dataset.theme === 'light'
      ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
      : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
  }
};

/* ============================================================
   INIT
   ============================================================ */
async function init() {
  const saved = localStorage.getItem('iprep-theme');
  if (saved) {
    document.documentElement.dataset.theme = saved;
    const icon = document.getElementById('theme-icon');
    if (icon && saved === 'light') {
      icon.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    }
  }

  document.getElementById('view-root').innerHTML = `<div class="loading-screen"><div class="spinner"></div><div style="font-size:13px;color:var(--text-m)">Loading iPrep…</div></div>`;

  try {
    await MockAPI.load();
  } catch (e) {
    document.getElementById('view-root').innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Could not load data</div><div class="empty-text">Make sure mock-data.json is served from the same directory.<br>${e.message}</div></div>`;
    return;
  }

  const hash = window.location.hash.replace('#', '') || 'dashboard';
  const validRoutes = ['dashboard','new-interview','session','analysis','history','chat','files','communication','settings'];
  const route = validRoutes.includes(hash) ? hash : 'dashboard';

  navigate(route);

  window.addEventListener('hashchange', () => {
    const h = window.location.hash.replace('#', '');
    if (validRoutes.includes(h) && h !== State.currentView) {
      State.currentView = h;
      renderView();
      document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.route === h);
      });
    }
  });
}

window.navigate = navigate;
init();
