import React from 'react';
import { useUserStorage } from '../hooks/useStorage';
import { EMOTIONS, getTodayKey, getWeekDates } from '../data';
import './Feelings.scss';

const Feelings = ({ username }) => {
  const [emotions, setEmotions] = useUserStorage('emotions', {}, username);
  const weekDates = getWeekDates();

  const toggleEmotion = (emotion, dateKey) => {
    const current = emotions[dateKey] || [];
    const exists = current.find(e => e.label === emotion.label);
    const updated = exists
      ? current.filter(e => e.label !== emotion.label)
      : [...current, emotion];
    setEmotions({ ...emotions, [dateKey]: updated });
  };

  const todayKey = getTodayKey();

  // Weekly report
  const weekReport = () => {
    const counts = {};
    weekDates.forEach(d => {
      const key = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
      const dayEmotions = emotions[key] || [];
      dayEmotions.forEach(e => {
        counts[e.label] = (counts[e.label] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => {
        const em = EMOTIONS.find(e => e.label === label);
        return { label, count, emoji: em?.emoji || '😊', color: em?.color || '#fce4ec' };
      });
  };

  const report = weekReport();
  const totalEmotionsWeek = report.reduce((a, b) => a + b.count, 0);
  const daysWithEntries = weekDates.filter(d => {
    const key = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
    return (emotions[key] || []).length > 0;
  }).length;

  const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return (
    <div className="feelings-page">
      <div className="page-header">
        <h2>🌈 Meus Sentimentos</h2>
        <p>Registre suas emoções e acompanhe seu bem-estar 💕</p>
      </div>

      {/* Hoje */}
      <div className="card fade-in today-feelings">
        <div className="card-header">
          <h3>🌸 Como você está hoje?</h3>
          <span className="today-badge">Hoje</span>
        </div>
        <p className="feelings-hint">Selecione todas as emoções que está sentindo:</p>
        <div className="emotions-grid-big">
          {EMOTIONS.map(emotion => {
            const selected = (emotions[todayKey] || []).find(e => e.label === emotion.label);
            return (
              <button
                key={emotion.label}
                className={`emotion-big-btn ${selected ? 'selected' : ''}`}
                style={{ '--ebg': emotion.color }}
                onClick={() => toggleEmotion(emotion, todayKey)}
              >
                <span className="eb-emoji">{emotion.emoji}</span>
                <span className="eb-label">{emotion.label}</span>
                {selected && <span className="eb-check">✓</span>}
              </button>
            );
          })}
        </div>
        {(emotions[todayKey] || []).length > 0 && (
          <div className="today-summary">
            <span>Você registrou: </span>
            {(emotions[todayKey] || []).map(e => (
              <span key={e.label} className="te-chip">{e.emoji} {e.label}</span>
            ))}
          </div>
        )}
      </div>

      {/* Semana visual */}
      <div className="card fade-in week-calendar">
        <div className="card-header">
          <h3>📅 Esta Semana</h3>
        </div>
        <div className="week-days">
          {weekDates.map((date, i) => {
            const key = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
            const dayEmotions = emotions[key] || [];
            const isToday = key === todayKey;
            return (
              <div key={i} className={`week-day ${isToday ? 'today' : ''} ${dayEmotions.length > 0 ? 'has-data' : ''}`}>
                <span className="wd-name">{dayNames[i]}</span>
                <span className="wd-num">{date.getDate()}</span>
                <div className="wd-emotions">
                  {dayEmotions.length === 0
                    ? <span className="wd-empty">—</span>
                    : dayEmotions.slice(0,3).map(e => (
                        <span key={e.label} title={e.label}>{e.emoji}</span>
                      ))
                  }
                  {dayEmotions.length > 3 && <span className="wd-more">+{dayEmotions.length-3}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Relatório semanal */}
      <div className="card fade-in weekly-report">
        <div className="card-header">
          <h3>📊 Relatório Semanal</h3>
          <span className="report-badge">{daysWithEntries}/7 dias registrados</span>
        </div>

        {report.length === 0 ? (
          <div className="empty-report">
            <span>🌱</span>
            <p>Registre suas emoções ao longo da semana para ver o relatório!</p>
          </div>
        ) : (
          <>
            <div className="report-summary-row">
              <div className="rs-card">
                <span className="rs-num">{totalEmotionsWeek}</span>
                <span className="rs-lbl">Emoções registradas</span>
              </div>
              <div className="rs-card">
                <span className="rs-num">{daysWithEntries}</span>
                <span className="rs-lbl">Dias com registro</span>
              </div>
              {report[0] && (
                <div className="rs-card highlight">
                  <span className="rs-emoji">{report[0].emoji}</span>
                  <span className="rs-lbl">Emoção mais frequente</span>
                  <span className="rs-sublbl">{report[0].label}</span>
                </div>
              )}
            </div>

            <div className="report-bars">
              {report.map(item => (
                <div key={item.label} className="report-bar-row">
                  <span className="rb-emoji">{item.emoji}</span>
                  <span className="rb-label">{item.label}</span>
                  <div className="rb-bar-wrap">
                    <div
                      className="rb-bar-fill"
                      style={{
                        width: `${(item.count / Math.max(...report.map(r => r.count))) * 100}%`,
                        background: `radial-gradient(circle, ${item.color}, ${item.color}cc)`
                      }}
                    />
                  </div>
                  <span className="rb-count">{item.count}x</span>
                </div>
              ))}
            </div>

            <div className="report-insight">
              <span className="insight-icon">💡</span>
              <p>
                {report[0]?.label === 'Feliz' || report[0]?.label === 'Bem' || report[0]?.label === 'Animado(a)'
                  ? `Que semana incrível! Você esteve majoritariamente ${report[0]?.label.toLowerCase()}. Continue assim! 🌟`
                  : report[0]?.label === 'Ansioso(a)' || report[0]?.label === 'Triste' || report[0]?.label === 'Irritado(a)'
                  ? `Parece que foi uma semana desafiadora. Cuide-se com carinho! Você merece paz 🌸`
                  : `Você registrou ${totalEmotionsWeek} emoções esta semana. Continue se conhecendo melhor! 💕`
                }
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Feelings;
