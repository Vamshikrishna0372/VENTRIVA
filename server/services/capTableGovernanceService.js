const Shareholder = require('../models/Shareholder');
const Shareholding = require('../models/Shareholding');
const ShareTransfer = require('../models/ShareTransfer');
const EquityPool = require('../models/EquityPool');
const CorporateAction = require('../models/CorporateAction');
const OwnershipEvent = require('../models/OwnershipEvent');
const capTableEngineService = require('./capTableEngineService');
const governanceService = require('./governanceService');

class CapTableGovernanceService {
  /**
   * Execute secondary Share Transfer workflow
   */
  async executeShareTransfer(transferId, actorId) {
    const transfer = await ShareTransfer.findById(transferId);
    if (!transfer) throw new Error('Share transfer not found');

    if (transfer.status === 'Completed') return transfer;
    if (['Rejected', 'Cancelled'].includes(transfer.status)) {
      throw new Error(`Cannot execute share transfer in '${transfer.status}' status`);
    }

    const seller = await Shareholder.findById(transfer.fromShareholder);
    if (!seller || seller.sharesOwned < transfer.shares) {
      throw new Error('Seller does not own sufficient shares to execute transfer');
    }

    // Deduct shares from seller
    seller.sharesOwned -= transfer.shares;
    if (seller.sharesOwned === 0) seller.status = 'Transferred';
    await seller.save();

    // Add shares to buyer
    let buyer = await Shareholder.findOne({ startup: transfer.startup, holderName: transfer.buyerName });
    if (!buyer) {
      buyer = await Shareholder.create({
        startup: transfer.startup,
        user: transfer.buyerUser || null,
        holderName: transfer.buyerName,
        holderType: 'Investor',
        shareClass: transfer.shareClass,
        sharesOwned: transfer.shares,
        ownershipPercentage: 0,
        acquisitionDate: new Date(),
        status: 'Active',
      });
    } else {
      buyer.sharesOwned += transfer.shares;
      buyer.status = 'Active';
      await buyer.save();
    }

    // Synchronize Shareholding & Cap Table Percentages
    await this.rebalanceCapTable(transfer.startup);

    transfer.status = 'Completed';
    transfer.completedDate = new Date();
    await transfer.save();

    // Create Phase 15 OwnershipEvent
    await OwnershipEvent.create({
      startup: transfer.startup,
      investor: transfer.buyerUser || actorId,
      eventType: 'Secondary Purchase',
      eventDate: new Date(),
      sharesAcquired: transfer.shares,
      pricePerShare: transfer.pricePerShare,
      totalAmount: transfer.totalValue,
      resultingOwnershipPercentage: buyer.ownershipPercentage,
      notes: `Secondary transfer executed from ${seller.holderName} to ${buyer.holderName}`,
    });

    // Create Phase 18 CapTableSnapshot
    await capTableEngineService.createSnapshot({
      startupId: transfer.startup,
      transactionId: null,
      createdById: actorId,
      preMoneyValuation: 10000000,
      investmentAmount: transfer.totalValue,
    });

    // Audit log
    await governanceService.recordActivity({
      startupId: transfer.startup,
      actorId,
      eventType: 'SHARE_TRANSFER_COMPLETED',
      entityType: 'ShareTransfer',
      entityId: transfer._id,
      description: `Executed secondary share transfer of ${transfer.shares.toLocaleString()} shares from ${seller.holderName} to ${buyer.holderName}`,
    });

    return transfer;
  }

  /**
   * Rebalance active shareholding & shareholder equity percentages
   */
  async rebalanceCapTable(startupId) {
    const shareholders = await Shareholder.find({ startup: startupId, status: 'Active' });
    const totalShares = shareholders.reduce((sum, s) => sum + (s.sharesOwned || 0), 0);

    if (totalShares <= 0) return;

    for (const s of shareholders) {
      const pct = Number(((s.sharesOwned / totalShares) * 100).toFixed(2));
      s.ownershipPercentage = pct;
      s.votingPercentage = s.votingRights ? pct : 0;
      await s.save();

      // Update active Shareholding
      await Shareholding.findOneAndUpdate(
        { startup: startupId, holderName: s.holderName },
        {
          startup: startupId,
          holder: s.user || null,
          holderName: s.holderName,
          holderType: s.holderType,
          shares: s.sharesOwned,
          ownershipPercentage: pct,
          shareClass: s.shareClass,
          active: true,
        },
        { upsert: true }
      );
    }
  }
}

module.exports = new CapTableGovernanceService();
