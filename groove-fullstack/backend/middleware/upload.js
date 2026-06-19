const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    if (file.fieldname === 'audio') {
      return {
        folder: 'groove/songs',
        resource_type: 'video'
      };
    }

    return {
      folder: 'groove/covers'
    };
  }
});

module.exports = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});