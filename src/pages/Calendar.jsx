import React, { useState, useRef, useEffect } from 'react';
import { useUserStorage } from '../hooks/useStorage';
import { v4 as uuidv4 } from 'uuid';
import './Calendar.scss';

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DAYS_SHORT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const CAT_COLORS = {
  trabalho: { bg: '#dbeafe', border: '#90caf9', text: '#1565c0', dot: '#42a5f5' },
  pessoal:  { bg: '#fce4ec', border: '#f48fb1', text: '#880e4f', dot: '#f48fb1' },
  saude:    { bg: '#d4f5e9', border: '#80cbc4', text: '#1b5e20', dot: '#66bb6a' },
  casa:     { bg: '#fff9c4', border: '#fff176', text: '#f57f17', dot: '#ffee58' },
  outros:   { bg: '#e8d5f5', border: '#ce93d8', text: '#4a148c', dot: '#ba68c8' },
};
const DEFAULT_COLOR = { bg: '#f3e5f5', border: '#ce93d8', text: '#6a1b9a', dot: '#ab47bc' };

// ─── Recurrence options ───────────────────────────────────────────
const RECURRENCE_OPTIONS = [
  { id: 'none',       label: 'Não repetir',           emoji: '🚫' },
  { id: 'daily',      label: 'Todo dia',               emoji: '📆' },
  { id: 'weekdays',   label: 'Dias úteis (Seg–Sex)',   emoji: '💼' },
  { id: 'weekly',     label: 'Toda semana',            emoji: '🔄' },
  { id: 'biweekly',   label: 'A cada 2 semanas',       emoji: '📅' },
  { id: 'monthly',    label: 'Todo mês',               emoji: '🗓️' },
  { id: 'mon',        label: 'Toda segunda',           emoji: '1️⃣' },
  { id: 'tue',        label: 'Toda terça',             emoji: '2️⃣' },
  { id: 'wed',        label: 'Toda quarta',            emoji: '3️⃣' },
  { id: 'thu',        label: 'Toda quinta',            emoji: '4️⃣' },
  { id: 'fri',        label: 'Toda sexta',             emoji: '5️⃣' },
  { id: 'sat',        label: 'Todo sábado',            emoji: '6️⃣' },
  { id: 'sun',        label: 'Todo domingo',           emoji: '7️⃣' },
];

// Returns true if a recurring task should appear on `date`
function matchesRecurrence(task, date) {
  if (!task.recurrence || task.recurrence === 'none') return false;
  if (!task.date) return false;

  const origin = new Date(task.date + 'T00:00:00');
  const target = new Date(date);
  target.setHours(0,0,0,0);

  // Don't show before the origin date
  if (target < origin) return false;
  // Don't show on the exact origin day (it already shows via normal date match)
  if (target.getTime() === origin.getTime()) return false;

  const dow = target.getDay(); // 0=Sun,1=Mon,...,6=Sat
  const diffDays = Math.round((target - origin) / 86400000);

  switch (task.recurrence) {
    case 'daily':     return true;
    case 'weekdays':  return dow >= 1 && dow <= 5;
    case 'weekly':    return diffDays % 7 === 0;
    case 'biweekly':  return diffDays % 14 === 0;
    case 'monthly': {
      return target.getDate() === origin.getDate();
    }
    case 'mon': return dow === 1;
    case 'tue': return dow === 2;
    case 'wed': return dow === 3;
    case 'thu': return dow === 4;
    case 'fri': return dow === 5;
    case 'sat': return dow === 6;
    case 'sun': return dow === 0;
    default:    return false;
  }
}

function recurrenceLabel(id) {
  return RECURRENCE_OPTIONS.find(r => r.id === id)?.label || '';
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0,0,0,0);
  return d;
}
function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); return d; }
function sameDay(a, b) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}
function timeToMinutes(t) { if(!t) return null; const [h,m]=t.split(':').map(Number); return h*60+m; }
function minutesToTop(m) { return (m/60)*64; }
function minutesToHeight(s,e) { return (Math.max(e-s,30)/60)*64; }
function formatHour(h) { return h===0?'00:00':`${String(h).padStart(2,'0')}:00`; }

const TASK_CATEGORIES = [
  { id:'trabalho', label:'Trabalho', emoji:'💼' },
  { id:'pessoal',  label:'Pessoal',  emoji:'🌸' },
  { id:'saude',    label:'Saúde',    emoji:'💊' },
  { id:'casa',     label:'Casa',     emoji:'🏠' },
  { id:'outros',   label:'Outros',   emoji:'✨' },
];
const PRIORITIES = [
  { id:'alta',  label:'Alta'  },
  { id:'media', label:'Média' },
  { id:'baixa', label:'Baixa' },
];

const EMPTY_FORM = {
  title:'', description:'', date:'', time:'', timeEnd:'',
  category:'pessoal', priority:'media', recurrence:'none'
};

// ─── Main ────────────────────────────────────────────────────────
const Calendar = ({ username }) => {
  const [tasks, setTasks] = useUserStorage('tasks', [], username);
  const [resolver]        = useUserStorage('resolver', [], username);

  const today = new Date();
  const [weekStart, setWeekStart] = useState(() => getWeekStart(today));
  const [view, setView]           = useState('week');
  const [selectedDay, setSelectedDay] = useState(today);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [editId, setEditId]       = useState(null);
  const [detailTask, setDetailTask] = useState(null);
  const scrollRef = useRef(null);
  const [isMobile, setIsMobile]   = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      const hour = new Date().getHours();
      scrollRef.current.scrollTop = Math.max(0, hour * 64 - 120);
    }
  }, [view]);

  const effectiveDays = isMobile && view==='week' ? 3 : (view==='day' ? 1 : 7);
  const mobileWeekStart = isMobile && view==='week'
    ? (() => { const d=new Date(selectedDay); d.setDate(d.getDate()-1); return d; })()
    : weekStart;

  const weekDays = Array.from({ length: effectiveDays }, (_,i) =>
    addDays(isMobile && view==='week' ? mobileWeekStart : weekStart, i));

  const prevWeek = () => setWeekStart(d => addDays(d,-7));
  const nextWeek = () => setWeekStart(d => addDays(d, 7));
  const goToday  = () => { setWeekStart(getWeekStart(today)); setSelectedDay(today); };

  // Returns all tasks that should show on a given date (direct + recurrence)
  function getTasksForDay(date) {
    return tasks.filter(t => {
      if (!t.time) return false; // must have time to be a block
      // direct date match
      if (t.date) {
        const td = new Date(t.date + 'T00:00:00');
        if (sameDay(td, date)) return true;
      }
      // recurrence match
      return matchesRecurrence(t, date);
    });
  }

  function getAllDayTasksForDay(date) {
    return tasks.filter(t => {
      if (t.time) return false;
      if (t.date) {
        const td = new Date(t.date + 'T00:00:00');
        if (sameDay(td, date)) return true;
      }
      return matchesRecurrence(t, date);
    });
  }

  function getResolverForDay(date) {
    return resolver.filter(r => {
      if (!r.deadline) return false;
      return sameDay(new Date(r.deadline + 'T00:00:00'), date);
    });
  }

  const openNewForm = (date, hour) => {
    const dateStr    = date.toISOString().split('T')[0];
    const timeStr    = hour!==undefined ? `${String(hour).padStart(2,'0')}:00` : '';
    const timeEndStr = hour!==undefined ? `${String(Math.min(hour+1,23)).padStart(2,'0')}:00` : '';
    setForm({ ...EMPTY_FORM, date: dateStr, time: timeStr, timeEnd: timeEndStr });
    setEditId(null); setDetailTask(null); setShowForm(true);
  };

  const openEdit = (task) => {
    setForm({
      title: task.title, description: task.description||'',
      date: task.date||'', time: task.time||'', timeEnd: task.timeEnd||'',
      category: task.category||'pessoal', priority: task.priority||'media',
      recurrence: task.recurrence||'none',
    });
    setEditId(task.id); setDetailTask(null); setShowForm(true);
  };

  const saveForm = () => {
    if (!form.title.trim()) return;
    if (editId) {
      setTasks(tasks.map(t => t.id===editId ? { ...t, ...form } : t));
    } else {
      setTasks([...tasks, { ...form, id: uuidv4(), done: false, createdAt: new Date().toISOString() }]);
    }
    setShowForm(false); setEditId(null);
  };

  const deleteTask = (id) => { setTasks(tasks.filter(t=>t.id!==id)); setDetailTask(null); };
  const toggleDone = (id) => { setTasks(tasks.map(t=>t.id===id?{...t,done:!t.done}:t)); };

  const monthLabel = `${MONTHS[weekStart.getMonth()]} ${weekStart.getFullYear()}`;

  return (
    <div className="cal2-page">
      {/* HEADER */}
      <div className="cal2-header">
        <div className="cal2-header-left">
          <h2 className="cal2-title">📅 Agenda</h2>
          <span className="cal2-month-label">{monthLabel}</span>
        </div>
        <div className="cal2-header-right">
          <div className="view-tabs">
            {[['day','Dia'],['week','Semana'],['month','Mês']].map(([v,l]) => (
              <button key={v} className={`vtab ${view===v?'active':''}`} onClick={()=>setView(v)}>{l}</button>
            ))}
          </div>
          <button className="btn-soft today-btn" onClick={goToday}>Hoje</button>
          <div className="nav-arrows">
            <button className="nav-arrow" onClick={prevWeek}>‹</button>
            <button className="nav-arrow" onClick={nextWeek}>›</button>
          </div>
          <button className="btn-primary new-event-btn" onClick={() => openNewForm(selectedDay)}>
            + Evento
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="cal2-body card">
        {/* Day headers */}
        <div className="cal2-day-headers"
          style={{ gridTemplateColumns: `56px repeat(${effectiveDays}, 1fr)` }}>
          <div className="time-gutter-header" />
          {weekDays.map((day,i) => {
            const isToday = sameDay(day,today);
            const allDay  = getAllDayTasksForDay(day);
            const res     = getResolverForDay(day);
            return (
              <div key={i} className={`day-header-col ${isToday?'is-today':''}`}
                onClick={() => setSelectedDay(day)}>
                <div className="dhc-inner">
                  <span className="dhc-weekday">{DAYS_SHORT[day.getDay()]}</span>
                  <span className={`dhc-num ${isToday?'today-circle':''}`}
                    onClick={e=>{e.stopPropagation();setSelectedDay(day);setView('day');}}>
                    {day.getDate()}
                  </span>
                </div>
                {(allDay.length>0||res.length>0) && (
                  <div className="allday-chips">
                    {allDay.map(t => {
                      const c=CAT_COLORS[t.category]||DEFAULT_COLOR;
                      return (
                        <div key={t.id+day.getTime()} className={`allday-chip ${t.done?'done':''}`}
                          style={{background:c.bg,borderLeft:`3px solid ${c.dot}`,color:c.text}}
                          onClick={e=>{e.stopPropagation();setDetailTask(t);}}>
                          {t.recurrence&&t.recurrence!=='none'&&<span className="recur-icon">🔄</span>}
                          {t.title}
                        </div>
                      );
                    })}
                    {res.map(r=>(
                      <div key={r.id} className={`allday-chip resolver-chip ${r.done?'done':''}`}
                        style={{background:'#fff9c4',borderLeft:'3px solid #ffb74d',color:'#e65100'}}>
                        ⚡ {r.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="cal2-grid-scroll" ref={scrollRef}>
          <div className="cal2-grid-inner"
            style={{"--day-cols": effectiveDays}}>
            {/* Hour rows */}
            <div className="hour-rows">
              {HOURS.map(h=>(
                <div key={h} className="hour-row">
                  <div className="hour-label">{formatHour(h)}</div>
                  <div className="hour-line" />
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day,di)=>{
              const dayTasks = getTasksForDay(day);
              const isToday  = sameDay(day,today);
              const nowMin   = today.getHours()*60+today.getMinutes();
              return (
                <div key={di} className={`day-col ${isToday?'today-col':''}`}
                  onClick={e=>{
                    const rect=e.currentTarget.getBoundingClientRect();
                    const y=e.clientY-rect.top+e.currentTarget.parentElement.parentElement.scrollTop;
                    openNewForm(day, Math.min(Math.floor(y/64),23));
                  }}>
                  {isToday && (
                    <div className="now-line" style={{top:`${minutesToTop(nowMin)}px`}}>
                      <span className="now-dot"/>
                    </div>
                  )}
                  {dayTasks.map(t=>{
                    const startMin = timeToMinutes(t.time);
                    const endMin   = t.timeEnd ? timeToMinutes(t.timeEnd) : startMin+60;
                    if (startMin===null) return null;
                    const top    = minutesToTop(startMin);
                    const height = minutesToHeight(startMin,endMin);
                    const c = CAT_COLORS[t.category]||DEFAULT_COLOR;
                    const isRecurring = t.recurrence && t.recurrence!=='none';
                    return (
                      <div key={t.id+day.getTime()}
                        className={`task-block ${t.done?'done':''}`}
                        style={{
                          top:`${top}px`, height:`${Math.max(height,22)}px`,
                          background:c.bg, borderLeft:`3px solid ${c.dot}`, color:c.text
                        }}
                        onClick={e=>{e.stopPropagation();setDetailTask(t);}}>
                        <span className="tb-title">
                          {t.done?'✅ ':''}
                          {isRecurring&&<span className="tb-recur">🔄</span>}
                          {t.title}
                        </span>
                        {height>36&&(
                          <span className="tb-time">
                            {t.time}{t.timeEnd?` – ${t.timeEnd}`:''}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MONTH VIEW */}
      {view==='month' && (
        <MonthView tasks={tasks} resolver={resolver} today={today}
          onDayClick={d=>{setSelectedDay(d);setWeekStart(getWeekStart(d));setView('week');}}
          weekStart={weekStart} setWeekStart={setWeekStart} />
      )}

      {/* FORM MODAL */}
      {showForm && (
        <div className="cal-modal-overlay" onClick={()=>setShowForm(false)}>
          <div className="cal-modal card fade-in" onClick={e=>e.stopPropagation()}>
            <div className="cm-header">
              <h3>{editId?'✏️ Editar Evento':'✨ Novo Evento'}</h3>
              <button className="cm-close" onClick={()=>setShowForm(false)}>✕</button>
            </div>
            <div className="cm-body">
              <input className="input-soft cm-title-input" placeholder="Título do evento..."
                value={form.title} onChange={e=>setForm({...form,title:e.target.value})} autoFocus />
              <textarea className="input-soft" placeholder="Descrição (opcional)..."
                value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={2} />
              <div className="cm-row">
                <div className="cm-field">
                  <label>📅 Data inicial</label>
                  <input type="date" className="input-soft" value={form.date}
                    onChange={e=>setForm({...form,date:e.target.value})} />
                </div>
              </div>
              <div className="cm-row">
                <div className="cm-field">
                  <label>⏰ Início</label>
                  <input type="time" className="input-soft" value={form.time}
                    onChange={e=>setForm({...form,time:e.target.value})} />
                </div>
                <div className="cm-field">
                  <label>⏰ Fim</label>
                  <input type="time" className="input-soft" value={form.timeEnd}
                    onChange={e=>setForm({...form,timeEnd:e.target.value})} />
                </div>
              </div>
              {/* RECURRENCE */}
              <div className="cm-field">
                <label>🔄 Repetir</label>
                <div className="recurrence-grid">
                  {RECURRENCE_OPTIONS.map(r=>(
                    <button key={r.id}
                      type="button"
                      className={`recur-btn ${form.recurrence===r.id?'active':''}`}
                      onClick={()=>setForm({...form,recurrence:r.id})}>
                      <span>{r.emoji}</span>
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="cm-row">
                <div className="cm-field">
                  <label>🏷️ Categoria</label>
                  <select className="input-soft" value={form.category}
                    onChange={e=>setForm({...form,category:e.target.value})}>
                    {TASK_CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
                  </select>
                </div>
                <div className="cm-field">
                  <label>⚡ Prioridade</label>
                  <select className="input-soft" value={form.priority}
                    onChange={e=>setForm({...form,priority:e.target.value})}>
                    {PRIORITIES.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="cm-footer">
              {editId&&<button className="btn-danger" onClick={()=>{deleteTask(editId);setShowForm(false);}}>🗑️ Excluir</button>}
              <button className="btn-soft" onClick={()=>setShowForm(false)}>Cancelar</button>
              <button className="btn-primary" onClick={saveForm}>
                {editId?'💾 Salvar':'✨ Criar Evento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL POPOVER */}
      {detailTask && (
        <div className="cal-modal-overlay" onClick={()=>setDetailTask(null)}>
          <div className="cal-detail card fade-in" onClick={e=>e.stopPropagation()}>
            {(()=>{
              const c=CAT_COLORS[detailTask.category]||DEFAULT_COLOR;
              const cat=TASK_CATEGORIES.find(x=>x.id===detailTask.category);
              const isRecurring = detailTask.recurrence && detailTask.recurrence!=='none';
              return (
                <>
                  <div className="cd-bar" style={{background:c.dot}}/>
                  <div className="cd-body">
                    <div className="cd-top">
                      <h3 className={detailTask.done?'done-title':''}>{detailTask.title}</h3>
                      <button className="cm-close" onClick={()=>setDetailTask(null)}>✕</button>
                    </div>
                    {detailTask.description&&<p className="cd-desc">{detailTask.description}</p>}
                    <div className="cd-meta">
                      {detailTask.date&&<span>📅 {new Date(detailTask.date+'T00:00:00').toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})}</span>}
                      {detailTask.time&&<span>⏰ {detailTask.time}{detailTask.timeEnd?` – ${detailTask.timeEnd}`:''}</span>}
                      {isRecurring&&<span className="cd-recur">🔄 {recurrenceLabel(detailTask.recurrence)}</span>}
                      {cat&&<span>{cat.emoji} {cat.label}</span>}
                      {detailTask.priority&&<span>⚡ Prioridade {detailTask.priority}</span>}
                    </div>
                    <div className="cd-actions">
                      <button className="btn-soft" onClick={()=>toggleDone(detailTask.id)}>
                        {detailTask.done?'↩️ Desmarcar':'✅ Concluir'}
                      </button>
                      <button className="btn-soft" onClick={()=>openEdit(detailTask)}>✏️ Editar</button>
                      <button className="btn-danger" onClick={()=>deleteTask(detailTask.id)}>🗑️</button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Month view ──────────────────────────────────────────────────
const MonthView = ({ tasks, resolver, today, onDayClick, weekStart, setWeekStart }) => {
  const year  = weekStart.getFullYear();
  const month = weekStart.getMonth();
  const firstDay = new Date(year,month,1).getDay();
  const daysInMonth = new Date(year,month+1,0).getDate();
  const cells = [];
  const startOffset = firstDay===0 ? 6 : firstDay-1;
  for (let i=0;i<startOffset;i++) cells.push(null);
  for (let d=1;d<=daysInMonth;d++) cells.push(new Date(year,month,d));

  return (
    <div className="month-view card fade-in">
      <div className="mv-header">
        <button className="nav-arrow" onClick={()=>setWeekStart(d=>{const n=new Date(d);n.setMonth(n.getMonth()-1);return n;})}>‹</button>
        <span className="mv-title">{MONTHS[month]} {year}</span>
        <button className="nav-arrow" onClick={()=>setWeekStart(d=>{const n=new Date(d);n.setMonth(n.getMonth()+1);return n;})}>›</button>
      </div>
      <div className="mv-grid">
        {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(d=>(
          <div key={d} className="mv-day-header">{d}</div>
        ))}
        {cells.map((day,i)=>{
          if (!day) return <div key={`e${i}`} className="mv-cell empty"/>;
          const isToday = sameDay(day,today);
          const dayTasks = tasks.filter(t=>{
            if (!t.date) return false;
            if (sameDay(new Date(t.date+'T00:00:00'),day)) return true;
            return matchesRecurrence(t,day);
          });
          const dayRes = resolver.filter(r=>{
            if (!r.deadline) return false;
            return sameDay(new Date(r.deadline+'T00:00:00'),day);
          });
          return (
            <div key={i} className={`mv-cell ${isToday?'mv-today':''}`} onClick={()=>onDayClick(day)}>
              <span className={`mv-num ${isToday?'mv-num-today':''}`}>{day.getDate()}</span>
              <div className="mv-events">
                {dayTasks.slice(0,3).map(t=>{
                  const c=CAT_COLORS[t.category]||DEFAULT_COLOR;
                  const isR=t.recurrence&&t.recurrence!=='none';
                  return (
                    <div key={t.id+day.getTime()} className="mv-chip"
                      style={{background:c.bg,color:c.text,borderLeft:`2px solid ${c.dot}`}}>
                      {isR&&'🔄 '}{t.title}
                    </div>
                  );
                })}
                {dayRes.slice(0,1).map(r=>(
                  <div key={r.id} className="mv-chip"
                    style={{background:'#fff9c4',color:'#e65100',borderLeft:'2px solid #ffb74d'}}>
                    ⚡ {r.title}
                  </div>
                ))}
                {(dayTasks.length+dayRes.length)>3&&(
                  <div className="mv-more">+{dayTasks.length+dayRes.length-3} mais</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
