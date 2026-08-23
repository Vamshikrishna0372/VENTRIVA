const mongoose = require('mongoose');
const Shortlist = require('../models/Shortlist');
const Startup = require('../models/Startup');
const TeamMember = require('../models/TeamMember');

/**
 * @desc    Add startup to investor shortlist
 * @route   POST /api/shortlists
 * @access  Private (Investor)
 */
const addToShortlist = async (req, res, next) => {
  try {
    const { startupId, notes, tags } = req.body;

    if (!startupId || !mongoose.Types.ObjectId.isValid(startupId)) {
      return res.status(400).json({ success: false, message: 'Valid startupId is required' });
    }

    const startup = await Startup.findById(startupId);
    if (!startup || startup.isDeleted || !startup.isPublished || startup.profileVisibility !== 'Investors Only') {
      return res.status(404).json({ success: false, message: 'Startup profile unavailable for shortlisting' });
    }

    // Check if already shortlisted
    let shortlist = await Shortlist.findOne({ investor: req.user._id, startup: startupId });
    if (shortlist) {
      return res.status(200).json({
        success: true,
        message: 'Startup is already in your shortlist',
        shortlist,
      });
    }

    shortlist = await Shortlist.create({
      investor: req.user._id,
      startup: startupId,
      notes: notes || '',
      tags: Array.isArray(tags) ? tags : [],
    });

    res.status(201).json({
      success: true,
      message: 'Startup added to shortlist successfully',
      shortlist,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: 'Startup is already in your shortlist',
      });
    }
    next(error);
  }
};

/**
 * @desc    Remove startup from investor shortlist
 * @route   DELETE /api/shortlists/:startupId
 * @access  Private (Investor)
 */
const removeFromShortlist = async (req, res, next) => {
  try {
    const { startupId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(startupId)) {
      return res.status(400).json({ success: false, message: 'Invalid startupId format' });
    }

    await Shortlist.deleteOne({ investor: req.user._id, startup: startupId });

    res.status(200).json({
      success: true,
      message: 'Startup removed from shortlist successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all shortlisted startups for investor
 * @route   GET /api/shortlists
 * @access  Private (Investor)
 */
const getShortlist = async (req, res, next) => {
  try {
    const shortlists = await Shortlist.find({ investor: req.user._id })
      .populate({
        path: 'startup',
        match: { isDeleted: false },
      })
      .sort({ createdAt: -1 })
      .lean();

    // Filter out null startups (if any soft-deleted)
    const validShortlists = shortlists.filter((item) => item.startup !== null);

    res.status(200).json({
      success: true,
      count: validShortlists.length,
      shortlists: validShortlists,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check shortlist status for a specific startup
 * @route   GET /api/shortlists/:startupId/status
 * @access  Private (Investor)
 */
const getShortlistStatus = async (req, res, next) => {
  try {
    const { startupId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(startupId)) {
      return res.status(400).json({ success: false, message: 'Invalid startupId format' });
    }

    const shortlist = await Shortlist.findOne({ investor: req.user._id, startup: startupId });

    res.status(200).json({
      success: true,
      isShortlisted: !!shortlist,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addToShortlist,
  removeFromShortlist,
  getShortlist,
  getShortlistStatus,
};
