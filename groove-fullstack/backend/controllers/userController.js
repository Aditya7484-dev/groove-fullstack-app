const User = require('../models/User');
const Song = require('../models/Song');

// GET /api/users/profile — get current user profile with liked songs
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate({
        path: 'likedSongs',
        populate: { path: 'uploadedBy', select: 'username' }
      });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/users/my-uploads — songs uploaded by current user
exports.getMyUploads = async (req, res) => {
  try {
    const songs = await Song.find({ uploadedBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, songs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/users/playlist — create a playlist
exports.createPlaylist = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Playlist name is required.' });

    const user = await User.findById(req.user._id);
    user.playlists.push({ name, songs: [] });
    await user.save();

    res.status(201).json({ success: true, message: 'Playlist created.', playlists: user.playlists });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/users/playlist/:playlistId/add — add song to playlist
exports.addToPlaylist = async (req, res) => {
  try {
    const { songId } = req.body;
    const user = await User.findById(req.user._id);
    const playlist = user.playlists.id(req.params.playlistId);
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found.' });
    if (!playlist.songs.includes(songId)) playlist.songs.push(songId);
    await user.save();
    res.json({ success: true, message: 'Song added to playlist.', playlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
