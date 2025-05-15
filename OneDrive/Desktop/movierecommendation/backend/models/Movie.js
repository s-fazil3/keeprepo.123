const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  releaseDate: {
    type: Date,
    required: true,
  },
  genre: [{
    type: String,
    required: true,
  }],
  language: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0,
  },
  poster: {
    type: String,
    required: true,
  },
  backdrop: {
    type: String,
    required: true,
  },
  runtime: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['movie', 'tv'],
    required: true,
  },
  tmdbId: {
    type: Number,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;
