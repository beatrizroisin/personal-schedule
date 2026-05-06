import React, { useState } from 'react';
import { useUserStorage } from '../hooks/useStorage';
import { v4 as uuidv4 } from 'uuid';
import './Resolver.scss';

const RESOLVE_CATEGORIES = [
  { id: 'ligacao', label: 'Ligar para...', emoji: '📞', color: '#d4f5e9' },
  { id: 'agendamento', label: 'Agendar', emoji: '📅', color: '#e3f2fd' },
  { id: 'pagamento', label: 'Pagar / Financeiro', emoji: '💰', color: '#fff9c4' },
  { id: 'email', label: 'Enviar / Responder', emoji: '📧', color: '#fce4ec' },
  { id: 'pesquisa', label: 'Pesquisar / Ver', emoji: '🔍', color: '#e8d5f5' },
  { id: 'outros', label: 'Outros', emoji: '⚡', color: '#ffe8d6' },
];

const URGENCIES = [
  { id: 'urgente', label: 'Urgente', color: '#ffcdd2', textColor: '#c62828', emoji: '🔴' },
  { id: 'logo', label: 'Em breve', color: '#fff9c4', textColor: '#f57f17', emoji: '🟡' },
  { id: 'quando_puder', label: 'Quando puder', color: '#d4f5e9', textColor: '#2e7d32', emoji: '🟢' },
];

const Resolver = ({ username }) => {
  const [items, setItems] = useUserStorage('resolver', [], username);
  const [filter, setFilter] = useState('todos');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', notes: '', category: 'outros', urgency: 'logo', deadline: '' });

  const addItem = () => {
    if (!form.title.trim()) return;
    setItems([{ ...form, id: uuidv4(), done: false, createdAt: new Date().toISOString() }, ...items]);
    setForm({ title: '', notes: '', category: 'outros', urgency: 'logo', deadline: '' });
    setShowForm(false);
  };

  const toggleItem = (id) => setItems(items.map(i => i.id === id ? { ...i, done: !i.done } : i));
  const deleteItem = (id) => setItems(items.filter(i => i.id !== id));

  const filtered = items.filter(i => {
    if (filter === 'todos') return true;
    if (filter === 'pendentes') return !i.done;
    if (filter === 'resolvidos') return i.done;
    return i.urgency === filter || i.category === filter;
  });

  const pending = items.filter(i => !i.done);
  const urgent = pending.filter(i => i.urgency === 'urgente');

  return (
    <div className="resolver-page">
      <div className="page-header">
        <h2>⚡ Coisas a Resolver</h2>
        <p>Não deixe nada passar! 💪</p>
      </div>

      {urgent.length > 0 && (
        <div className="urgent-banner fade-in">
          <span>🔴</span>
          <div>
            <strong>{urgent.length} item{urgent.length > 1 ? 's' : ''} urgente{urgent.length > 1 ? 's' : ''}!</strong>
            <span> Não esqueça: {urgent.slice(0,2).map(u => u.title).join(', ')}{urgent.length > 2 ? '...' : ''}</span>
          </div>
        </div>
      )}

      <div className="resolver-stats">
        <div className="rst-card card">
          <span className="rst-num">{pending.length}</span>
          <span className="rst-lbl">A resolver</span>
        </div>
        <div className="rst-card card">
          <span className="rst-num">{urgent.length}</span>
          <span className="rst-lbl">🔴 Urgentes</span>
        </div>
        <div className="rst-card card">
          <span className="rst-num">{items.filter(i=>i.done).length}</span>
          <span className="rst-lbl">✅ Resolvidos</span>
        </div>
      </div>

      <div className="resolver-toolbar">
        <div className="filter-tabs">
          {['todos', 'pendentes', 'resolvidos'].map(f => (
            <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          {URGENCIES.map(u => (
            <button key={u.id} className={`filter-tab ${filter === u.id ? 'active' : ''}`} onClick={() => setFilter(u.id)}>
              {u.emoji} {u.label}
            </button>
          ))}
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Fechar' : '+ Adicionar'}
        </button>
      </div>

      {showForm && (
        <div className="resolver-form card fade-in">
          <h3>⚡ Nova Coisa a Resolver</h3>
          <input className="input-soft" placeholder="O que precisa resolver? Ex: Ligar para o médico..."
            value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <textarea className="input-soft" placeholder="Notas adicionais (opcional)..."
            value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          <div className="form-row-2">
            <div className="form-field">
              <label>📂 Categoria</label>
              <select className="input-soft" value={form.category}
                onChange={e => setForm({...form, category: e.target.value})}>
                {RESOLVE_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>⚡ Urgência</label>
              <select className="input-soft" value={form.urgency}
                onChange={e => setForm({...form, urgency: e.target.value})}>
                {URGENCIES.map(u => (
                  <option key={u.id} value={u.id}>{u.emoji} {u.label}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>📅 Prazo</label>
              <input type="date" className="input-soft" value={form.deadline}
                onChange={e => setForm({...form, deadline: e.target.value})} />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-soft" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="btn-primary" onClick={addItem}>⚡ Adicionar</button>
          </div>
        </div>
      )}

      <div className="resolver-list">
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-emoji">🌟</div>
            <p>Tudo em dia!</p>
            <span>Nenhum item aqui 💕</span>
          </div>
        )}
        {filtered.map((item, i) => {
          const cat = RESOLVE_CATEGORIES.find(c => c.id === item.category);
          const urg = URGENCIES.find(u => u.id === item.urgency);
          return (
            <div key={item.id} className={`resolver-item card fade-in ${item.done ? 'done' : ''} urgency-${item.urgency}`}
              style={{ animationDelay: `${i * 0.05}s` }}>
              <button className="ri-check" onClick={() => toggleItem(item.id)}>
                {item.done ? '✅' : '⭕'}
              </button>
              <div className="ri-info">
                <span className="ri-title">{item.title}</span>
                {item.notes && <span className="ri-notes">{item.notes}</span>}
                <div className="ri-meta">
                  {cat && <span className="ri-tag" style={{background: cat.color}}>{cat.emoji} {cat.label}</span>}
                  {urg && <span className="ri-tag" style={{background: urg.color, color: urg.textColor}}>{urg.emoji} {urg.label}</span>}
                  {item.deadline && <span className="ri-tag deadline">📅 {new Date(item.deadline).toLocaleDateString('pt-BR')}</span>}
                </div>
              </div>
              <button className="btn-danger" onClick={() => deleteItem(item.id)}>🗑️</button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Resolver;
