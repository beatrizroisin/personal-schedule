import React, { useState } from 'react';
import { useUserStorage } from '../hooks/useStorage';
import { TASK_CATEGORIES, PRIORITIES, formatDate } from '../data';
import { v4 as uuidv4 } from 'uuid';
import './Tasks.scss';

const Tasks = ({ username }) => {
  const [tasks, setTasks] = useUserStorage('tasks', [], username);
  const [filter, setFilter] = useState('todas');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', date: '', time: '', timeEnd: '', category: 'pessoal', priority: 'media'
  });

  const addTask = () => {
    if (!form.title.trim()) return;
    const task = { ...form, id: uuidv4(), done: false, createdAt: new Date().toISOString() };
    setTasks([...tasks, task]);
    setForm({ title: '', description: '', date: '', time: '', timeEnd: '', category: 'pessoal', priority: 'media' });
    setShowForm(false);
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'todas') return true;
    if (filter === 'pendentes') return !t.done;
    if (filter === 'feitas') return t.done;
    return t.category === filter;
  });

  return (
    <div className="tasks-page">
      <div className="page-header">
        <h2>📋 Minhas Tarefas</h2>
        <p>Organize tudo o que precisa fazer! ✨</p>
      </div>

      <div className="tasks-toolbar">
        <div className="filter-tabs">
          {['todas', 'pendentes', 'feitas', ...TASK_CATEGORIES.map(c => c.id)].map(f => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {TASK_CATEGORIES.find(c => c.id === f)?.emoji || ''}
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Fechar' : '+ Nova Tarefa'}
        </button>
      </div>

      {showForm && (
        <div className="task-form card fade-in">
          <h3>✨ Nova Tarefa</h3>
          <div className="form-grid">
            <input
              className="input-soft"
              placeholder="Título da tarefa... 🌸"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
            />
            <textarea
              className="input-soft"
              placeholder="Descrição (opcional)..."
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
            />
            <div className="form-row">
              <div className="form-field">
                <label>📅 Data</label>
                <input type="date" className="input-soft" value={form.date}
                  onChange={e => setForm({...form, date: e.target.value})} />
              </div>
              <div className="form-field">
                <label>⏰ Início</label>
                <input type="time" className="input-soft" value={form.time}
                  onChange={e => setForm({...form, time: e.target.value})} />
              </div>
              <div className="form-field">
                <label>⏰ Fim</label>
                <input type="time" className="input-soft" value={form.timeEnd}
                  onChange={e => setForm({...form, timeEnd: e.target.value})} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>🏷️ Categoria</label>
                <select className="input-soft" value={form.category}
                  onChange={e => setForm({...form, category: e.target.value})}>
                  {TASK_CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>⚡ Prioridade</label>
                <select className="input-soft" value={form.priority}
                  onChange={e => setForm({...form, priority: e.target.value})}>
                  {PRIORITIES.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-soft" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="btn-primary" onClick={addTask}>✨ Salvar Tarefa</button>
          </div>
        </div>
      )}

      <div className="tasks-list">
        {filteredTasks.length === 0 && (
          <div className="empty-state">
            <div className="empty-emoji">🌸</div>
            <p>Nenhuma tarefa aqui ainda!</p>
            <span>Adicione uma nova tarefa acima 💕</span>
          </div>
        )}
        {filteredTasks.map((task, i) => {
          const cat = TASK_CATEGORIES.find(c => c.id === task.category);
          const pri = PRIORITIES.find(p => p.id === task.priority);
          return (
            <div key={task.id} className={`task-item card fade-in ${task.done ? 'done' : ''}`}
              style={{animationDelay: `${i * 0.05}s`}}>
              <button className="task-check" onClick={() => toggleTask(task.id)}>
                {task.done ? '✅' : '⭕'}
              </button>
              <div className="task-info">
                <span className="task-title">{task.title}</span>
                {task.description && <span className="task-desc">{task.description}</span>}
                <div className="task-meta">
                  {cat && (
                    <span className="task-tag" style={{background: cat.color}}>
                      {cat.emoji} {cat.label}
                    </span>
                  )}
                  {pri && (
                    <span className="task-tag" style={{background: pri.color, color: pri.textColor}}>
                      ⚡ {pri.label}
                    </span>
                  )}
                  {task.date && (
                    <span className="task-tag date-tag">
                      📅 {formatDate(task.date)}{task.time && ` ${task.time}`}{task.timeEnd && ` – ${task.timeEnd}`}
                    </span>
                  )}
                </div>
              </div>
              <button className="btn-danger" onClick={() => deleteTask(task.id)}>🗑️</button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Tasks;
