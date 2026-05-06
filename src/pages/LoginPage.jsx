import React, { useState } from 'react';
import { useAuth } from '../hooks/AuthContext';
import './LoginPage.scss';

const AVATARS = ['🌸','🦋','🌺','🌙','⭐','🌈','💕','🌷','🍀','🌻','🦄','🐱','🌊','🎀','💎','🌿'];

const LoginPage = () => {
  const { login, register, listUsers } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', password: '', displayName: '', avatar: '🌸' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const users = listUsers();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const result = login(form.username, form.password);
      if (!result.ok) setError(result.error);
      setLoading(false);
    }, 400);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.displayName.trim()) { setError('Digite seu nome!'); return; }
    setLoading(true);
    setTimeout(() => {
      const result = register(form.username, form.password, form.displayName, form.avatar);
      if (!result.ok) setError(result.error);
      setLoading(false);
    }, 400);
  };

  const quickLogin = (username) => {
    setForm(f => ({ ...f, username, password: '' }));
    setMode('login');
  };

  return (
    <div className="login-page">
      {/* Floating decorations */}
      {['🦋','✨','🌸','💕','🌷','⭐','🌺','💫'].map((e, i) => (
        <span key={i} className="login-deco" style={{
          top: `${8 + i * 11}%`, left: `${5 + (i % 3) * 35}%`,
          animationDelay: `${i * 0.8}s`, fontSize: `${1.4 + (i % 3) * 0.5}rem`
        }}>{e}</span>
      ))}

      <div className="login-container">
        {/* Logo */}
        <div className="login-logo">
          <span className="login-logo-emoji">🦋</span>
          <h1>Meu Cantinho</h1>
          <p>Seu espaço pessoal de organização 💕</p>
        </div>

        {/* Quick user select — only show if there are users */}
        {users.length > 0 && mode === 'login' && (
          <div className="user-select-section">
            <p className="us-label">Quem é você? 👇</p>
            <div className="user-avatars">
              {users.map(u => (
                <button
                  key={u.username}
                  className={`ua-btn ${form.username === u.username ? 'active' : ''}`}
                  onClick={() => quickLogin(u.username)}
                >
                  <span className="ua-avatar">{u.avatar}</span>
                  <span className="ua-name">{u.displayName}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form card */}
        <div className="login-card">
          {/* Tabs */}
          <div className="login-tabs">
            <button className={`ltab ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setError(''); }}>
              🔓 Entrar
            </button>
            <button className={`ltab ${mode === 'register' ? 'active' : ''}`} onClick={() => { setMode('register'); setError(''); }}>
              ✨ Criar conta
            </button>
          </div>

          {mode === 'login' ? (
            <form className="login-form" onSubmit={handleLogin}>
              <div className="form-field">
                <label>👤 Usuário</label>
                <input
                  className="input-login"
                  placeholder="seu.usuario"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  autoComplete="username"
                  autoFocus
                />
              </div>
              <div className="form-field">
                <label>🔒 Senha</label>
                <input
                  type="password"
                  className="input-login"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                />
              </div>
              {error && <div className="login-error">❌ {error}</div>}
              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? '🌸 Entrando...' : '🔓 Entrar no meu cantinho'}
              </button>
            </form>
          ) : (
            <form className="login-form" onSubmit={handleRegister}>
              <div className="form-field">
                <label>😊 Como posso te chamar?</label>
                <input
                  className="input-login"
                  placeholder="Ex: Ana, Maria, Júlia..."
                  value={form.displayName}
                  onChange={e => setForm({ ...form, displayName: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label>🎨 Escolha seu avatar</label>
                <div className="avatar-grid">
                  {AVATARS.map(a => (
                    <button
                      key={a}
                      type="button"
                      className={`avatar-opt ${form.avatar === a ? 'selected' : ''}`}
                      onClick={() => setForm({ ...form, avatar: a })}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-field">
                <label>👤 Usuário (para login)</label>
                <input
                  className="input-login"
                  placeholder="ex: ana123 (sem espaços)"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value.replace(/\s/g, '').toLowerCase() })}
                  autoComplete="username"
                />
                <span className="field-hint">Mínimo 3 caracteres, sem espaços</span>
              </div>
              <div className="form-field">
                <label>🔒 Senha</label>
                <input
                  type="password"
                  className="input-login"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  autoComplete="new-password"
                />
                <span className="field-hint">Mínimo 4 caracteres</span>
              </div>
              {error && <div className="login-error">❌ {error}</div>}
              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? '🌸 Criando...' : '✨ Criar minha conta'}
              </button>
            </form>
          )}
        </div>

        <p className="login-footer">feito com 💕 • dados salvos no seu dispositivo</p>
      </div>
    </div>
  );
};

export default LoginPage;
