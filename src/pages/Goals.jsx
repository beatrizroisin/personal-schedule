import React, { useState } from 'react';
import { useUserStorage } from '../hooks/useStorage';
import { v4 as uuidv4 } from 'uuid';
import './Goals.scss';

const GOAL_EMOJIS = ['🎯','🌟','💪','🌸','📚','💰','✈️','🏋️','🎨','🎵','💡','🌿','❤️','🏠','🚀'];

const Goals = ({ username }) => {
  const [goals, setGoals] = useUserStorage('goals', [], username);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', emoji: '🎯', deadline: '', progress: 0 });
  const [editId, setEditId] = useState(null);

  const saveGoal = () => {
    if (!form.title.trim()) return;
    if (editId) {
      setGoals(goals.map(g => g.id === editId ? { ...g, ...form } : g));
      setEditId(null);
    } else {
      setGoals([...goals, { ...form, id: uuidv4(), completed: false, createdAt: new Date().toISOString() }]);
    }
    setForm({ title: '', description: '', emoji: '🎯', deadline: '', progress: 0 });
    setShowForm(false);
  };

  const toggleComplete = (id) => {
    setGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed, progress: !g.completed ? 100 : g.progress } : g));
  };

  const updateProgress = (id, value) => {
    setGoals(goals.map(g => g.id === id ? { ...g, progress: Number(value), completed: Number(value) === 100 } : g));
  };

  const deleteGoal = (id) => setGoals(goals.filter(g => g.id !== id));

  const startEdit = (goal) => {
    setForm({ title: goal.title, description: goal.description || '', emoji: goal.emoji, deadline: goal.deadline || '', progress: goal.progress || 0 });
    setEditId(goal.id);
    setShowForm(true);
  };

  const active = goals.filter(g => !g.completed);
  const completed = goals.filter(g => g.completed);

  return (
    <div className="goals-page">
      <div className="page-header">
        <h2>🎯 Metas & Objetivos</h2>
        <p>Seus sonhos merecem um plano! 🌟</p>
      </div>

      <div className="goals-stats">
        <div className="gstat card">
          <span className="gstat-num">{goals.length}</span>
          <span className="gstat-lbl">Total de metas</span>
        </div>
        <div className="gstat card">
          <span className="gstat-num">{active.length}</span>
          <span className="gstat-lbl">Em andamento</span>
        </div>
        <div className="gstat card">
          <span className="gstat-num">{completed.length}</span>
          <span className="gstat-lbl">Alcançadas 🌟</span>
        </div>
      </div>

      <div style={{display:'flex', justifyContent:'flex-end'}}>
        <button className="btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ title: '', description: '', emoji: '🎯', deadline: '', progress: 0 }); }}>
          {showForm ? '✕ Fechar' : '+ Nova Meta'}
        </button>
      </div>

      {showForm && (
        <div className="goal-form card fade-in">
          <h3>{editId ? '✏️ Editar Meta' : '✨ Nova Meta'}</h3>
          <div className="emoji-picker">
            <label>Escolha um emoji:</label>
            <div className="emojis">
              {GOAL_EMOJIS.map(e => (
                <button key={e} className={`emoji-opt ${form.emoji === e ? 'selected' : ''}`}
                  onClick={() => setForm({...form, emoji: e})}>{e}</button>
              ))}
            </div>
          </div>
          <input className="input-soft" placeholder="Título da meta... ✨"
            value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <textarea className="input-soft" placeholder="Descrição (opcional)..."
            value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <div className="form-row-2">
            <div className="form-field">
              <label>📅 Prazo</label>
              <input type="date" className="input-soft" value={form.deadline}
                onChange={e => setForm({...form, deadline: e.target.value})} />
            </div>
            <div className="form-field">
              <label>📊 Progresso: {form.progress}%</label>
              <input type="range" min="0" max="100" value={form.progress}
                onChange={e => setForm({...form, progress: Number(e.target.value)})}
                className="progress-slider" />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-soft" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="btn-primary" onClick={saveGoal}>{editId ? '💾 Atualizar' : '🎯 Criar Meta'}</button>
          </div>
        </div>
      )}

      {active.length > 0 && (
        <div className="goals-section">
          <h4 className="section-title">🔥 Em Andamento</h4>
          <div className="goals-grid">
            {active.map((goal, i) => (
              <GoalCard key={goal.id} goal={goal} i={i}
                onToggle={toggleComplete} onProgress={updateProgress}
                onEdit={startEdit} onDelete={deleteGoal} />
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div className="goals-section">
          <h4 className="section-title">🏆 Alcançadas!</h4>
          <div className="goals-grid">
            {completed.map((goal, i) => (
              <GoalCard key={goal.id} goal={goal} i={i}
                onToggle={toggleComplete} onProgress={updateProgress}
                onEdit={startEdit} onDelete={deleteGoal} />
            ))}
          </div>
        </div>
      )}

      {goals.length === 0 && (
        <div className="empty-state">
          <div className="empty-emoji">🌟</div>
          <p>Nenhuma meta ainda!</p>
          <span>Adicione seus sonhos e objetivos 💕</span>
        </div>
      )}
    </div>
  );
};

const GoalCard = ({ goal, i, onToggle, onProgress, onEdit, onDelete }) => (
  <div className={`goal-card card fade-in ${goal.completed ? 'completed' : ''}`}
    style={{ animationDelay: `${i * 0.08}s` }}>
    <div className="goal-top">
      <div className="goal-emoji-big">{goal.emoji}</div>
      <div className="goal-actions">
        <button className="btn-soft small" onClick={() => onEdit(goal)}>✏️</button>
        <button className="btn-danger" onClick={() => onDelete(goal.id)}>🗑️</button>
      </div>
    </div>
    <h4 className="goal-title">{goal.title}</h4>
    {goal.description && <p className="goal-desc">{goal.description}</p>}
    {goal.deadline && <span className="goal-deadline">📅 Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</span>}
    <div className="goal-progress">
      <div className="progress-header">
        <span>Progresso</span>
        <span>{goal.progress || 0}%</span>
      </div>
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${goal.progress || 0}%` }} />
      </div>
      <input type="range" min="0" max="100" value={goal.progress || 0}
        onChange={e => onProgress(goal.id, e.target.value)}
        className="progress-slider" />
    </div>
    <button className={`btn-complete ${goal.completed ? 'done' : ''}`} onClick={() => onToggle(goal.id)}>
      {goal.completed ? '✅ Alcançada!' : '⭕ Marcar como alcançada'}
    </button>
  </div>
);

export default Goals;
