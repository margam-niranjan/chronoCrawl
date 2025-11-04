import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import Clock from './Clock';

const GRID_SIZE = 5;
const ALL_ITEMS = [
  'Laser Cutter', 'EMP Blaster', 'Shield Module',
  'Parasite Trap', 'MedKit', 'timeReverse', 'timeSlow', 'timeFast'
];

const effects = {
  'Laser Cutter': p => p.tools.add('Laser Cutter'),
  'EMP Blaster': p => p.tools.add('EMP Blaster'),
  'Shield Module': p => p.tools.add('Shield Module'),
  'Parasite Trap': p => p.health -= 30,
  'MedKit': p => p.health = Math.min(100, p.health + 25),
  'timeReverse': p => {
    if (p.history && p.history.length > 0) {
      const prev = p.history.pop();
      if (prev && prev.length === 2) {
        p.position = { x: prev[0], y: prev[1] };
      }
      p.timeEffect = 'Reverse';
    }
  },
  'timeSlow': p => p.timeEffect = 'Slowed',
  'timeFast': p => p.timeEffect = 'Sped up'
};

const getItemChoices = count => {
  const s = new Set();
  while (s.size < count) {
    s.add(ALL_ITEMS[Math.floor(Math.random() * ALL_ITEMS.length)]);
  }
  return Array.from(s);
};

function App() {
  const [player, setPlayer] = useState(null);
  const [items, setItems] = useState([]);
  const [revealedItem, setRevealedItem] = useState(null);
  const [message, setMessage] = useState('');
  const [timeEffect, setTimeEffect] = useState('Normal');

  useEffect(() => {
    axios.get('http://localhost:4000/api/player')
      .then(res => {
        const p = res.data;
        p.tools = Array.isArray(p.tools) ? p.tools : [];
        setPlayer(p);
        setTimeEffect(p.timeEffect || 'Normal');
      })
      .catch(() =>
        axios.post('http://localhost:4000/api/player', {
          name: 'Commander Nova',
          health: 100,
          position: { x: 2, y: 2 },
          history: [],
          tools: [],
          timeEffect: 'Normal'
        }).then(res => setPlayer(res.data))
      );
  }, []);

  const move = dir => {
    if (!player) return;

    const p = { ...player };
    p.tools = new Set(player.tools);
    p.history = p.history || [];
    p.history.push([p.position.x, p.position.y]);

    switch (dir) {
      case 'up': p.position.y = Math.max(0, p.position.y - 1); break;
      case 'down': p.position.y = Math.min(GRID_SIZE - 1, p.position.y + 1); break;
      case 'left': p.position.x = Math.max(0, p.position.x - 1); break;
      case 'right': p.position.x = Math.min(GRID_SIZE - 1, p.position.x + 1); break;
      default: return;
    }

    p.tools = Array.from(p.tools);
    setPlayer(p);
    setItems(getItemChoices(3));
    setRevealedItem(null);
    setMessage('🧪 You found some mysterious crates! Choose one...');
  };

  const chooseItem = index => {
    const item = items[index];
    const p = { ...player };
    p.tools = new Set(player.tools);
    p.history = [...player.history];

    const oldHealth = p.health;
    const apply = effects[item];
    if (apply) apply(p);

    const healthChange = p.health - oldHealth;
    let feedback = `🎁 The crate contained: ${item}`;

    if (healthChange < 0) feedback += `\n🩸 You lost ${Math.abs(healthChange)} health!`;
    else if (healthChange > 0) feedback += `\n🩺 You gained ${healthChange} health!`;

    if (item === 'timeReverse' && player.history.length === 0) {
      feedback = '⚠️ No history to reverse!';
    }

    if (p.health <= 0) {
      setMessage('💀 You died!');
      setItems([]);
      return;
    }

    p.tools = Array.from(p.tools);
    setPlayer(p);
    setTimeEffect(p.timeEffect || 'Normal');
    setItems([]);
    setRevealedItem(item);
    setMessage(feedback);

    axios.post('http://localhost:4000/api/player', p).catch(console.error);
  };

  if (!player) return <div className="App">Loading...</div>;

  return (
    <div className="App">
      <h1>🚀 ChronoCrawl</h1>
      <Clock timeEffect={timeEffect} />

      <div className="status">
        <span>❤️ Health: {player.health}</span>
        <span>⏳ Time Effect: {timeEffect}</span>
        <span>📍 Position: ({player.position.x}, {player.position.y})</span>
      </div>

      <div className="inventory">
        <h3>🧰 Inventory</h3>
        {player.tools.length === 0 ? (
          <p>Empty</p>
        ) : (
          <ul>
            {player.tools.map((tool, i) => (
              <li key={i}>{tool}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="controls">
        <button onClick={() => move('up')}>⬆️</button>
        <div>
          <button onClick={() => move('left')}>⬅️</button>
          <button onClick={() => move('down')}>⬇️</button>
          <button onClick={() => move('right')}>➡️</button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="items">
          <p>{message}</p>
          <div className="mystery-boxes">
            {items.map((_, idx) => (
              <button key={idx} onClick={() => chooseItem(idx)}>
                🎁 Mystery Box {idx + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {revealedItem && <p className="reveal">{message}</p>}
      {!items.length && !revealedItem && <p>{message}</p>}
    </div>
  );
}

export default App;
