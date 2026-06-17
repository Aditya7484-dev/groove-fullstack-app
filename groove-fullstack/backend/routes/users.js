const express = require('express');
const router = express.Router();
const {
  getProfile, getMyUploads,
  createPlaylist, addToPlaylist
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/profile',                        protect, getProfile);
router.get('/my-uploads',                     protect, getMyUploads);
router.post('/playlist',                      protect, createPlaylist);
router.post('/playlist/:playlistId/add',      protect, addToPlaylist);

module.exports = router;
