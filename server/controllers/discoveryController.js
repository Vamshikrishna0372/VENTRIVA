const mongoose = require('mongoose');
const Startup = require('../models/Startup');
const TeamMember = require('../models/TeamMember');
const Shortlist = require('../models/Shortlist');

// Helper to escape regex special characters
const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

/**
 * @desc    Discover eligible published startups for investors
 * @route   GET /api/startups/discover
 * @access  Private (Investor)
 */
const discoverStartups = async (req, res, next) => {
  try {
    const {
      search,
      sector,
      subSector,
      stage,
      businessModel,
      country,
      fundraisingStatus,
      minFunding,
      maxFunding,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    // Discovery Eligibility Security Base Query
    const query = {
      isDeleted: false,
      isPublished: true,
      profileVisibility: 'Investors Only',
    };

    // Text Search
    if (search && search.trim().length > 0) {
      const sanitized = escapeRegex(search.trim());
      const regex = new RegExp(sanitized, 'i');
      query.$or = [
        { startupName: regex },
        { tagline: regex },
        { description: regex },
        { sector: regex },
        { subSector: regex },
        { locationDisplay: regex },
      ];
    }

    // Combinable Filters
    if (sector && sector !== 'all') query.sector = sector;
    if (subSector && subSector !== 'all') query.subSector = subSector;
    if (stage && stage !== 'all') query.stage = stage;
    if (businessModel && businessModel !== 'all') query.businessModel = businessModel;
    if (country && country !== 'all') query.country = new RegExp(escapeRegex(country), 'i');
    if (fundraisingStatus && fundraisingStatus !== 'all') query.fundraisingStatus = fundraisingStatus;

    if (minFunding !== undefined || maxFunding !== undefined) {
      query.fundingRequired = {};
      if (minFunding !== undefined && !isNaN(minFunding)) query.fundingRequired.$gte = Number(minFunding);
      if (maxFunding !== undefined && !isNaN(maxFunding)) query.fundingRequired.$lte = Number(maxFunding);
    }

    // Sorting Options
    let sortOptions = { createdAt: -1 }; // Default Newest
    if (sort === 'completeness') sortOptions = { profileCompletion: -1, createdAt: -1 };
    else if (sort === 'funding-asc') sortOptions = { fundingRequired: 1, createdAt: -1 };
    else if (sort === 'funding-desc') sortOptions = { fundingRequired: -1, createdAt: -1 };
    else if (sort === 'growth-desc') sortOptions = { revenueGrowth: -1, createdAt: -1 };

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const total = await Startup.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum) || 1;

    const startups = await Startup.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        startups,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed startup profile for investor
 * @route   GET /api/startups/discover/:id
 * @access  Private (Investor)
 */
const getStartupDetailForInvestor = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Startup ObjectId format' });
    }

    const startup = await Startup.findById(id).populate('founder', 'name email organization avatar role').lean();

    // Security Gate: Reject if startup is deleted, unpublished, or private
    if (!startup || startup.isDeleted || !startup.isPublished || startup.profileVisibility !== 'Investors Only') {
      return res.status(404).json({ success: false, message: 'Startup profile unavailable for discovery' });
    }

    const teamMembers = await TeamMember.find({ startup: startup._id }).sort({ displayOrder: 1 }).lean();
    const shortlistEntry = await Shortlist.findOne({ investor: req.user._id, startup: startup._id });

    res.status(200).json({
      success: true,
      startup,
      teamMembers,
      isShortlisted: !!shortlistEntry,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  discoverStartups,
  getStartupDetailForInvestor,
};
