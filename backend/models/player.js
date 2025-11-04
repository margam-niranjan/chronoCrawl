const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    name: String,
    health: Number,
    position: {
        x: Number,
        y: Number
    },
    history: [[Number]],
    tools: [String],
    timeEffect: String
});

module.exports = mongoose.model('Player', playerSchema);
