const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const Player = require('./models/player');

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB Error:", err));

app.get('/api/player', async (req, res) => {
    const existing = await Player.findOne();
    if (existing) return res.json(existing);
    const player = new Player({
        name: 'Commander Nova',
        health: 100,
        position: { x: 2, y: 2 },
        history: [],
        tools: [],
        timeEffect: 'Normal'
    });
    await player.save();
    res.json(player);
});

app.post('/api/player', async (req, res) => {
    await Player.deleteMany({});
    const newPlayer = new Player(req.body);
    await newPlayer.save();
    res.json(newPlayer);
});

app.listen(4000, () => console.log('🚀 Server running on http://localhost:4000'));
