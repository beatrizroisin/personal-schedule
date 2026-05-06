import React, { useState, useEffect, useRef } from 'react';
import { useUserStorage } from '../hooks/useStorage';
import './Water.scss';

const QUICK_OPTIONS = [150, 200, 250, 300, 350, 500];
const DEFAULT_GOAL = 2000;

const getTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

const getWeekKeys = () => {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today);
  monday.setDate(diff);
  const keys = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    keys.push({
      key: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
      label: d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' }),
      date: d,
    });
  }
  return keys;
};

const Water = ({ username }) => {
  const [waterData, setWaterData] = useUserStorage('water_data', {}, username);
  const [goal, setGoal] = useUserStorage('water_goal', DEFAULT_GOAL, username);
  const [customAmount, setCustomAmount] = useState('');
  const [editingGoal, setEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(goal);
  const [notifPermission, setNotifPermission] = useState(Notification?.permission || 'default');
  const [notifEnabled, setNotifEnabled] = useUserStorage('water_notif', false, username);
  const [lastDrinkTime, setLastDrinkTime] = useUserStorage('water_last_drink', null, username);

  // Refs so the interval can always read latest values without being a dependency
  const lastDrinkRef = useRef(lastDrinkTime);
  const setLastDrinkRef = useRef(setLastDrinkTime);
  useEffect(() => { lastDrinkRef.current = lastDrinkTime; }, [lastDrinkTime]);
  useEffect(() => { setLastDrinkRef.current = setLastDrinkTime; }, [setLastDrinkTime]);

  const todayKey = getTodayKey();
  const todayEntries = waterData[todayKey]?.entries || [];
  const todayTotal = todayEntries.reduce((sum, e) => sum + e.amount, 0);
  const percentage = Math.min((todayTotal / goal) * 100, 100);

  const totalCups = Math.ceil(goal / 250);
  const filledCups = Math.floor(todayTotal / 250);

  const addWater = (amount) => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return;
    const now = new Date().toISOString();
    const entry = { amount: amt, time: now, id: Date.now() };
    const existing = waterData[todayKey] || { entries: [] };
    const updated = { ...existing, entries: [...existing.entries, entry] };
    setWaterData({ ...waterData, [todayKey]: updated });
    setLastDrinkTime(now);
    setCustomAmount('');
  };

  const removeEntry = (id) => {
    const existing = waterData[todayKey] || { entries: [] };
    const updated = { ...existing, entries: existing.entries.filter(e => e.id !== id) };
    setWaterData({ ...waterData, [todayKey]: updated });
  };

  const saveGoal = () => {
    const g = Number(tempGoal);
    if (g >= 500 && g <= 5000) { setGoal(g); setEditingGoal(false); }
  };

  const requestNotif = async () => {
    if (!('Notification' in window)) {
      alert('Seu navegador não suporta notificações 😢');
      return;
    }
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      setNotifEnabled(true);
      setLastDrinkTime(new Date().toISOString());
      new Notification('💧 Hidratação ativada!', {
        body: 'Vou te lembrar de beber água a cada hora. Cuide-se! 🌸',
        icon: '💧',
      });
    }
  };

  const disableNotif = () => {
    setNotifEnabled(false);
  };

  // Check every minute if 1hr has passed without drinking
  // Uses refs so interval doesn't need lastDrinkTime as dependency
  useEffect(() => {
    if (!notifEnabled || notifPermission !== 'granted') return;
    const interval = setInterval(() => {
      const last = lastDrinkRef.current ? new Date(lastDrinkRef.current) : null;
      const now = new Date();
      const diffMin = last ? (now - last) / 60000 : Infinity;
      if (diffMin >= 60) {
        new Notification('💧 Hora de beber água!', {
          body: 'Você não bebe água há mais de 1 hora. Beba um copo agora! 🌸',
          icon: '💧',
          tag: 'water-reminder',
          requireInteraction: true,
        });
        setLastDrinkRef.current(now.toISOString());
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [notifEnabled, notifPermission]);

  const weekKeys = getWeekKeys();
  const weekData = weekKeys.map(({ key, label }) => {
    const entries = waterData[key]?.entries || [];
    const total = entries.reduce((s, e) => s + e.amount, 0);
    const pct = Math.min((total / goal) * 100, 100);
    const isToday = key === todayKey;
    return { key, label, total, pct, isToday };
  });

  const weekAvg = Math.round(
    weekData.filter(d => d.total > 0).reduce((s, d) => s + d.total, 0) /
    Math.max(weekData.filter(d => d.total > 0).length, 1)
  );

  const daysGoalReached = weekData.filter(d => d.total >= goal).length;

  const getStatusColor = () => {
    if (percentage >= 100) return '#d4f5e9';
    if (percentage >= 70) return '#dbeafe';
    if (percentage >= 40) return '#e8d5f5';
    return '#fce4ec';
  };

  const getStatusMsg = () => {
    if (percentage >= 100) return { msg: 'Meta atingida! Você é incrível! 🏆', emoji: '🎉' };
    if (percentage >= 75) return { msg: 'Quase lá! Falta pouco! 💪', emoji: '💙' };
    if (percentage >= 50) return { msg: 'Na metade! Continue assim! 🌊', emoji: '💧' };
    if (percentage >= 25) return { msg: 'Bom começo! Não para não! 🌱', emoji: '💦' };
    return { msg: 'Vamos começar? Seu corpo precisa de água! 🌸', emoji: '🫗' };
  };

  const status = getStatusMsg();

  const timeSinceLastDrink = () => {
    if (!lastDrinkTime) return null;
    const diff = (new Date() - new Date(lastDrinkTime)) / 60000;
    if (diff < 1) return 'agora mesmo';
    if (diff < 60) return `${Math.floor(diff)} min atrás`;
    return `${Math.floor(diff / 60)}h ${Math.floor(diff % 60)}min atrás`;
  };

  return (
    <div className="water-page">
      <div className="page-header">
        <h2>💧 Hidratação</h2>
        <p>Cuide do seu corpinho! 🌸</p>
      </div>

      <div className="water-hero card fade-in" style={{ background: `linear-gradient(135deg, ${getStatusColor()}, rgba(255,255,255,0.6))` }}>
        <div className="wh-left">
          <div className="wh-emoji-big">{status.emoji}</div>
          <div>
            <div className="wh-total">{todayTotal} <span>ml</span></div>
            <div className="wh-goal-label">
              de {goal} ml
              <button className="edit-goal-btn" onClick={() => { setTempGoal(goal); setEditingGoal(true); }}>✏️</button>
            </div>
            <div className="wh-status-msg">{status.msg}</div>
            {lastDrinkTime && (
              <div className="wh-last">🕐 Último gole: {timeSinceLastDrink()}</div>
            )}
          </div>
        </div>
        <div className="wh-right">
          <div className="circle-progress" style={{ '--pct': percentage }}>
            <svg viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="7"/>
              <circle cx="40" cy="40" r="34" fill="none" stroke="#90caf9" strokeWidth="7"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - percentage / 100)}`}
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
            <span className="circle-pct">{Math.round(percentage)}%</span>
          </div>
        </div>
      </div>

      {editingGoal && (
        <div className="card fade-in goal-edit-form">
          <h4>🎯 Definir Meta Diária</h4>
          <p>Recomendação: mulheres 2.000ml / homens 2.500ml</p>
          <div className="goal-presets">
            {[1500, 2000, 2500, 3000].map(g => (
              <button key={g} className={`preset-btn ${Number(tempGoal) === g ? 'active' : ''}`}
                onClick={() => setTempGoal(g)}>{g}ml</button>
            ))}
          </div>
          <div className="goal-custom-row">
            <input type="number" className="input-soft" placeholder="Ou digite (ml)..."
              value={tempGoal} onChange={e => setTempGoal(e.target.value)} min="500" max="5000" />
            <button className="btn-primary" onClick={saveGoal}>💾 Salvar</button>
            <button className="btn-soft" onClick={() => setEditingGoal(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="card fade-in cups-section">
        <div className="card-header">
          <h3>🥤 Copos (250ml cada)</h3>
          <span className="cups-count">{filledCups}/{totalCups}</span>
        </div>
        <div className="cups-grid">
          {Array.from({ length: totalCups }, (_, i) => (
            <div key={i} className={`cup ${i < filledCups ? 'filled' : ''} ${i === filledCups ? 'next' : ''}`}>
              <span>{i < filledCups ? '🥤' : i === filledCups ? '🫗' : '🥛'}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card fade-in add-water-section">
        <div className="card-header">
          <h3>➕ Adicionar Água</h3>
        </div>
        <div className="quick-btns">
          {QUICK_OPTIONS.map(ml => (
            <button key={ml} className="quick-btn" onClick={() => addWater(ml)}>
              💧 {ml}ml
            </button>
          ))}
        </div>
        <div className="custom-row">
          <input
            type="number"
            className="input-soft"
            placeholder="Quantidade personalizada (ml)..."
            value={customAmount}
            onChange={e => setCustomAmount(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addWater(customAmount)}
          />
          <button className="btn-primary" onClick={() => addWater(customAmount)}>
            💧 Adicionar
          </button>
        </div>
      </div>

      {todayEntries.length > 0 && (
        <div className="card fade-in history-section">
          <div className="card-header">
            <h3>📋 Registros de Hoje</h3>
            <span className="history-total">{todayTotal}ml total</span>
          </div>
          <div className="history-list">
            {[...todayEntries].reverse().map(entry => (
              <div key={entry.id} className="history-item">
                <span className="hi-icon">💧</span>
                <span className="hi-amount">{entry.amount}ml</span>
                <span className="hi-time">{new Date(entry.time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                <button className="btn-danger hi-del" onClick={() => removeEntry(entry.id)}>🗑️</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card fade-in notif-section">
        <div className="card-header">
          <h3>🔔 Lembrete de Hidratação</h3>
        </div>
        <p className="notif-desc">
          Ative para receber alertas no navegador caso você fique mais de <strong>1 hora</strong> sem registrar água.
        </p>
        {notifPermission === 'denied' && (
          <div className="notif-denied">
            ❌ Notificações bloqueadas. Ative nas configurações do seu navegador.
          </div>
        )}
        {notifPermission !== 'denied' && (
          <div className="notif-toggle-row">
            {!notifEnabled ? (
              <button className="btn-primary notif-btn" onClick={requestNotif}>
                🔔 Ativar Lembretes
              </button>
            ) : (
              <div className="notif-active">
                <span>✅ Lembretes ativados! Vou te avisar a cada 1h sem beber água.</span>
                <button className="btn-soft" onClick={disableNotif}>Desativar</button>
              </div>
            )}
          </div>
        )}
        <div className="notif-whatsapp-tip">
          <span>📱</span>
          <div>
            <strong>Dica sobre WhatsApp:</strong> alertas automáticos no WhatsApp precisam de uma API paga (ex: Twilio). Os lembretes do navegador funcionam no celular também — basta manter o site salvo na tela inicial!
          </div>
        </div>
      </div>

      <div className="card fade-in weekly-water">
        <div className="card-header">
          <h3>📊 Relatório Semanal</h3>
        </div>
        <div className="week-summary-row">
          <div className="wsr-card">
            <span className="wsr-num">{weekAvg}</span>
            <span className="wsr-lbl">ml média/dia</span>
          </div>
          <div className="wsr-card">
            <span className="wsr-num">{daysGoalReached}</span>
            <span className="wsr-lbl">dias com meta ✅</span>
          </div>
          <div className="wsr-card">
            <span className="wsr-num">{weekData.reduce((s, d) => s + d.total, 0)}</span>
            <span className="wsr-lbl">ml na semana</span>
          </div>
        </div>
        <div className="week-bars">
          {weekData.map(day => (
            <div key={day.key} className={`wb-col ${day.isToday ? 'today' : ''}`}>
              <div className="wb-bar-wrap">
                <div className="wb-bar-fill" style={{ height: `${Math.max(day.pct, day.total > 0 ? 5 : 0)}%` }} />
                {day.total >= goal && <span className="wb-star">⭐</span>}
              </div>
              <span className="wb-ml">{day.total > 0 ? `${day.total}` : '—'}</span>
              <span className="wb-label">{day.label.split(',')[0]}</span>
            </div>
          ))}
        </div>
        <div className="week-insight">
          {daysGoalReached >= 5
            ? <p>🏆 Semana excelente! Você bateu a meta em {daysGoalReached} dias. Continue assim!</p>
            : daysGoalReached >= 3
            ? <p>💙 Boa semana! Mas ainda dá pra melhorar. Tente atingir a meta todos os dias! 💪</p>
            : <p>🌱 Vamos melhorar a hidratação essa semana? Seu corpo agradece! 💧</p>
          }
        </div>
      </div>
    </div>
  );
};

export default Water;