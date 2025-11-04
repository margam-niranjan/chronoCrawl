require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const Player = require('./models/player');
const { effects, getItemChoices } = require('./game/logic');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const GRID_SIZE = 5;
const REQUIRED_TOOLS = ['Laser Cutter', 'EMP Blaster', 'Shield Module'];

const player = {
  name: "Commander Nova",
  health: 100,
  position: { x: 2, y: 2 },
  history: [],
  tools: new Set()
};

const checkVictory = () => {
  return REQUIRED_TOOLS.every(tool => player.tools.has(tool));
};

console.log("🚀 Welcome Commander Nova!");
console.log("Use w/a/s/d to move, i to view inventory.");
console.log("Collect all 3 critical tools to save the spacecraft.\n");

const promptMove = () => {
  console.log(`\n📍 Sector: (${player.position.x}, ${player.position.y}) | ❤️ Health: ${player.health}`);
  console.log(`🔧 Tools Collected: ${Array.from(player.tools).join(', ') || 'None'}`);

  rl.question("Navigate (w/a/s/d), or (i) to view inventory: ", input => {
    if (input === 'i') {
      console.log("\n🧰 INVENTORY");
      console.log("🔧 Tools:", Array.from(player.tools).join(', ') || 'None');
      console.log("❤️ Health:", player.health);
      console.log("📍 Position:", `(${player.position.x}, ${player.position.y})`);
      return promptMove();
    }

    player.history.push([player.position.x, player.position.y]);

    switch (input) {
      case 'w': player.position.y = Math.max(0, player.position.y - 1); break;
      case 's': player.position.y = Math.min(GRID_SIZE - 1, player.position.y + 1); break;
      case 'a': player.position.x = Math.max(0, player.position.x - 1); break;
      case 'd': player.position.x = Math.min(GRID_SIZE - 1, player.position.x + 1); break;
      default:
        console.log("❌ Invalid direction.");
        return promptMove();
    }

    const items = getItemChoices(3);
    console.log("\n🧰 Scanning room... You find:");
    items.forEach((item, i) => console.log(`  ${i + 1}. ${item}`));

    rl.question("Choose an item (1/2/3): ", async choice => {
      const index = parseInt(choice) - 1;
      const selectedItem = items[index];

      if (!selectedItem) {
        console.log("❌ Invalid selection. You missed the chance.");
        return promptMove();
      }

      console.log(`🧪 You chose: ${selectedItem}`);
      const effect = effects[selectedItem];
      if (effect) effect(player);

      if (player.health <= 0) {
        console.log("☠️ You succumbed to your injuries. Game Over.");
        rl.close();
        return;
      }

      await saveProgress();

      if (checkVictory()) {
        console.log("🎉 All critical tools collected! You initiate the ship's self-cleanse protocol.");
        console.log("🚀 You survived and saved the spacecraft!");
        rl.close();
        return;
      }

      if (selectedItem === 'timeFast') promptMove();
      else if (selectedItem === 'timeSlow') setTimeout(promptMove, 2000);
      else promptMove();
    });
  });
};

const saveProgress = async () => {
  await Player.deleteMany({});
  const p = new Player({
    name: player.name,
    health: player.health,
    position: player.position,
    history: player.history,
    tools: Array.from(player.tools)
  });
  await p.save();
};

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("🛸 Connected to MongoDB Atlas");
    promptMove();
  })
  .catch(err => {
    console.error("❌ MongoDB error:", err);
  });
