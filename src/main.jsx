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

// ── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null } }
  static getDerivedStateFromError(error) { return { hasError: true, error } }
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
              🔄 Réinitialiser
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
