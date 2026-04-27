const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    year: String,
    genre: String,
    poster: String,
    rating: String,
    rated: String,
    runtime: String,
    director: String,
    actors: String,
    plot: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Movie', movieSchema);