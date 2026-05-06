import React, { useState } from 'react';
import { useUserStorage } from '../hooks/useStorage';
import { v4 as uuidv4 } from 'uuid';
import './Diary.scss';

const Diary = ({ username }) => {
  const [savedPassword, setSavedPassword] = useUserStorage('diary_password', null, username);
  const [entries, setEntries] = useUserStorage('diary_entries', [], username);
  const [unlocked, setUnlocked] = useState(false);
  const [inputPass, setInputPass] = useState('');
  const [settingPass, setSettingPass] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', mood: '🌸' });
  const [viewEntry, setViewEntry] = useState(null);

  const MOODS = ['🌸','😊','😔','💭','😄','🌙','☀️','🌈','💕','🌿'];

  const handleUnlock = () => {
    if (!savedPassword) {
      setSettingPass(true);
      return;
    }
    if (inputPass === savedPassword) {
      setUnlocked(true);
      setPassError('');
    } else {
      setPassError('Senha incorreta 🔒 Tente novamente!');
    }
  };

  const handleSetPassword = () => {
    if (newPass.length < 4) { setPassError('Senha deve ter ao menos 4 caracteres'); return; }
    if (newPass !== confirmPass) { setPassError('As senhas não coincidem'); return; }
    setSavedPassword(newPass);
    setUnlocked(true);
    setSettingPass(false);
    setPassError('');
  };

  const addEntry = () => {
    if (!form.content.trim()) return;
    const entry = {
      ...form,
      id: uuidv4(),
      date: new Date().toISOString(),
      title: form.title || `${new Date().toLocaleDateString('pt-BR')} ${form.mood}`
    };
    setEntries([entry, ...entries]);
    setForm({ title: '', content: '', mood: '🌸' });
    setShowForm(false);
  };

  const deleteEntry = (id) => {
    setEntries(entries.filter(e => e.id !== id));
    if (viewEntry?.id === id) setViewEntry(null);
  };

  const handleChangePassword = () => {
    if (newPass.length < 4) { setPassError('Senha deve ter ao menos 4 caracteres'); return; }
    if (newPass !== confirmPass) { setPassError('As senhas não coincidem'); return; }
    setSavedPassword(newPass);
    setNewPass(''); setConfirmPass('');
    setPassError('✅ Senha alterada com sucesso!');
    setTimeout(() => setPassError(''), 3000);
  };

  // Lock screen
  if (!unlocked) {
    return (
      <div className="diary-lock">
        <div className="lock-card card">
          <div className="lock-emoji">📔</div>
          <h2>Diário Secreto</h2>
          <p>Seu espaço privado e seguro 🔒</p>

          {settingPass ? (
            <>
              <p className="lock-hint">Crie uma senha para proteger seu diário:</p>
              <input type="password" className="input-soft" placeholder="Nova senha..."
                value={newPass} onChange={e => setNewPass(e.target.value)} />
              <input type="password" className="input-soft" placeholder="Confirmar senha..."
                value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSetPassword()} />
              {passError && <span className="pass-error">{passError}</span>}
              <button className="btn-primary" onClick={handleSetPassword}>🔐 Criar Senha</button>
            </>
          ) : (
            <>
              <input type="password" className="input-soft" placeholder="Digite sua senha..."
                value={inputPass} onChange={e => setInputPass(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleUnlock()} />
              {passError && <span className="pass-error">{passError}</span>}
              <button className="btn-primary" onClick={handleUnlock}>🔓 Entrar</button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (viewEntry) {
    return (
      <div className="diary-page">
        <div className="page-header">
          <button className="btn-soft" onClick={() => setViewEntry(null)}>← Voltar</button>
        </div>
        <div className="diary-view card fade-in">
          <div className="dv-header">
            <span className="dv-mood">{viewEntry.mood}</span>
            <div>
              <h3>{viewEntry.title}</h3>
              <span className="dv-date">{new Date(viewEntry.date).toLocaleDateString('pt-BR', {weekday:'long', day:'numeric', month:'long', year:'numeric'})}</span>
            </div>
          </div>
          <div className="dv-content">{viewEntry.content}</div>
          <button className="btn-danger" onClick={() => deleteEntry(viewEntry.id)}>🗑️ Excluir entrada</button>
        </div>
      </div>
    );
  }

  return (
    <div className="diary-page">
      <div className="page-header">
        <h2>📔 Meu Diário</h2>
        <p>Seu espaço íntimo e seguro 💕</p>
      </div>

      <div className="diary-toolbar">
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Fechar' : '✏️ Nova Entrada'}
        </button>
        <button className="btn-soft" onClick={() => setUnlocked(false)}>🔒 Bloquear</button>
      </div>

      {showForm && (
        <div className="diary-form card fade-in">
          <h3>📝 Nova Entrada</h3>
          <div className="mood-select">
            <label>Como está seu humor?</label>
            <div className="moods">
              {MOODS.map(m => (
                <button key={m} className={`mood-btn ${form.mood === m ? 'selected' : ''}`}
                  onClick={() => setForm({...form, mood: m})}>{m}</button>
              ))}
            </div>
          </div>
          <input className="input-soft" placeholder="Título (opcional)..."
            value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <textarea className="input-soft diary-textarea"
            placeholder="Escreva seus pensamentos, sentimentos, o que quiser... este é seu espaço 💕"
            value={form.content} onChange={e => setForm({...form, content: e.target.value})} />
          <div className="form-actions">
            <button className="btn-soft" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="btn-primary" onClick={addEntry}>💕 Salvar</button>
          </div>
        </div>
      )}

      <div className="diary-entries">
        {entries.length === 0 && (
          <div className="empty-state">
            <div className="empty-emoji">📔</div>
            <p>Nenhuma entrada ainda!</p>
            <span>Comece a escrever seus pensamentos 💕</span>
          </div>
        )}
        {entries.map((entry, i) => (
          <div key={entry.id} className="diary-entry-card card fade-in"
            style={{ animationDelay: `${i * 0.06}s` }}
            onClick={() => setViewEntry(entry)}>
            <div className="de-mood">{entry.mood}</div>
            <div className="de-info">
              <h4>{entry.title}</h4>
              <p className="de-preview">{entry.content.substring(0, 100)}{entry.content.length > 100 ? '...' : ''}</p>
              <span className="de-date">{new Date(entry.date).toLocaleDateString('pt-BR', {day:'2-digit', month:'long', year:'numeric'})}</span>
            </div>
            <button className="btn-danger entry-del" onClick={e => { e.stopPropagation(); deleteEntry(entry.id); }}>🗑️</button>
          </div>
        ))}
      </div>

      <div className="change-pass-section card">
        <h4>🔐 Alterar Senha</h4>
        <div className="pass-form">
          <input type="password" className="input-soft" placeholder="Nova senha..."
            value={newPass} onChange={e => setNewPass(e.target.value)} />
          <input type="password" className="input-soft" placeholder="Confirmar senha..."
            value={confirmPass} onChange={e => setConfirmPass(e.target.value)} />
          {passError && <span className="pass-error">{passError}</span>}
          <button className="btn-soft" onClick={handleChangePassword}>💾 Alterar Senha</button>
        </div>
      </div>
    </div>
  );
};

export default Diary;