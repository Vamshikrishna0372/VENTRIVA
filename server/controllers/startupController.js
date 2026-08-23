const mongoose = require('mongoose');
const Startup = require('../models/Startup');
const TeamMember = require('../models/TeamMember');
const User = require('../models/User');
const { SECTORS, STAGES, BUSINESS_MODELS, FUNDRAISING_STATUSES, PROFILE_VISIBILITY } = require('../config/constants');
const { calculateProfileCompletion } = require('../services/profileCompletionService');

// Helper to generate unique slug
const generateUniqueSlug = async (name, currentId = null) => {
  let baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

  if (!baseSlug) baseSlug = 'startup';

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await Startup.findOne({ slug, _id: { $ne: currentId } });
    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
};

/**
 * @desc    Create a new startup profile for founder
 * @route   POST /api/startups
 * @access  Private (Founder)
 */
const createStartup = async (req, res, next) => {
  try {
    const {
      startupName,
      name,
      tagline,
      description,
      foundedYear,
      sector,
      subSector,
      stage,
      businessModel,
      country,
      state,
      city,
      locationDisplay,
      website,
      linkedin,
      tractionSummary,
      monthlyRevenue,
      annualRevenue,
      revenueCurrency,
      revenueGrowth,
      customerCount,
      userCount,
      otherTraction,
      fundraisingStatus,
      fundingStage,
      fundingRequired,
      fundingCurrency,
      previousFunding,
      previousFundingCurrency,
      targetCloseDate,
      fundraisingSummary,
      profileVisibility,
    } = req.body;

    const resolvedStartupName = startupName || name;

    // Check if founder already has an active startup (If exists, update & sync instead of 400 rejection)
    const existing = await Startup.findOne({ founder: req.user._id, isDeleted: false });
    if (existing) {
      if (resolvedStartupName) existing.startupName = resolvedStartupName.trim();
      if (tagline !== undefined) existing.tagline = tagline.trim();
      if (description !== undefined) existing.description = description.trim();
      if (foundedYear !== undefined) existing.foundedYear = Number(foundedYear);
      if (sector !== undefined) existing.sector = sector;
      if (subSector !== undefined) existing.subSector = subSector.trim();
      if (stage !== undefined) existing.stage = stage;
      if (businessModel !== undefined) existing.businessModel = businessModel;
      if (country !== undefined) existing.country = country.trim();
      if (state !== undefined) existing.state = state.trim();
      if (city !== undefined) existing.city = city.trim();
      if (website !== undefined) existing.website = website.trim();
      if (linkedin !== undefined) existing.linkedin = linkedin.trim();
      if (monthlyRevenue !== undefined) existing.monthlyRevenue = Number(monthlyRevenue) || 0;
      if (annualRevenue !== undefined) existing.annualRevenue = Number(annualRevenue) || 0;
      if (customerCount !== undefined) existing.customerCount = Number(customerCount) || 0;
      if (userCount !== undefined) existing.userCount = Number(userCount) || 0;
      if (fundingRequired !== undefined) existing.fundingRequired = Number(fundingRequired) || 0;
      if (fundraisingStatus !== undefined) existing.fundraisingStatus = fundraisingStatus;
      if (profileVisibility !== undefined) existing.profileVisibility = profileVisibility;

      await existing.save();
      const teamMembers = await TeamMember.find({ startup: existing._id });

      return res.status(200).json({
        success: true,
        message: 'Startup profile updated successfully',
        startup: existing,
        teamMembers,
      });
    }

    const errors = {};
    if (!resolvedStartupName || !resolvedStartupName.trim()) errors.startupName = 'Startup name is required';
    if (!description || !description.trim()) errors.description = 'Description is required';
    if (!foundedYear) errors.foundedYear = 'Founded year is required';
    if (!sector) errors.sector = 'Primary sector is required';
    if (!stage) errors.stage = 'Startup stage is required';
    if (!businessModel) errors.businessModel = 'Business model is required';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: startupName, description, foundedYear, sector, stage, businessModel',
        errors,
      });
    }

    // Backend Validation Checks
    if (SECTORS && !SECTORS.includes(sector)) {
      errors.sector = `Invalid sector selected: ${sector}`;
    }
    if (STAGES && !STAGES.includes(stage)) {
      errors.stage = `Invalid stage selected: ${stage}`;
    }
    if (BUSINESS_MODELS && !BUSINESS_MODELS.includes(businessModel)) {
      errors.businessModel = `Invalid business model selected: ${businessModel}`;
    }
    if (profileVisibility && !PROFILE_VISIBILITY.includes(profileVisibility)) {
      errors.profileVisibility = `Invalid profile visibility selected: ${profileVisibility}`;
    }

    if (
      Number(monthlyRevenue) < 0 ||
      Number(annualRevenue) < 0 ||
      Number(customerCount) < 0 ||
      Number(userCount) < 0 ||
      Number(fundingRequired) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Numeric metrics (revenue, customers, users, funding) cannot be negative',
      });
    }

    const currentYear = new Date().getFullYear();
    if (Number(foundedYear) < 1900 || Number(foundedYear) > currentYear + 1) {
      return res.status(400).json({
        success: false,
        message: `Founded year must be between 1900 and ${currentYear + 1}`,
      });
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Startup validation failed',
        errors,
      });
    }

    const slug = await generateUniqueSlug(resolvedStartupName);
    const founderUser = await User.findById(req.user._id);

    // Clean targetCloseDate (handle empty string cleanly)
    const validCloseDate = targetCloseDate && String(targetCloseDate).trim() !== '' ? new Date(targetCloseDate) : null;

    const startup = new Startup({
      founder: req.user._id,
      startupName: resolvedStartupName.trim(),
      slug,
      tagline: tagline ? tagline.trim() : '',
      description: description.trim(),
      foundedYear: Number(foundedYear),
      sector,
      subSector: subSector || '',
      stage,
      businessModel,
      country: country || '',
      state: state || '',
      city: city || '',
      locationDisplay: locationDisplay || (city && country ? `${city}, ${country}` : city || country || ''),
      website: website || '',
      linkedin: linkedin || '',
      tractionSummary: tractionSummary || '',
      monthlyRevenue: Number(monthlyRevenue) || 0,
      annualRevenue: Number(annualRevenue) || 0,
      revenueCurrency: revenueCurrency || 'USD',
      revenueGrowth: Number(revenueGrowth) || 0,
      customerCount: Number(customerCount) || 0,
      userCount: Number(userCount) || 0,
      otherTraction: otherTraction || '',
      fundraisingStatus: fundraisingStatus || 'Currently Raising',
      fundingStage: fundingStage || stage,
      fundingRequired: Number(fundingRequired) || 0,
      fundingCurrency: fundingCurrency || 'USD',
      previousFunding: Number(previousFunding) || 0,
      previousFundingCurrency: previousFundingCurrency || 'USD',
      targetCloseDate: validCloseDate,
      fundraisingSummary: fundraisingSummary || '',
      profileVisibility: profileVisibility || 'Private',
    });

    const { percentage } = calculateProfileCompletion(startup, founderUser, 0);
    startup.profileCompletion = percentage;

    await startup.save();

    res.status(201).json({
      success: true,
      message: 'Startup profile created successfully',
      startup,
      teamMembers: [],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all startups owned by current founder
 * @route   GET /api/startups
 * @access  Private (Founder)
 */
const getStartups = async (req, res, next) => {
  try {
    const startups = await Startup.find({ founder: req.user._id, isDeleted: false });
    res.status(200).json({
      success: true,
      count: startups.length,
      startups,
      data: startups,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current founder's startup profile
 * @route   GET /api/startups/my
 * @access  Private (Founder)
 */
const getMyStartup = async (req, res, next) => {
  try {
    let startup = await Startup.findOne({ founder: req.user._id, isDeleted: false }).populate('founder', 'name email organization avatar role');

    if (!startup) {
      return res.status(200).json({
        success: true,
        startup: null,
        teamMembers: [],
        missingFields: ['Create Startup Profile'],
      });
    }

    const teamMembers = await TeamMember.find({ startup: startup._id }).sort({ displayOrder: 1, createdAt: 1 });
    const founderUser = await User.findById(req.user._id);

    const { percentage, missingFields } = calculateProfileCompletion(startup, founderUser, teamMembers.length);
    if (startup.profileCompletion !== percentage) {
      startup.profileCompletion = percentage;
      await startup.save();
    }

    res.status(200).json({
      success: true,
      startup,
      teamMembers,
      missingFields,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get startup by ID (with ownership check for Founder)
 * @route   GET /api/startups/my/:id
 * @access  Private (Founder)
 */
const getMyStartupById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Startup ObjectId format' });
    }

    const startup = await Startup.findById(id);

    if (!startup || startup.isDeleted) {
      return res.status(404).json({ success: false, message: 'Startup profile not found' });
    }

    // Strict Ownership Security Check
    if (startup.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not possess ownership authorization for this startup profile',
      });
    }

    const teamMembers = await TeamMember.find({ startup: startup._id }).sort({ displayOrder: 1 });
    res.status(200).json({ success: true, startup, teamMembers });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update founder's startup profile
 * @route   PUT /api/startups/my/:id
 * @access  Private (Founder)
 */
const updateMyStartup = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Startup ObjectId format' });
    }

    const startup = await Startup.findById(id);

    if (!startup || startup.isDeleted) {
      return res.status(404).json({ success: false, message: 'Startup profile not found' });
    }

    // Strict Ownership Security Check
    if (startup.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not possess ownership authorization for this startup profile',
      });
    }

    // Validation
    const errors = {};
    if (req.body.sector && SECTORS && !SECTORS.includes(req.body.sector)) {
      errors.sector = `Invalid sector selected: ${req.body.sector}`;
    }
    if (req.body.stage && STAGES && !STAGES.includes(req.body.stage)) {
      errors.stage = `Invalid stage selected: ${req.body.stage}`;
    }
    if (req.body.businessModel && BUSINESS_MODELS && !BUSINESS_MODELS.includes(req.body.businessModel)) {
      errors.businessModel = `Invalid business model selected: ${req.body.businessModel}`;
    }
    if (req.body.profileVisibility && PROFILE_VISIBILITY && !PROFILE_VISIBILITY.includes(req.body.profileVisibility)) {
      errors.profileVisibility = `Invalid profile visibility selected: ${req.body.profileVisibility}`;
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: 'Validation error', errors });
    }

    if (
      (req.body.monthlyRevenue !== undefined && Number(req.body.monthlyRevenue) < 0) ||
      (req.body.annualRevenue !== undefined && Number(req.body.annualRevenue) < 0) ||
      (req.body.customerCount !== undefined && Number(req.body.customerCount) < 0) ||
      (req.body.userCount !== undefined && Number(req.body.userCount) < 0) ||
      (req.body.fundingRequired !== undefined && Number(req.body.fundingRequired) < 0)
    ) {
      return res.status(400).json({ success: false, message: 'Numeric metrics (revenue, customers, users, funding) cannot be negative' });
    }

    // Update allowable fields
    const fields = [
      'startupName', 'tagline', 'description', 'foundedYear', 'sector', 'subSector',
      'stage', 'businessModel', 'country', 'state', 'city', 'locationDisplay',
      'website', 'linkedin', 'tractionSummary', 'monthlyRevenue', 'annualRevenue',
      'revenueCurrency', 'revenueGrowth', 'customerCount', 'userCount', 'otherTraction',
      'fundraisingStatus', 'fundingStage', 'fundingRequired', 'fundingCurrency',
      'previousFunding', 'previousFundingCurrency', 'fundraisingSummary',
      'profileVisibility', 'isPublished', 'logo'
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] === 'string') {
          startup[field] = req.body[field].trim();
        } else {
          startup[field] = req.body[field];
        }
      }
    });

    // Safely update targetCloseDate
    if (req.body.targetCloseDate !== undefined) {
      startup.targetCloseDate = req.body.targetCloseDate && String(req.body.targetCloseDate).trim() !== ''
        ? new Date(req.body.targetCloseDate)
        : null;
    }

    if (req.body.startupName && req.body.startupName !== startup.startupName) {
      startup.slug = await generateUniqueSlug(req.body.startupName, startup._id);
    }

    const teamMembersCount = await TeamMember.countDocuments({ startup: startup._id });
    const founderUser = await User.findById(req.user._id);

    const { percentage } = calculateProfileCompletion(startup, founderUser, teamMembersCount);
    startup.profileCompletion = percentage;

    await startup.save();

    res.status(200).json({
      success: true,
      message: 'Startup profile saved successfully',
      startup,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft delete founder's startup profile
 * @route   DELETE /api/startups/my/:id
 * @access  Private (Founder)
 */
const deleteMyStartup = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Startup ObjectId format' });
    }

    const startup = await Startup.findById(id);

    if (!startup || startup.isDeleted) {
      return res.status(404).json({ success: false, message: 'Startup profile not found' });
    }

    // Strict Ownership Security Check
    if (startup.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not possess ownership authorization for this startup profile',
      });
    }

    startup.isDeleted = true;
    startup.deletedAt = new Date();
    await startup.save();

    res.status(200).json({
      success: true,
      message: 'Startup profile soft-deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStartup,
  getStartups,
  getMyStartup,
  getMyStartupById,
  updateMyStartup,
  deleteMyStartup,
};
