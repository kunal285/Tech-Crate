const cloudinary = require('../config/cloudinary');

/**
 * Upload an image buffer or file to Cloudinary
 * @param {Buffer|string} fileSource - File buffer or Base64 string
 * @param {string} folderName - Cloudinary folder (e.g. 'products', 'projects', 'avatars')
 */
const uploadToCloudinary = async (fileSource, folderName = 'TechCrate') => {
  return new Promise((resolve, reject) => {
    // If Cloudinary credentials are mock/default in dev mode, provide safe fallback structure
    if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === '1234567890') {
      const mockUrl = `https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80`;
      return resolve({
        url: mockUrl,
        secure_url: mockUrl,
        public_id: `mock_${Date.now()}`,
        format: 'jpg',
        width: 800,
        height: 600,
        bytes: 1024,
      });
    }

    const uploadOptions = {
      folder: `TechCrate/${folderName}`,
      resource_type: 'image',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
        { width: 1200, crop: 'limit' },
      ],
    };

    if (Buffer.isBuffer(fileSource)) {
      const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
      stream.end(fileSource);
    } else if (typeof fileSource === 'string') {
      cloudinary.uploader.upload(fileSource, uploadOptions, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    } else {
      reject(new Error('Invalid file format for Cloudinary upload'));
    }
  });
};

/**
 * Delete image from Cloudinary by public ID
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId || publicId.startsWith('mock_')) return { result: 'ok' };
  return cloudinary.uploader.destroy(publicId);
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
};
