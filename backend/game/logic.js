const ALL_ITEMS = [
  'Laser Cutter',
  'EMP Blaster',
  'Shield Module',
  'Parasite Trap',
  'MedKit',
  'timeReverse',
  'timeSlow',
  'timeFast'
];

const effects = {
  'Laser Cutter': player => player.tools.add('Laser Cutter'),
  'EMP Blaster': player => player.tools.add('EMP Blaster'),
  'Shield Module': player => player.tools.add('Shield Module'),
  'Parasite Trap': player => {
    player.health -= 30;
  },
  'MedKit': player => {
    player.health = Math.min(100, player.health + 25);
  },
  'timeReverse': player => {
    if (player.history.length > 0) {
      const prev = player.history.pop();
      player.position = { x: prev[0], y: prev[1] };
    }
  },
  'timeSlow': player => {}, // handled in game.js
  'timeFast': player => {}  // handled in game.js
};

function getItemChoices(count = 3) {
  const chosen = new Set();
  while (chosen.size < count) {
    const item = ALL_ITEMS[Math.floor(Math.random() * ALL_ITEMS.length)];
    chosen.add(item);
  }
  return Array.from(chosen);
}

module.exports = { effects, getItemChoices };
