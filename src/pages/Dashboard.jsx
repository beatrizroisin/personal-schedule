import React from 'react';
import { getDailyPhrase, EMOTIONS, getTodayKey, formatDateLong } from '../data';
import { useUserStorage } from '../hooks/useStorage';
import './Dashboard.scss';

const Dashboard = ({ username }) => {
  const [emotions, setEmotions] = useUserStorage('emotions', {}, username);
  const [tasks] = useUserStorage('tasks', [], username);
  const [goals] = useUserStorage('goals', [], username);
  const todayKey = getTodayKey();
  const todayEmotions = emotions[todayKey] || [];
  const phrase = getDailyPhrase();

  const toggleEmotion = (emotion) => {
    const current = emotions[todayKey] || [];
    const exists = current.find(e => e.label === emotion.label);
    const updated = exists
      ? current.filter(e => e.label !== emotion.label)
      : [...current, emotion];
    setEmotions({ ...emotions, [todayKey]: updated });
  };

  const todayTasks = tasks.filter(t => {
    if (!t.date) return false;
    const d = new Date(t.date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });

  const pendingGoals = goals.filter(g => !g.completed).slice(0, 3);

  return (
    <div className="dashboard">
      {/* Greeting */}
      <div className="dashboard-greeting fade-in">
        <div className="greeting-emoji">🌸</div>
        <div>
          <h2>Olá, bem-vinda! ✨</h2>
          <p>{formatDateLong(new Date())}</p>
        </div>
      </div>

      {/* Frase motivacional */}
      <div className="motivation-card fade-in">
        <div className="motivation-sparkles">✨</div>
        <div className="motivation-butterfly">🦋</div>
        <p className="motivation-text">"{phrase.text}"</p>
        <span className="motivation-author">— {phrase.author}</span>
      </div>

      {/* Como você está hoje? */}
      <div className="feelings-card card fade-in">
        <div className="card-header">
          <h3>🌈 Como você está hoje?</h3>
        </div>
        <p className="feelings-hint">Selecione quantas emoções quiser:</p>
        <div className="emotions-grid">
          {EMOTIONS.map(emotion => {
            const selected = todayEmotions.find(e => e.label === emotion.label);
            return (
              <button
                key={emotion.label}
                className={`emotion-btn ${selected ? 'selected' : ''}`}
                style={{ '--emotion-bg': emotion.color }}
                onClick={() => toggleEmotion(emotion)}
              >
                <span className="emotion-emoji">{emotion.emoji}</span>
                <span className="emotion-label">{emotion.label}</span>
              </button>
            );
          })}
        </div>
        {todayEmotions.length > 0 && (
          <div className="today-emotions">
            <span className="te-label">Hoje você está: </span>
            {todayEmotions.map(e => (
              <span key={e.label} className="te-chip">
                {e.emoji} {e.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Resumo rápido */}
      <div className="quick-summary">
        <div className="summary-card card fade-in" style={{animationDelay:'0.1s'}}>
          <div className="summary-icon">📋</div>
          <div className="summary-info">
            <span className="summary-number">{todayTasks.length}</span>
            <span className="summary-label">Tarefas hoje</span>
          </div>
          <div className="summary-done">{todayTasks.filter(t=>t.done).length} feitas ✓</div>
        </div>
        <div className="summary-card card fade-in" style={{animationDelay:'0.2s'}}>
          <div className="summary-icon">🎯</div>
          <div className="summary-info">
            <span className="summary-number">{goals.length}</span>
            <span className="summary-label">Metas no total</span>
          </div>
          <div className="summary-done">{goals.filter(g=>g.completed).length} alcançadas 🌟</div>
        </div>
        <div className="summary-card card fade-in" style={{animationDelay:'0.3s'}}>
          <div className="summary-icon">🧘</div>
          <div className="summary-info">
            <span className="summary-number">{todayEmotions.length}</span>
            <span className="summary-label">Emoções hoje</span>
          </div>
          <div className="summary-done">registradas 💕</div>
        </div>
      </div>

      {/* Tarefas de hoje */}
      {todayTasks.length > 0 && (
        <div className="card fade-in" style={{animationDelay:'0.4s'}}>
          <div className="card-header">
            <h3>📌 Tarefas de Hoje</h3>
          </div>
          <div className="mini-tasks">
            {todayTasks.map(task => (
              <div key={task.id} className={`mini-task ${task.done ? 'done' : ''}`}>
                <span className="mt-status">{task.done ? '✅' : '⭕'}</span>
                <span className="mt-title">{task.title}</span>
                {task.priority && (
                  <span className={`mt-priority priority-${task.priority}`}>
                    {task.priority}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metas próximas */}
      {pendingGoals.length > 0 && (
        <div className="card fade-in" style={{animationDelay:'0.5s'}}>
          <div className="card-header">
            <h3>⭐ Metas em Progresso</h3>
          </div>
          <div className="mini-goals">
            {pendingGoals.map(goal => (
              <div key={goal.id} className="mini-goal">
                <span>{goal.emoji || '🎯'}</span>
                <span className="mg-title">{goal.title}</span>
                <div className="mg-progress">
                  <div className="mg-bar" style={{width: `${goal.progress || 0}%`}}></div>
                </div>
                <span className="mg-pct">{goal.progress || 0}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
