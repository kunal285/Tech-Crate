const express = require('express');
const multer = require('multer');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/uploadService');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_FOLDERS = ['products', 'avatars', 'banners', 'projects', 'categories'];

/**
 * Inspect magic bytes of buffer to ensure it is genuinely an image file
 */
const validateImageMagicBytes = (buffer) => {
  if (!buffer || buffer.length < 4) return false;
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return true;
  // GIF: 47 49 46 38
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return true;
  // WEBP: RIFF .... WEBP
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) return true;
  return false;
};

// Memory storage with strict limits
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, and GIF images are permitted.'), false);
    }
  },
});

/**
 * @route   POST /api/upload/image
 * @desc    Upload single image with magic byte verification and safe folder routing
 * @access  Protected
 */
router.post('/image', protect, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file && !req.body.image) {
      return res.status(400).json({ success: false, message: 'No image file or data provided.' });
    }

    if (req.file && !validateImageMagicBytes(req.file.buffer)) {
      return res.status(400).json({
        success: false,
        message: 'Security verification failed: File content does not match a valid image format.',
      });
    }

    // Sanitize destination folder to prevent path traversal
    const requestedFolder = String(req.body.folder || 'products').toLowerCase();
    const safeFolder = ALLOWED_FOLDERS.includes(requestedFolder) ? requestedFolder : 'products';

    const fileSource = req.file ? req.file.buffer : req.body.image;
    const result = await uploadToCloudinary(fileSource, safeFolder);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      url: result.secure_url || result.url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/upload/images
 * @desc    Upload multiple images with security checks
 * @access  Protected
 */
router.post('/images', protect, upload.array('images', 5), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No image files provided.' });
    }

    for (const file of req.files) {
      if (!validateImageMagicBytes(file.buffer)) {
        return res.status(400).json({
          success: false,
          message: 'Security verification failed: One or more files are not valid images.',
        });
      }
    }

    const requestedFolder = String(req.body.folder || 'products').toLowerCase();
    const safeFolder = ALLOWED_FOLDERS.includes(requestedFolder) ? requestedFolder : 'products';

    const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer, safeFolder));
    const results = await Promise.all(uploadPromises);

    const uploadedImages = results.map((r) => ({
      url: r.secure_url || r.url,
      public_id: r.public_id,
    }));

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      count: uploadedImages.length,
      images: uploadedImages,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/upload/:public_id
 * @desc    Delete image from Cloudinary
 * @access  Protected
 */
router.delete('/:public_id', protect, async (req, res, next) => {
  try {
    const { public_id } = req.params;
    await deleteFromCloudinary(public_id);
    res.json({ success: true, message: 'Image deleted from Cloudinary' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
