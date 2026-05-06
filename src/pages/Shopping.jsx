import React, { useState } from 'react';
import { useUserStorage } from '../hooks/useStorage';
import { v4 as uuidv4 } from 'uuid';
import './Shopping.scss';

const SHOP_CATEGORIES = [
  { id: 'casa', label: 'Casa', emoji: '🏠', color: '#fff9c4' },
  { id: 'pessoal', label: 'Pessoal', emoji: '💄', color: '#fce4ec' },
  { id: 'mercado', label: 'Mercado', emoji: '🛒', color: '#d4f5e9' },
  { id: 'farmacia', label: 'Farmácia', emoji: '💊', color: '#e3f2fd' },
  { id: 'roupas', label: 'Roupas', emoji: '👗', color: '#e8d5f5' },
  { id: 'outros', label: 'Outros', emoji: '✨', color: '#ffe8d6' },
];

const Shopping = ({ username }) => {
  const [items, setItems] = useUserStorage('shopping', [], username);
  const [filter, setFilter] = useState('todas');
  const [input, setInput] = useState('');
  const [category, setCategory] = useState('mercado');
  const [quantity, setQuantity] = useState('');
  const [showForm, setShowForm] = useState(false);

  const addItem = () => {
    if (!input.trim()) return;
    setItems([...items, {
      id: uuidv4(), name: input.trim(), category,
      quantity: quantity || '1', done: false, createdAt: new Date().toISOString()
    }]);
    setInput(''); setQuantity('');
  };

  const toggleItem = (id) => setItems(items.map(i => i.id === id ? { ...i, done: !i.done } : i));
  const deleteItem = (id) => setItems(items.filter(i => i.id !== id));
  const clearDone = () => setItems(items.filter(i => !i.done));

  const filtered = filter === 'todas' ? items : filter === 'feitos' ? items.filter(i => i.done) : items.filter(i => i.category === filter && !i.done);

  const pending = items.filter(i => !i.done).length;
  const done = items.filter(i => i.done).length;

  return (
    <div className="shopping-page">
      <div className="page-header">
        <h2>🛍️ Lista de Compras</h2>
        <p>Nunca mais esqueça o que precisa comprar! 🛒</p>
      </div>

      <div className="shop-stats">
        <div className="ss-pill pending">🛒 {pending} para comprar</div>
        <div className="ss-pill done-pill">✅ {done} comprados</div>
        {done > 0 && (
          <button className="btn-soft clear-btn" onClick={clearDone}>🗑️ Limpar feitos</button>
        )}
      </div>

      <div className="shop-toolbar">
        <div className="filter-tabs">
          <button className={`filter-tab ${filter === 'todas' ? 'active' : ''}`} onClick={() => setFilter('todas')}>Todas</button>
          <button className={`filter-tab ${filter === 'feitos' ? 'active' : ''}`} onClick={() => setFilter('feitos')}>Feitos ✅</button>
          {SHOP_CATEGORIES.map(c => (
            <button key={c.id} className={`filter-tab ${filter === c.id ? 'active' : ''}`} onClick={() => setFilter(c.id)}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕' : '+ Adicionar'}
        </button>
      </div>

      {showForm && (
        <div className="shop-form card fade-in">
          <div className="sf-row">
            <input className="input-soft" placeholder="O que precisa comprar? 🛍️"
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addItem()} style={{flex: 2}} />
            <input className="input-soft" placeholder="Qtd"
              value={quantity} onChange={e => setQuantity(e.target.value)}
              style={{flex: 0.5}} />
          </div>
          <div className="category-pills">
            {SHOP_CATEGORIES.map(c => (
              <button key={c.id}
                className={`cat-pill ${category === c.id ? 'active' : ''}`}
                style={{ '--cpill-bg': c.color }}
                onClick={() => setCategory(c.id)}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
          <button className="btn-primary" style={{alignSelf:'flex-end'}} onClick={addItem}>
            ✨ Adicionar
          </button>
        </div>
      )}

      {/* Agrupado por categoria */}
      {filter === 'todas' && !showForm ? (
        <div className="shop-groups">
          {SHOP_CATEGORIES.map(cat => {
            const catItems = items.filter(i => i.category === cat.id);
            if (catItems.length === 0) return null;
            return (
              <div key={cat.id} className="shop-group card fade-in">
                <div className="sg-header">
                  <span className="sg-emoji">{cat.emoji}</span>
                  <h4>{cat.label}</h4>
                  <span className="sg-count">{catItems.filter(i=>!i.done).length} pendentes</span>
                </div>
                <div className="shop-items">
                  {catItems.map(item => (
                    <ShopItem key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} catColor={cat.color} />
                  ))}
                </div>
              </div>
            );
          })}
          {items.length === 0 && <EmptyShop />}
        </div>
      ) : (
        <div className="shop-items-list">
          {filtered.length === 0 && <EmptyShop />}
          {filtered.map(item => {
            const cat = SHOP_CATEGORIES.find(c => c.id === item.category);
            return <ShopItem key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} catColor={cat?.color} catEmoji={cat?.emoji} showCat />;
          })}
        </div>
      )}
    </div>
  );
};

const ShopItem = ({ item, onToggle, onDelete, catColor, catEmoji, showCat }) => (
  <div className={`shop-item ${item.done ? 'done' : ''}`} style={{ '--icolor': catColor }}>
    <button className="si-check" onClick={() => onToggle(item.id)}>
      {item.done ? '✅' : '⭕'}
    </button>
    <div className="si-info">
      <span className="si-name">{item.name}</span>
      <div className="si-meta">
        {item.quantity && item.quantity !== '1' && <span className="si-qty">Qtd: {item.quantity}</span>}
        {showCat && catEmoji && <span className="si-cat">{catEmoji}</span>}
      </div>
    </div>
    <button className="btn-danger si-del" onClick={() => onDelete(item.id)}>🗑️</button>
  </div>
);

const EmptyShop = () => (
  <div className="empty-state">
    <div className="empty-emoji">🛍️</div>
    <p>Lista vazia!</p>
    <span>Adicione itens para não esquecer 💕</span>
  </div>
);

export default Shopping;
