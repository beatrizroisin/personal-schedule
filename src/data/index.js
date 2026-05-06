// Frases motivacionais - uma nova por dia baseada na data
export const motivationalPhrases = [
  { text: "Você é capaz de coisas incríveis! Acredite no seu potencial ✨", author: "Para você 💕" },
  { text: "Cada dia é uma nova chance de ser a versão mais incrível de você!", author: "Para você 💕" },
  { text: "Floresça no seu próprio tempo. As borboletas também precisam de tempo para sair do casulo 🦋", author: "Para você 💕" },
  { text: "Seu progresso, mesmo que pequeno, é imenso! Continue firme 🌸", author: "Para você 💕" },
  { text: "Você é mais forte do que pensa e mais amada do que imagina 💖", author: "Para você 💕" },
  { text: "Hoje é um presente — é por isso que se chama presente 🎁", author: "Para você 💕" },
  { text: "Pequenos passos todos os dias levam a grandes destinos 🌈", author: "Para você 💕" },
  { text: "Cuide de você com o mesmo amor que oferece aos outros 🌷", author: "Para você 💕" },
  { text: "Você não precisa ser perfeita, só precisa ser você 🌟", author: "Para você 💕" },
  { text: "A vida é mais bonita quando a gente foca no que tem, não no que falta 🌻", author: "Para você 💕" },
  { text: "Respira fundo. Você está indo muito bem! 🌬️💫", author: "Para você 💕" },
  { text: "Todo obstáculo que você supera te deixa mais linda por dentro 💎", author: "Para você 💕" },
  { text: "Seja gentil com você mesma. Você merece o seu próprio amor 🤍", author: "Para você 💕" },
  { text: "Sua energia é poderosa. Direcione ela para o que te faz bem 🌺", author: "Para você 💕" },
  { text: "Acredite na magia dos recomeços! Hoje pode ser o início de algo lindo ✨🌸", author: "Para você 💕" },
  { text: "Você é a personagem principal da sua própria história 📖💕", author: "Para você 💕" },
  { text: "Confie no processo. Tudo que deve vir, virá no momento certo 🌙", author: "Para você 💕" },
  { text: "Sorria! Você é a razão de muitas alegrias ao seu redor 😊💛", author: "Para você 💕" },
  { text: "Dificuldades são apenas aulas disfarçadas. Você está passando! 🎓✨", author: "Para você 💕" },
  { text: "Você merece tudo que há de mais bonito neste mundo 🌈🦋", author: "Para você 💕" },
  { text: "A sua felicidade importa. Priorize ela todos os dias 🌸💖", author: "Para você 💕" },
  { text: "Seja a luz que você gostaria de ver no mundo 🕯️✨", author: "Para você 💕" },
  { text: "Hoje é seu dia! Aproveite cada momento com leveza 🍃🌸", author: "Para você 💕" },
  { text: "Você consegue. Sempre conseguiu. Sempre vai conseguir 💪🌺", author: "Para você 💕" },
  { text: "Gratidão transforma o que temos em suficiente 🙏💛", author: "Para você 💕" },
  { text: "Você é única e isso é seu maior superpoder 🦋👑", author: "Para você 💕" },
  { text: "Cada amanhecer traz novas possibilidades. Abraça esse dia! 🌅💕", author: "Para você 💕" },
  { text: "O melhor investimento que você pode fazer é em você mesma 💎🌸", author: "Para você 💕" },
  { text: "Você é resiliente, poderosa e absolutamente capaz! 🌟💪", author: "Para você 💕" },
  { text: "A vida está florescendo para você — continue regando seus sonhos 🌻🌱", author: "Para você 💕" },
  { text: "Você tem tudo o que precisa dentro de você. Confie! 🌙✨", author: "Para você 💕" },
];

export const getDailyPhrase = () => {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  return motivationalPhrases[dayOfYear % motivationalPhrases.length];
};

export const EMOTIONS = [
  { emoji: "😄", label: "Feliz", color: "#fff9c4" },
  { emoji: "😊", label: "Bem", color: "#d4f5e9" },
  { emoji: "😐", label: "Normal", color: "#e3f2fd" },
  { emoji: "😔", label: "Triste", color: "#e8d5f5" },
  { emoji: "😰", label: "Ansioso(a)", color: "#fce4ec" },
  { emoji: "😤", label: "Irritado(a)", color: "#ffcdd2" },
  { emoji: "😴", label: "Cansado(a)", color: "#ede7f6" },
  { emoji: "🥰", label: "Amado(a)", color: "#fce4ec" },
  { emoji: "🤩", label: "Animado(a)", color: "#fff9c4" },
  { emoji: "😌", label: "Calmo(a)", color: "#d4f5e9" },
  { emoji: "😢", label: "Chorando", color: "#bbdefb" },
  { emoji: "🥳", label: "Comemorando", color: "#ffe8d6" },
];

export const TASK_CATEGORIES = [
  { id: "trabalho", label: "Trabalho", emoji: "💼", color: "#e3f2fd" },
  { id: "pessoal", label: "Pessoal", emoji: "🌸", color: "#fce4ec" },
  { id: "saude", label: "Saúde", emoji: "💊", color: "#d4f5e9" },
  { id: "casa", label: "Casa", emoji: "🏠", color: "#fff9c4" },
  { id: "outros", label: "Outros", emoji: "✨", color: "#e8d5f5" },
];

export const PRIORITIES = [
  { id: "alta", label: "Alta", color: "#ffcdd2", textColor: "#c62828" },
  { id: "media", label: "Média", color: "#fff9c4", textColor: "#f57f17" },
  { id: "baixa", label: "Baixa", color: "#d4f5e9", textColor: "#2e7d32" },
];

export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const formatDateLong = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

export const getTodayKey = () => {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
};

export const getWeekDates = () => {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff));
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
};
