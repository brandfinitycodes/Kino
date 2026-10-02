const multer = require('multer');
const ImageKit = require('imagekit');
require('dotenv').config();

// Configure ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// Configure Multer to store file in memory
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for videos
  }
});

module.exports = {
  upload,
  imagekit
};
