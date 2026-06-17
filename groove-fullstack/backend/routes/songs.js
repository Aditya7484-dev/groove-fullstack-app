const express = require('express');
const router = express.Router();
const {
  getAllSongs, getSong, uploadSong,
  deleteSong, incrementPlay, toggleLike
} = require('../controllers/songController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/',                  getAllSongs);
router.get('/:id',               getSong);
router.post('/',     protect,    upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), uploadSong);
router.delete('/:id', protect,   deleteSong);
router.post('/:id/play',         incrementPlay);
router.post('/:id/like', protect, toggleLike);

module.exports = router;
