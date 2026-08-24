const mongoose = require('mongoose');
const path = require('path');
const Document = require('../models/Document');
const Startup = require('../models/Startup');
const storageService = require('../services/storageService');
const {
  DOCUMENT_CATEGORIES,
  DOCUMENT_VISIBILITY,
  DOCUMENT_STATUSES,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} = require('../config/documentConstants');

// Helper to log document access
const logDocumentAccess = async (documentId, userId, startupId, action, req = null) => {
  try {
    const doc = await Document.findById(documentId);
    if (doc) {
      doc.accessLogs = doc.accessLogs || [];
      doc.accessLogs.push({
        accessedBy: userId,
        accessType: action,
        accessedAt: new Date(),
      });
      await doc.save();
    }
  } catch (err) {
    console.error('Failed to log document access:', err);
  }
};

/**
 * @desc    Upload new document to Virtual Data Room
 * @route   POST /api/documents
 * @access  Private (Founder Owner / Admin)
 */
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file attached for upload' });
    }

    const { startupId, category, title, description, visibility, isPrimary } = req.body;

    if (!mongoose.Types.ObjectId.isValid(startupId)) {
      return res.status(400).json({ success: false, message: 'Invalid Startup ObjectId format' });
    }

    const startup = await Startup.findById(startupId);
    if (!startup || startup.isDeleted) {
      return res.status(404).json({ success: false, message: 'Startup profile not found' });
    }

    // Security Gate: Founder Ownership Check
    if (req.user.role !== 'admin' && startup.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this startup data room' });
    }

    // File Validation
    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
    if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `File format .${ext} (${req.file.mimetype}) is strictly blocked. Allowed formats: ${ALLOWED_EXTENSIONS.join(', ')}`,
      });
    }

    if (req.file.size > MAX_FILE_SIZE_BYTES) {
      return res.status(400).json({ success: false, message: `File size exceeds the 25 MB limit` });
    }

    if (!category || !DOCUMENT_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid document category' });
    }

    // Save File Buffer to Storage Layer
    const storageResult = await storageService.uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);

    // Primary Pitch Deck auto-demotion logic
    const shouldBePrimary = Boolean(isPrimary === 'true' || isPrimary === true);
    if (shouldBePrimary && category === 'Pitch Deck') {
      await Document.updateMany({ startup: startup._id, category: 'Pitch Deck' }, { isPrimary: false });
    }

    const doc = await Document.create({
      startup: startup._id,
      uploadedBy: req.user._id,
      category,
      title: title ? title.trim() : req.file.originalname,
      description: description ? description.trim() : '',
      fileName: req.file.originalname,
      originalFileName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      storageProvider: storageResult.storageProvider,
      storageKey: storageResult.storageKey,
      version: 1,
      visibility: visibility && DOCUMENT_VISIBILITY.includes(visibility) ? visibility : 'Investors Only',
      status: 'Active',
      isPrimary: shouldBePrimary,
    });

    // Create initial version record in embedded array
    doc.versions = [
      {
        versionNumber: 1,
        fileUrl: doc.storageKey,
        uploadedBy: req.user._id,
        createdAt: new Date(),
      },
    ];
    await doc.save();

    await logDocumentAccess(doc._id, req.user._id, startup._id, 'UPLOAD', req);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document: doc,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get authorized documents for a startup
 * @route   GET /api/documents/startup/:startupId
 * @access  Private (Founder / Investor / Admin)
 */
const getDocumentsByStartup = async (req, res, next) => {
  try {
    const { startupId } = req.params;
    const { category, search } = req.query;

    if (!mongoose.Types.ObjectId.isValid(startupId)) {
      return res.status(400).json({ success: false, message: 'Invalid Startup ObjectId format' });
    }

    const startup = await Startup.findById(startupId);
    if (!startup || startup.isDeleted) {
      return res.status(404).json({ success: false, message: 'Startup profile not found' });
    }

    const isFounderOwner = req.user.role === 'founder' && startup.founder.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isInvestor = req.user.role === 'investor';

    // Security Gate: Non-owner Founder Access Protection
    if (req.user.role === 'founder' && !isFounderOwner) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this startup data room' });
    }

    // Investor Access Gate: Check Startup Discovery Eligibility
    if (isInvestor) {
      if (!startup.isPublished || startup.profileVisibility !== 'Investors Only') {
        return res.status(404).json({ success: false, message: 'Startup data room unavailable' });
      }
    }

    const query = { startup: startup._id };

    if (!isFounderOwner && !isAdmin) {
      // Investor visibility filter
      query.status = 'Active';
      query.visibility = { $in: ['Investors Only', 'Specific Investors'] };
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    let documents = await Document.find(query)
      .select('-storageKey -storageProvider')
      .sort({ isPrimary: -1, updatedAt: -1 })
      .lean();

    if (isInvestor) {
      documents = documents.filter((doc) => {
        if (doc.visibility === 'Investors Only') return true;
        if (doc.visibility === 'Specific Investors') {
          return Array.isArray(doc.allowedInvestors) && doc.allowedInvestors.some((invId) => invId.toString() === req.user._id.toString());
        }
        return false;
      });
    }

    if (search && search.trim().length > 0) {
      const term = search.trim().toLowerCase();
      documents = documents.filter(
        (doc) => doc.title.toLowerCase().includes(term) || doc.category.toLowerCase().includes(term)
      );
    }

    res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Secure file download stream
 * @route   GET /api/documents/:documentId/download
 * @access  Private (Authorized User)
 */
const downloadDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return res.status(400).json({ success: false, message: 'Invalid Document ObjectId format' });
    }

    const doc = await Document.findById(documentId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const startup = await Startup.findById(doc.startup);
    if (!startup || startup.isDeleted) {
      return res.status(404).json({ success: false, message: 'Associated startup unavailable' });
    }

    const isFounderOwner = req.user.role === 'founder' && startup.founder.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isInvestor = req.user.role === 'investor';

    let hasAccess = false;
    if (isFounderOwner || isAdmin) {
      hasAccess = true;
    } else if (isInvestor && doc.status === 'Active' && startup.isPublished && startup.profileVisibility === 'Investors Only') {
      if (doc.visibility === 'Investors Only') hasAccess = true;
      if (doc.visibility === 'Specific Investors' && doc.allowedInvestors.some((invId) => invId.toString() === req.user._id.toString())) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      await logDocumentAccess(doc._id, req.user._id, startup._id, 'ACCESS_DENIED', req);
      return res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to access this document' });
    }

    if (!storageService.fileExists(doc.storageKey)) {
      return res.status(404).json({ success: false, message: 'Document file buffer unavailable in storage' });
    }

    await logDocumentAccess(doc._id, req.user._id, startup._id, 'DOWNLOAD', req);

    res.setHeader('Content-Type', doc.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.originalFileName)}"`);

    const stream = storageService.downloadFileStream(doc.storageKey);
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload replacement document version
 * @route   POST /api/documents/:documentId/version
 * @access  Private (Founder Owner / Admin)
 */
const uploadDocumentVersion = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { changeNote } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file attached for version update' });
    }

    const doc = await Document.findById(documentId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const startup = await Startup.findById(doc.startup);
    if (req.user.role !== 'admin' && startup.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this document' });
    }

    const storageResult = await storageService.uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);

    const newVersionNum = doc.version + 1;
    doc.version = newVersionNum;
    doc.fileName = req.file.originalname;
    doc.originalFileName = req.file.originalname;
    doc.mimeType = req.file.mimetype;
    doc.fileSize = req.file.size;
    doc.storageKey = storageResult.storageKey;
    doc.versions = doc.versions || [];
    doc.versions.push({
      versionNumber: newVersionNum,
      fileUrl: storageResult.storageKey,
      uploadedBy: req.user._id,
      createdAt: new Date(),
    });
    await doc.save();

    await logDocumentAccess(doc._id, req.user._id, startup._id, 'VERSION_UPLOAD', req);

    res.status(200).json({
      success: true,
      message: `Document updated to Version ${newVersionNum}`,
      document: doc,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get document version audit history
 * @route   GET /api/documents/:documentId/versions
 * @access  Private (Authorized Users)
 */
const getDocumentVersions = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const doc = await Document.findById(documentId).lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    res.status(200).json({
      success: true,
      versions: doc.versions || [],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update document metadata & visibility
 * @route   PATCH /api/documents/:documentId
 * @access  Private (Founder Owner / Admin)
 */
const updateDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { title, description, category, visibility, status, isPrimary } = req.body;

    const doc = await Document.findById(documentId);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    const startup = await Startup.findById(doc.startup);
    if (req.user.role !== 'admin' && startup.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this document' });
    }

    if (title) doc.title = title.trim();
    if (description !== undefined) doc.description = description.trim();
    if (category && DOCUMENT_CATEGORIES.includes(category)) doc.category = category;
    if (visibility && DOCUMENT_VISIBILITY.includes(visibility)) doc.visibility = visibility;
    if (status && DOCUMENT_STATUSES.includes(status)) doc.status = status;

    if (isPrimary !== undefined) {
      const shouldPrimary = Boolean(isPrimary);
      doc.isPrimary = shouldPrimary;
      if (shouldPrimary && doc.category === 'Pitch Deck') {
        await Document.updateMany({ startup: doc.startup, category: 'Pitch Deck', _id: { $ne: doc._id } }, { isPrimary: false });
      }
    }

    await doc.save();
    await logDocumentAccess(doc._id, req.user._id, doc.startup, 'UPDATE', req);

    res.status(200).json({
      success: true,
      message: 'Document metadata updated successfully',
      document: doc,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete document & remove storage files
 * @route   DELETE /api/documents/:documentId
 * @access  Private (Founder Owner / Admin)
 */
const deleteDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const doc = await Document.findById(documentId);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    const startup = await Startup.findById(doc.startup);
    if (req.user.role !== 'admin' && startup.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this document' });
    }

    if (doc.storageKey) {
      await storageService.deleteFile(doc.storageKey);
    }

    if (Array.isArray(doc.versions)) {
      for (const ver of doc.versions) {
        if (ver.fileUrl && ver.fileUrl !== doc.storageKey) {
          await storageService.deleteFile(ver.fileUrl);
        }
      }
    }

    await Document.deleteOne({ _id: doc._id });

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocument,
  getDocumentsByStartup,
  downloadDocument,
  uploadDocumentVersion,
  getDocumentVersions,
  updateDocument,
  deleteDocument,
};
