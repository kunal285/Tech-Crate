const express = require('express');
const multer = require('multer');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/uploadService');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Memory storage for Multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

/**
 * @route   POST /api/upload/image
 * @desc    Upload single image to Cloudinary
 * @access  Protected
 */
router.post('/image', protect, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file && !req.body.image) {
      return res.status(400).json({ success: false, message: 'No image file or data provided' });
    }

    const folder = req.body.folder || 'products';
    const fileSource = req.file ? req.file.buffer : req.body.image;

    const result = await uploadToCloudinary(fileSource, folder);

    res.json({
      success: true,
      message: 'Image uploaded to Cloudinary successfully',
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
 * @desc    Upload multiple images to Cloudinary
 * @access  Protected
 */
router.post('/images', protect, upload.array('images', 5), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No image files provided' });
    }

    const folder = req.body.folder || 'products';
    const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer, folder));
    const results = await Promise.all(uploadPromises);

    const uploadedImages = results.map((res) => ({
      url: res.secure_url || res.url,
      public_id: res.public_id,
    }));

    res.json({
      success: true,
      message: 'Images uploaded to Cloudinary successfully',
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
