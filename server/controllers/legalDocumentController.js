const LegalDocument = require('../models/LegalDocument');
const SignatureRecord = require('../models/SignatureRecord');
const ClosingTransaction = require('../models/ClosingTransaction');
const closingTransactionService = require('../services/closingTransactionService');

exports.addDocument = async (req, res, next) => {
  try {
    const { documentType, documentName, documentReference, documentUrl, required } = req.body;
    const transaction = await ClosingTransaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });

    if (
      req.user.role !== 'admin' &&
      transaction.founder.toString() !== req.user._id.toString() &&
      transaction.investor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const doc = await LegalDocument.create({
      transaction: transaction._id,
      documentType,
      documentName,
      documentReference: documentReference || null,
      documentUrl: documentUrl || '',
      uploadedBy: req.user._id,
      required: required !== undefined ? required : true,
      status: 'Uploaded',
    });

    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

exports.updateDocumentStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const doc = await LegalDocument.findById(req.params.docId);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    const transaction = await ClosingTransaction.findById(doc.transaction);

    if (
      req.user.role !== 'admin' &&
      transaction.founder.toString() !== req.user._id.toString() &&
      transaction.investor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    doc.status = status;
    if (notes) doc.notes = notes;
    await doc.save();

    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

exports.signDocument = async (req, res, next) => {
  try {
    const doc = await LegalDocument.findById(req.params.docId);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    const transaction = await ClosingTransaction.findById(doc.transaction);

    // Strict role check: Founder can only sign as Founder; Investor can only sign as Investor
    let signerRole = '';
    if (transaction.founder.toString() === req.user._id.toString()) {
      signerRole = 'Founder';
    } else if (transaction.investor.toString() === req.user._id.toString()) {
      signerRole = 'Investor';
    } else if (req.user.role === 'admin') {
      signerRole = req.body.signerRole || 'Company Officer';
    } else {
      return res.status(403).json({ success: false, message: 'You are not an authorized participant to sign this document' });
    }

    const existingSig = await SignatureRecord.findOne({ document: doc._id, signer: req.user._id });
    if (existingSig && existingSig.status === 'Signed') {
      return res.status(400).json({ success: false, message: 'You have already signed this document' });
    }

    const signatureRef = `SIG-${req.user._id.toString().substring(0, 6)}-${Date.now()}`;

    const signature = await SignatureRecord.findOneAndUpdate(
      { document: doc._id, signer: req.user._id },
      {
        transaction: transaction._id,
        document: doc._id,
        signer: req.user._id,
        signerRole,
        status: 'Signed',
        signedAt: new Date(),
        signatureReference: signatureRef,
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Platform App',
      },
      { upsert: true, new: true }
    );

    if (signerRole === 'Founder') doc.signedByFounder = true;
    if (signerRole === 'Investor') doc.signedByInvestor = true;

    if (doc.signedByFounder && doc.signedByInvestor) {
      doc.signed = true;
      doc.signedAt = new Date();
      doc.status = 'Signed';
    }
    await doc.save();

    await closingTransactionService.recordActivity({
      transactionId: transaction._id,
      startupId: transaction.startup,
      actorId: req.user._id,
      action: 'DOCUMENT_SIGNED',
      description: `${signerRole} signed document '${doc.documentName}' (Ref: ${signatureRef})`,
    });

    res.status(200).json({
      success: true,
      data: {
        document: doc,
        signature,
      },
    });
  } catch (error) {
    next(error);
  }
};
