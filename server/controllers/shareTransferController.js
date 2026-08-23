const ShareTransfer = require('../models/ShareTransfer');
const Shareholder = require('../models/Shareholder');
const Startup = require('../models/Startup');
const capTableGovernanceService = require('../services/capTableGovernanceService');

exports.getTransfers = async (req, res, next) => {
  try {
    const { startupId } = req.query;
    const filter = {};

    if (startupId) filter.startup = startupId;
    if (req.user.role === 'founder') {
      const startup = await Startup.findOne({ founder: req.user._id });
      if (startup) filter.startup = startup._id;
    }

    const transfers = await ShareTransfer.find(filter)
      .populate('fromShareholder', 'holderName sharesOwned ownershipPercentage')
      .populate('toShareholder', 'holderName ownershipPercentage')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, count: transfers.length, data: transfers });
  } catch (error) {
    next(error);
  }
};

exports.proposeTransfer = async (req, res, next) => {
  try {
    const { startupId, fromShareholderId, fromShareholder, buyerName, buyerUser, shares, pricePerShare, reason } = req.body;
    const seller = await Shareholder.findById(fromShareholderId || fromShareholder);
    if (!seller) return res.status(404).json({ success: false, message: 'Transferor shareholder not found' });

    const shareCount = Number(shares);
    const pps = Number(pricePerShare);

    if (shareCount <= 0 || pps < 0) {
      return res.status(400).json({ success: false, message: 'Invalid share count or price per share' });
    }

    if (seller.sharesOwned < shareCount) {
      return res.status(400).json({ success: false, message: `Seller only owns ${seller.sharesOwned.toLocaleString()} shares` });
    }

    const transfer = await ShareTransfer.create({
      startup: startupId || seller.startup,
      fromShareholder: seller._id,
      buyerName,
      buyerUser: buyerUser || null,
      shareClass: seller.shareClass,
      shares: shareCount,
      pricePerShare: pps,
      totalValue: shareCount * pps,
      reason: reason || 'Secondary Transfer',
      status: 'Proposed',
    });

    res.status(201).json({ success: true, data: transfer });
  } catch (error) {
    next(error);
  }
};

exports.executeTransfer = async (req, res, next) => {
  try {
    const transfer = await capTableGovernanceService.executeShareTransfer(req.params.id, req.user._id);
    res.status(200).json({ success: true, data: transfer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
