const Song = require('../models/Song');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// GET /api/songs — list all songs (with optional genre filter & search)
exports.getAllSongs = async (req, res) => {
  try {
    const { genre, search, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (genre && genre !== 'all') filter.genre = genre;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { artist: { $regex: search, $options: 'i' } },
      { album: { $regex: search, $options: 'i' } }
    ];

    const songs = await Song.find(filter)
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Song.countDocuments(filter);

    res.json({ success: true, total, songs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/songs/:id
exports.getSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id).populate('uploadedBy', 'username');
    if (!song) return res.status(404).json({ success: false, message: 'Song not found.' });
    res.json({ success: true, song });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/songs — upload a new song (protected)
exports.uploadSong = async (req, res) => {
  try {
    if (!req.files || !req.files.audio) {
      return res.status(400).json({ success: false, message: 'Audio file is required.' });
    }

    const { title, artist, album, genre, duration } = req.body;
    if (!title || !artist) {
      return res.status(400).json({ success: false, message: 'Title and artist are required.' });
    }

    const audioPath = 'songs/' + req.files.audio[0].filename;
    const coverPath = req.files.cover ? 'covers/' + req.files.cover[0].filename : '';

    const song = await Song.create({
      title,
      artist,
      album: album || 'Unknown Album',
      genre: genre || 'other',
      duration: parseInt(duration) || 0,
      audioFile: audioPath,
      coverImage: coverPath,
      uploadedBy: req.user._id
    });

    res.status(201).json({ success: true, message: 'Song uploaded successfully!', song });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/songs/:id (only uploader can delete)
exports.deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ success: false, message: 'Song not found.' });
    if (song.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this song.' });
    }

    // Remove files from disk
    const audioPath = path.join(__dirname, '../uploads', song.audioFile);
    if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    if (song.coverImage) {
      const coverPath = path.join(__dirname, '../uploads', song.coverImage);
      if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
    }

    await song.deleteOne();
    res.json({ success: true, message: 'Song deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/songs/:id/play — increment play count
exports.incrementPlay = async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(
      req.params.id,
      { $inc: { plays: 1 } },
      { new: true }
    );
    if (!song) return res.status(404).json({ success: false, message: 'Song not found.' });
    res.json({ success: true, plays: song.plays });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/songs/:id/like — toggle like (protected)
exports.toggleLike = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const songId = req.params.id;
    const song = await Song.findById(songId);
    if (!song) return res.status(404).json({ success: false, message: 'Song not found.' });

    const alreadyLiked = user.likedSongs.includes(songId);
    if (alreadyLiked) {
      user.likedSongs.pull(songId);
      song.likes = Math.max(0, song.likes - 1);
    } else {
      user.likedSongs.push(songId);
      song.likes += 1;
    }
    await user.save();
    await song.save();

    res.json({
      success: true,
      liked: !alreadyLiked,
      likes: song.likes,
      likedSongs: user.likedSongs
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
