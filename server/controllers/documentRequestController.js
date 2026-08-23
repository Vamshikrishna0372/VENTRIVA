const mongoose = require('mongoose');
const DocumentRequest = require('../models/DocumentRequest');
const Startup = require('../models/Startup');

/**
 * @desc    Create a document request to founder
 * @route   POST /api/document-requests
 * @access  Private (Investor)
 */
const createDocumentRequest = async (req, res, next) => {
  try {
    const { startupId, category, title, description, priority } = req.body;

    if (!mongoose.Types.ObjectId.isValid(startupId)) {
      return res.status(400).json({ success: false, message: 'Invalid Startup ObjectId format' });
    }

    const startup = await Startup.findById(startupId);
    if (!startup || startup.isDeleted || !startup.isPublished) {
      return res.status(404).json({ success: false, message: 'Startup profile unavailable for document request' });
    }

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Request title is required' });
    }

    const docReq = await DocumentRequest.create({
      startup: startup._id,
      investor: req.user._id,
      requestedBy: req.user._id,
      category: category || 'Other',
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'Medium',
      status: 'Requested',
    });

    res.status(201).json({
      success: true,
      message: 'Document request submitted to founder',
      request: docReq,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get document requests for current user (Founder or Investor)
 * @route   GET /api/document-requests
 * @access  Private (Founder / Investor / Admin)
 */
const getDocumentRequests = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'founder') {
      const startup = await Startup.findOne({ founder: req.user._id, isDeleted: false });
      if (!startup) {
        return res.status(200).json({ success: true, count: 0, requests: [] });
      }
      query.startup = startup._id;
    } else if (req.user.role === 'investor') {
      query.investor = req.user._id;
    }

    const requests = await DocumentRequest.find(query)
      .populate('startup', 'startupName sector stage logo')
      .populate('investor', 'name email organization')
      .populate('responseDocument', 'title category fileName fileSize')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update document request status or respond with file
 * @route   PATCH /api/document-requests/:id
 * @access  Private (Founder / Investor / Admin)
 */
const updateDocumentRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, founderResponse, responseDocumentId } = req.body;

    const docReq = await DocumentRequest.findById(id);
    if (!docReq) {
      return res.status(404).json({ success: false, message: 'Document request not found' });
    }

    const startup = await Startup.findById(docReq.startup);
    const isFounderOwner = req.user.role === 'founder' && startup.founder.toString() === req.user._id.toString();
    const isRequestingInvestor = req.user.role === 'investor' && docReq.investor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isFounderOwner && !isRequestingInvestor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to manage this document request' });
    }

    if (status) docReq.status = status;
    if (founderResponse !== undefined) docReq.founderResponse = founderResponse.trim();
    if (responseDocumentId) {
      docReq.responseDocument = responseDocumentId;
      docReq.status = 'Provided';
      docReq.completedAt = new Date();
    }

    await docReq.save();

    res.status(200).json({
      success: true,
      message: 'Document request updated successfully',
      request: docReq,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDocumentRequest,
  getDocumentRequests,
  updateDocumentRequest,
};
