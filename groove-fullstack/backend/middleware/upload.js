const multer = require('multer');
const path = require('path');

const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/songs');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: audioStorage,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

module.exports = upload;