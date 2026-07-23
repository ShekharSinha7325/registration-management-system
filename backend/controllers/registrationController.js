const Registration = require('../models/Registration');

// @desc  Create a new registration
// @route POST /api/registrations
exports.createRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.create(req.body);
    res.status(201).json({ success: true, data: registration });
  } catch (err) {
    next(err);
  }
};

// @desc  Get all registrations (supports ?status=&search=&page=&limit=)
// @route GET /api/registrations
exports.getRegistrations = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      Registration.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Registration.countDocuments(filter),
    ]);

    res.json({ success: true, total, page: Number(page), data });
  } catch (err) {
    next(err);
  }
};

// @desc  Get single registration
// @route GET /api/registrations/:id
exports.getRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }
    res.json({ success: true, data: registration });
  } catch (err) {
    next(err);
  }
};

// @desc  Update registration
// @route PUT /api/registrations/:id
exports.updateRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }
    res.json({ success: true, data: registration });
  } catch (err) {
    next(err);
  }
};

// @desc  Delete registration
// @route DELETE /api/registrations/:id
exports.deleteRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findByIdAndDelete(req.params.id);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }
    res.json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
