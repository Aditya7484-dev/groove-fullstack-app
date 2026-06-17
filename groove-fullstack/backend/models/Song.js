const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Song title is required'],
    trim: true
  },
  artist: {
    type: String,
    required: [true, 'Artist name is required'],
    trim: true
  },
  album: {
    type: String,
    default: 'Unknown Album',
    trim: true
  },
  genre: {
    type: String,
    enum: ['pop', 'rock', 'jazz', 'electronic', 'hiphop', 'classical', 'other'],
    default: 'other'
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  audioFile: {
    type: String, // file path relative to uploads/songs/
    required: [true, 'Audio file is required']
  },
  coverImage: {
    type: String, // file path relative to uploads/covers/
    default: ''
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plays: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Song', songSchema);
