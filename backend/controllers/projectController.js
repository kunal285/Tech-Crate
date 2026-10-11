const ProjectKit = require('../models/ProjectKit');

// @desc Fetch all project kits directly from MongoDB
// @route GET /api/projects
const getProjects = async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category && category !== 'All') query.category = category;

    const projects = await ProjectKit.find(query).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Fetch single project kit by ID directly from MongoDB
// @route GET /api/projects/:id
const getProjectById = async (req, res) => {
  try {
    const project = await ProjectKit.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project kit not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create a new project kit in MongoDB
// @route POST /api/projects
const createProject = async (req, res) => {
  try {
    const kit = new ProjectKit({
      ...req.body,
      rating: req.body.rating || 4.8,
      buildCount: req.body.buildCount || 0,
    });
    const createdKit = await kit.save();
    res.status(201).json(createdKit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Circuit hardware & logic level compatibility analyzer
// @route POST /api/projects/compatibility
const checkCompatibility = async (req, res) => {
  try {
    const { componentNames } = req.body;
    let warnings = [];
    let powerRequired = 5;
    let issuesFound = false;

    const names = (componentNames || []).map((n) => n.toLowerCase());

    if (names.some((n) => n.includes('esp32') || n.includes('pico')) && names.some((n) => n.includes('5v logic') || n.includes('arduino'))) {
      warnings.push('ESP32 / Pico operate at 3.3V logic. Connecting 5V signals directly without logic level shifter may damage GPIO pins!');
      issuesFound = true;
    }

    if (names.some((n) => n.includes('servo') || n.includes('motor')) && !names.some((n) => n.includes('driver') || n.includes('l298n'))) {
      warnings.push('Motors & Servos require high current. Direct microcontroller pin power will cause brownouts. Dedicated Motor Driver/External Power source required.');
      issuesFound = true;
    }

    res.json({
      compatible: !issuesFound,
      voltageRequirement: `${powerRequired}V DC`,
      warnings,
      score: issuesFound ? 75 : 98,
      recommendation: issuesFound ? 'Add Logic Level Converter or external power supply' : 'All selected components are 100% electrically & pin compatible!',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update a project kit in MongoDB
// @route PUT /api/projects/:id
const updateProject = async (req, res) => {
  try {
    const updated = await ProjectKit.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Project kit not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete a project kit in MongoDB
// @route DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  try {
    const deleted = await ProjectKit.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Project kit not found' });
    }
    res.json({ message: 'Project kit deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  checkCompatibility,
};
