const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const songDir = path.join(__dirname, '../uploads/songs');
const coverDir = path.join(__dirname, '../uploads/covers');
if (!fs.existsSync(songDir)) fs.mkdirSync(songDir, { recursive: true });
if (!fs.existsSync(coverDir)) fs.mkdirSync(coverDir, { recursive: true });

// Storage for audio files
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'audio') cb(null, songDir);
    else cb(null, coverDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'audio') {
    const allowed = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only audio files are allowed (mp3, wav, ogg, flac, m4a, aac)'), false);
  } else if (file.fieldname === 'cover') {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only image files are allowed (jpg, png, webp)'), false);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: audioStorage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB max
});

module.exports = upload;
