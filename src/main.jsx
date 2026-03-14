import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// ── Storage polyfill (localStorage) ──────────────────────────────────────────
if (!window.storage) {
  window.storage = {
    get: async (key) => {
      try { const val = localStorage.getItem(key); return val ? { key, value: val } : null } catch { return null }
    },
    set: async (key, value) => {
      try { localStorage.setItem(key, value); return { key, value } } catch { return null }
    },
    delete: async (key) => {
      try { localStorage.removeItem(key); return { key, deleted: true } } catch { return null }
    },
    list: async (prefix) => {
      try { const keys = Object.keys(localStorage).filter(k => !prefix || k.startsWith(prefix)); return { keys } } catch { return { keys: [] } }
    },
  }
}

// ── Clear potentially corrupted data from old versions ───────────────────────
try {
  const keys = ['morganbet_v3', 'morganbet_v4'] // old storage keys
  keys.forEach(k => localStorage.removeItem(k))
} catch {}

// ── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error, info) { console.error('MorganbetBK error:', error, info) }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight:'100vh', background:'#060e1a', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:'#0b1929', border:'1px solid rgba(239,68,68,.3)', borderRadius:16, padding:'28px 22px', maxWidth:340, textAlign:'center' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>⚠️</div>
            <h2 style={{ color:'#eef2f7', fontWeight:800, margin:'0 0 10px', fontSize:18 }}>Une erreur est survenue</h2>
            <p style={{ color:'#7a9ab8', fontSize:13, marginBottom:20, lineHeight:1.6 }}>
              Appuyez sur le bouton ci-dessous pour réinitialiser l'application.
            </p>
            <button
              onClick={() => { localStorage.clear(); window.location.reload(); }}
              style={{ width:'100%', padding:'12px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#f59e0b,#d97706)', color:'#000', fontWeight:700, fontSize:15, cursor:'pointer', fontFamily:'inherit' }}
            >
              🔄 Réinitialiser et recommencer
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)

// ── Service Worker Registration (Android notifications) ──────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      console.log('SW registered:', reg.scope);

      // Request periodic sync if supported (Android Chrome)
      if ('periodicSync' in reg) {
        try {
          await reg.periodicSync.register('check-notifications', {
            minInterval: 60 * 60 * 1000, // 1 heure minimum
          });
          console.log('Periodic sync registered');
        } catch (e) {
          console.log('Periodic sync not supported:', e);
        }
      }

      // Expose SW for use in app
      window.swRegistration = reg;

    } catch (err) {
      console.warn('SW registration failed:', err);
    }
  });
}

// ── Helper to send data to SW for background checks ──────────────────────────
window.updateSwData = (data) => {
  if (!window.swRegistration) return;
  const sw = window.swRegistration.active || window.swRegistration.installing;
  if (sw) {
    sw.postMessage({
      type: 'SCHEDULE_NOTIFICATIONS',
      data: {
        bets: data.bets || [],
        bankroll: data.bankroll?.eur || 0,
        goal: data.goal || 0,
        lang: data.lang || 'fr',
        lastCheck: 0,
      }
    });
  }
};
