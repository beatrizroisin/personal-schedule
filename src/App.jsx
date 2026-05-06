import React, { useState, useEffect } from 'react';
import './styles/App.scss';

import { useAuth } from './hooks/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Goals from './pages/Goals';
import Diary from './pages/Diary';
import Feelings from './pages/Feelings';
import Shopping from './pages/Shopping';
import Resolver from './pages/Resolver';
import Calendar from './pages/Calendar';
import Water from './pages/Water';

// Bottom nav: only the most-used pages (max 5 for mobile UX)
const BOTTOM_NAV = [
  { id: 'dashboard', label: 'Início',    emoji: '🌸' },
  { id: 'tasks',     label: 'Tarefas',   emoji: '📋' },
  { id: 'calendar',  label: 'Agenda',    emoji: '📅' },
  { id: 'feelings',  label: 'Humor',     emoji: '🌈' },
  { id: 'more',      label: 'Mais',      emoji: '☰'  },
];

const ALL_NAV = [
  { id: 'dashboard', label: 'Início',          emoji: '🌸' },
  { id: 'sep1', type: 'sep', label: 'Organização' },
  { id: 'calendar',  label: 'Calendário',      emoji: '📅' },
  { id: 'tasks',     label: 'Tarefas',         emoji: '📋' },
  { id: 'resolver',  label: 'A Resolver',      emoji: '⚡' },
  { id: 'sep2', type: 'sep', label: 'Compras' },
  { id: 'shopping',  label: 'Lista de Compras',emoji: '🛍️' },
  { id: 'sep3', type: 'sep', label: 'Bem-estar' },
  { id: 'feelings',  label: 'Sentimentos',     emoji: '🌈' },
  { id: 'water',     label: 'Hidratação',      emoji: '💧' },
  { id: 'goals',     label: 'Metas & Objetivos',emoji: '🎯' },
  { id: 'diary',     label: 'Meu Diário',      emoji: '📔' },
];

const DECORATIONS = ['🦋','✨','🌸','💕','🌷','⭐','🌺','💫','🌼','🍀'];

// ── Profile page ──────────────────────────────────────────────────
const ProfilePage = ({ onBack }) => {
  const { currentUser, updateProfile } = useAuth();
  const AVATARS = ['🌸','🦋','🌺','🌙','⭐','🌈','💕','🌷','🍀','🌻','🦄','🐱','🌊','🎀','💎','🌿'];
  const [name, setName] = useState(currentUser.displayName);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [saved, setSaved] = useState(false);

  const save = () => {
    if (!name.trim()) return;
    updateProfile(name.trim(), avatar);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="page-header">
        <button className="btn-soft" onClick={onBack} style={{ marginBottom: '8px' }}>← Voltar</button>
        <h2>✏️ Editar Perfil</h2>
      </div>
      <div className="card" style={{ padding: '24px', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ textAlign: 'center', fontSize: '4rem' }}>{avatar}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '.8rem', fontWeight: 800, color: '#8b7da0' }}>🎨 Avatar</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {AVATARS.map(a => (
              <button key={a} onClick={() => setAvatar(a)} style={{
                fontSize: '1.5rem', padding: '6px',
                border: `2px solid ${avatar === a ? '#f48fb1' : 'transparent'}`,
                borderRadius: '10px',
                background: avatar === a ? '#fce4ec' : 'rgba(255,255,255,.7)',
                cursor: 'pointer', transition: 'all .2s',
                transform: avatar === a ? 'scale(1.12)' : 'scale(1)'
              }}>{a}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '.8rem', fontWeight: 800, color: '#8b7da0' }}>😊 Nome</label>
          <input className="input-soft" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome..." />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '.8rem', fontWeight: 800, color: '#8b7da0' }}>👤 Usuário</label>
          <input className="input-soft" value={`@${currentUser.username}`} disabled style={{ opacity: 0.6 }} />
        </div>
        {saved && (
          <div style={{ background: '#d4f5e9', color: '#1b5e20', padding: '10px 14px', borderRadius: '14px', fontSize: '.85rem', fontWeight: 700 }}>
            ✅ Perfil atualizado!
          </div>
        )}
        <button className="btn-primary" onClick={save}>💾 Salvar</button>
      </div>
    </div>
  );
};

// ── Main App ──────────────────────────────────────────────────────
const App = () => {
  const { currentUser, logout } = useAuth();
  const [page, setPage]               = useState('dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [isMobile, setIsMobile]       = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Close drawer on navigation
  const navigate = (id) => {
    setPage(id);
    setDrawerOpen(false);
    setShowUserMenu(false);
  };

  const [decos] = useState(() =>
    Array.from({ length: 8 }, (_, i) => ({
      emoji: DECORATIONS[i % DECORATIONS.length],
      top: `${10 + Math.random() * 80}%`,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      size: `${1.5 + Math.random() * 2}rem`,
    }))
  );

  if (!currentUser) return <LoginPage />;

  const props = { username: currentUser.username };
  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard {...props} />;
      case 'tasks':     return <Tasks {...props} />;
      case 'goals':     return <Goals {...props} />;
      case 'diary':     return <Diary {...props} />;
      case 'feelings':  return <Feelings {...props} />;
      case 'shopping':  return <Shopping {...props} />;
      case 'resolver':  return <Resolver {...props} />;
      case 'calendar':  return <Calendar {...props} />;
      case 'water':     return <Water {...props} />;
      case 'profile':   return <ProfilePage onBack={() => navigate('dashboard')} />;
      default:          return <Dashboard {...props} />;
    }
  };

  const today    = new Date();
  const dateStr  = today.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
  const pageName = ALL_NAV.find(n => n.id === page)?.label || 'Início';

  // ── MOBILE LAYOUT ─────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="app-wrapper mobile" onClick={() => { setShowUserMenu(false); }}>
        {/* Floating decos (fewer on mobile) */}
        {decos.slice(0,4).map((d, i) => (
          <span key={i} className="floating-deco"
            style={{ top: d.top, left: d.left, animationDelay: d.delay, fontSize: '1.4rem' }}>
            {d.emoji}
          </span>
        ))}

        {/* ── MOBILE HEADER ── */}
        <header className="mobile-header">
          <button className="mh-menu-btn" onClick={e => { e.stopPropagation(); setDrawerOpen(v => !v); }}>
            <span className={`hamburger ${drawerOpen ? 'open' : ''}`}>
              <span/><span/><span/>
            </span>
          </button>
          <div className="mh-center">
            <span className="mh-logo-emoji">🦋</span>
            <span className="mh-title">Meu Cantinho</span>
          </div>
          <button className="mh-avatar-btn" onClick={e => { e.stopPropagation(); setShowUserMenu(v => !v); }}>
            <span className="mh-avatar">{currentUser.avatar}</span>
          </button>

          {/* User dropdown */}
          {showUserMenu && (
            <div className="mobile-user-menu" onClick={e => e.stopPropagation()}>
              <div className="mum-info">
                <span className="mum-avatar">{currentUser.avatar}</span>
                <div>
                  <div className="mum-name">{currentUser.displayName}</div>
                  <div className="mum-username">@{currentUser.username}</div>
                </div>
              </div>
              <button className="mum-item" onClick={() => { navigate('profile'); setShowUserMenu(false); }}>
                ✏️ Editar perfil
              </button>
              <button className="mum-item logout" onClick={logout}>
                🚪 Sair da conta
              </button>
            </div>
          )}
        </header>

        {/* ── DRAWER OVERLAY ── */}
        {drawerOpen && (
          <div className="drawer-overlay" onClick={() => setDrawerOpen(false)}>
            <div className="drawer" onClick={e => e.stopPropagation()}>
              <div className="drawer-logo">
                <span className="logo-emoji">🦋</span>
                <h1>Meu Cantinho</h1>
                <p>{dateStr}</p>
              </div>
              <nav className="drawer-nav">
                {ALL_NAV.map(item => {
                  if (item.type === 'sep') {
                    return <div key={item.id} className="nav-section-label">{item.label}</div>;
                  }
                  return (
                    <button key={item.id}
                      className={`nav-item ${page === item.id ? 'active' : ''}`}
                      onClick={() => navigate(item.id)}>
                      <span className="nav-emoji">{item.emoji}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
              <div className="drawer-user-area">
                <div className="drawer-user">
                  <span>{currentUser.avatar}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '.85rem' }}>{currentUser.displayName}</div>
                    <div style={{ fontSize: '.72rem', color: '#b8a9c9' }}>@{currentUser.username}</div>
                  </div>
                </div>
                <button className="btn-soft drawer-logout" onClick={logout}>🚪 Sair</button>
              </div>
            </div>
          </div>
        )}

        {/* ── MOBILE CONTENT ── */}
        <main className="mobile-content">
          {renderPage()}
        </main>

        {/* ── BOTTOM NAV ── */}
        <nav className="bottom-nav">
          {BOTTOM_NAV.map(item => {
            if (item.id === 'more') {
              return (
                <button key="more" className={`bn-item ${drawerOpen ? 'active' : ''}`}
                  onClick={e => { e.stopPropagation(); setDrawerOpen(v => !v); }}>
                  <span className="bn-emoji">{item.emoji}</span>
                  <span className="bn-label">{item.label}</span>
                </button>
              );
            }
            return (
              <button key={item.id}
                className={`bn-item ${page === item.id ? 'active' : ''}`}
                onClick={() => navigate(item.id)}>
                <span className="bn-emoji">{item.emoji}</span>
                <span className="bn-label">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  // ── DESKTOP LAYOUT (unchanged) ────────────────────────────────
  return (
    <div className="app-wrapper" onClick={() => setShowUserMenu(false)}>
      {decos.map((d, i) => (
        <span key={i} className="floating-deco"
          style={{ top: d.top, left: d.left, animationDelay: d.delay, fontSize: d.size }}>
          {d.emoji}
        </span>
      ))}

      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-emoji">🦋</span>
          <h1>Meu Cantinho</h1>
        </div>
        <div className="sidebar-date">
          {dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}
        </div>
        <nav className="sidebar-nav">
          {ALL_NAV.map(item => {
            if (item.type === 'sep') {
              return <div key={item.id} className="nav-section-label">{item.label}</div>;
            }
            return (
              <button key={item.id}
                className={`nav-item ${page === item.id ? 'active' : ''}`}
                onClick={() => navigate(item.id)}>
                <span className="nav-emoji">{item.emoji}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-user" onClick={e => { e.stopPropagation(); setShowUserMenu(v => !v); }}>
          <span className="su-avatar">{currentUser.avatar}</span>
          <div className="su-info">
            <span className="su-name">{currentUser.displayName}</span>
            <span className="su-username">@{currentUser.username}</span>
          </div>
          <span className="su-arrow">{showUserMenu ? '▲' : '▼'}</span>
        </div>
        {showUserMenu && (
          <div className="user-menu" onClick={e => e.stopPropagation()}>
            <button className="um-item" onClick={() => { navigate('profile'); setShowUserMenu(false); }}>
              ✏️ Editar perfil
            </button>
            <button className="um-item logout" onClick={logout}>
              🚪 Sair da conta
            </button>
          </div>
        )}
      </aside>

      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
