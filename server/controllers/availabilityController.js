const mongoose = require('mongoose');
const Availability = require('../models/Availability');

/**
 * Helper to convert "HH:MM" string to minutes from midnight
 */
const parseTimeToMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

/**
 * @desc    Get founder availability slots
 * @route   GET /api/availability
 * @access  Private (Founder / Investor)
 */
const getAvailability = async (req, res, next) => {
  try {
    const founderId = req.query.founderId || req.user._id;

    const slots = await Availability.find({ founder: founderId, isActive: true })
      .sort({ dayOfWeek: 1, startTime: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: slots.length,
      slots,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create founder availability slot
 * @route   POST /api/availability
 * @access  Private (Founder)
 */
const createAvailability = async (req, res, next) => {
  try {
    if (req.user.role !== 'founder') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only founders can configure availability' });
    }

    const { dayOfWeek, startTime, endTime, timezone } = req.body;

    const dayNum = Number(dayOfWeek);
    if (isNaN(dayNum) || dayNum < 0 || dayNum > 6) {
      return res.status(400).json({ success: false, message: 'dayOfWeek must be between 0 (Sun) and 6 (Sat)' });
    }

    const startMin = parseTimeToMinutes(startTime);
    const endMin = parseTimeToMinutes(endTime);

    if (endMin <= startMin) {
      return res.status(400).json({ success: false, message: 'endTime must be later than startTime' });
    }

    // Overlap validation check
    const existingSlots = await Availability.find({ founder: req.user._id, dayOfWeek: dayNum, isActive: true });
    for (const slot of existingSlots) {
      const sMin = parseTimeToMinutes(slot.startTime);
      const eMin = parseTimeToMinutes(slot.endTime);

      if (startMin < eMin && endMin > sMin) {
        return res.status(400).json({
          success: false,
          message: `Overlapping availability slot exists for day ${dayNum} (${slot.startTime} - ${slot.endTime})`,
        });
      }
    }

    const slot = await Availability.create({
      founder: req.user._id,
      dayOfWeek: dayNum,
      startTime,
      endTime,
      timezone: timezone || 'UTC',
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Availability slot created successfully',
      slot,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update availability slot
 * @route   PUT /api/availability/:id
 * @access  Private (Founder Owner)
 */
const updateAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, isActive } = req.body;

    const slot = await Availability.findById(id);
    if (!slot) return res.status(404).json({ success: false, message: 'Availability slot not found' });

    if (slot.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this slot' });
    }

    if (startTime) slot.startTime = startTime;
    if (endTime) slot.endTime = endTime;
    if (isActive !== undefined) slot.isActive = Boolean(isActive);

    const startMin = parseTimeToMinutes(slot.startTime);
    const endMin = parseTimeToMinutes(slot.endTime);

    if (endMin <= startMin) {
      return res.status(400).json({ success: false, message: 'endTime must be later than startTime' });
    }

    await slot.save();

    res.status(200).json({ success: true, message: 'Availability slot updated', slot });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete availability slot
 * @route   DELETE /api/availability/:id
 * @access  Private (Founder Owner)
 */
const deleteAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const slot = await Availability.findById(id);
    if (!slot) return res.status(404).json({ success: false, message: 'Availability slot not found' });

    if (slot.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    await Availability.deleteOne({ _id: slot._id });

    res.status(200).json({ success: true, message: 'Availability slot deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability,
};
