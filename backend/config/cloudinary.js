const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'TechCrate',
  api_key: process.env.CLOUDINARY_API_KEY || '1234567890',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'secret_key',
  secure: true,
});

module.exports = cloudinary;
