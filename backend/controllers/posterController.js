const Poster = require('../models/Poster');

// @desc    Get all active promotional posters for mobile app
// @route   GET /api/posters/active
// @access  Public
const getActivePosters = async (req, res, next) => {
  try {
    const now = new Date();
    const query = {
      isActive: true,
      $and: [
        {
          $or: [
            { startDate: null },
            { startDate: { $exists: false } },
            { startDate: { $lte: now } },
          ],
        },
        {
          $or: [
            { endDate: null },
            { endDate: { $exists: false } },
            { endDate: { $gte: now } },
          ],
        },
      ],
    };

    const posters = await Poster.find(query).sort({ displayOrder: 1, createdAt: -1 });
    res.json(posters);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all posters (including inactive/scheduled) for admin console
// @route   GET /api/posters
// @access  Protected/Admin
const getAllPosters = async (req, res, next) => {
  try {
    const posters = await Poster.find().sort({ displayOrder: 1, createdAt: -1 });
    res.json(posters);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single poster by ID
// @route   GET /api/posters/:id
// @access  Protected/Admin
const getPosterById = async (req, res, next) => {
  try {
    const poster = await Poster.findById(req.params.id);
    if (!poster) {
      return res.status(404).json({ success: false, message: 'Poster not found' });
    }
    res.json(poster);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new promotional poster
// @route   POST /api/posters
// @access  Protected/Admin
const createPoster = async (req, res, next) => {
  try {
    const {
      imageUrl,
      title,
      customText = '',
      subtitle = '',
      badgeText = '',
      buttonText = '',
      buttonLink = '',
      linkType = 'none',
      linkValue = '',
      isActive = true,
      displayOrder = 0,
      startDate = null,
      endDate = null,
    } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Poster image URL is required' });
    }

    if (!title) {
      return res.status(400).json({ success: false, message: 'Poster title is required' });
    }

    const validLinkTypes = ['product', 'category', 'project', 'search', 'url', 'screen', 'none'];
    if (linkType && !validLinkTypes.includes(linkType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid linkType. Allowed values: ${validLinkTypes.join(', ')}`,
      });
    }

    const poster = await Poster.create({
      imageUrl,
      title,
      customText,
      subtitle,
      badgeText,
      buttonText,
      buttonLink,
      linkType,
      linkValue,
      isActive,
      displayOrder: Number(displayOrder) || 0,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    });

    res.status(201).json(poster);
  } catch (error) {
    next(error);
  }
};

// @desc    Update promotional poster
// @route   PUT /api/posters/:id
// @access  Protected/Admin
const updatePoster = async (req, res, next) => {
  try {
    const poster = await Poster.findById(req.params.id);
    if (!poster) {
      return res.status(404).json({ success: false, message: 'Poster not found' });
    }

    const {
      imageUrl,
      title,
      customText,
      subtitle,
      badgeText,
      buttonText,
      buttonLink,
      linkType,
      linkValue,
      isActive,
      displayOrder,
      startDate,
      endDate,
    } = req.body;

    if (imageUrl !== undefined) poster.imageUrl = imageUrl;
    if (title !== undefined) poster.title = title;
    if (customText !== undefined) poster.customText = customText;
    if (subtitle !== undefined) poster.subtitle = subtitle;
    if (badgeText !== undefined) poster.badgeText = badgeText;
    if (buttonText !== undefined) poster.buttonText = buttonText;
    if (buttonLink !== undefined) poster.buttonLink = buttonLink;
    if (linkType !== undefined) {
      const validLinkTypes = ['product', 'category', 'project', 'search', 'url', 'screen', 'none'];
      if (!validLinkTypes.includes(linkType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid linkType. Allowed values: ${validLinkTypes.join(', ')}`,
        });
      }
      poster.linkType = linkType;
    }
    if (linkValue !== undefined) poster.linkValue = linkValue;
    if (isActive !== undefined) poster.isActive = Boolean(isActive);
    if (displayOrder !== undefined) poster.displayOrder = Number(displayOrder) || 0;
    if (startDate !== undefined) poster.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) poster.endDate = endDate ? new Date(endDate) : null;

    const updated = await poster.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete promotional poster
// @route   DELETE /api/posters/:id
// @access  Protected/Admin
const deletePoster = async (req, res, next) => {
  try {
    const poster = await Poster.findById(req.params.id);
    if (!poster) {
      return res.status(404).json({ success: false, message: 'Poster not found' });
    }

    await Poster.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Poster deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reorder multiple posters
// @route   PUT /api/posters/reorder
// @access  Protected/Admin
const reorderPosters = async (req, res, next) => {
  try {
    const { items } = req.body; // array of { id, displayOrder }
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Items array required' });
    }

    const updateOps = items.map(item =>
      Poster.findByIdAndUpdate(item.id || item._id, {
        displayOrder: Number(item.displayOrder) || 0,
      })
    );

    await Promise.all(updateOps);
    const updatedPosters = await Poster.find().sort({ displayOrder: 1, createdAt: -1 });
    res.json(updatedPosters);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivePosters,
  getAllPosters,
  getPosterById,
  createPoster,
  updatePoster,
  deletePoster,
  reorderPosters,
};
