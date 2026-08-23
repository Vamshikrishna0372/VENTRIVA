const Shareholding = require('../models/Shareholding');
const CapTableSnapshot = require('../models/CapTableSnapshot');

/**
 * Cap Table Engine Service
 * Centralized, deterministic equity ownership math and cap table calculations.
 */
class CapTableEngineService {
  /**
   * Calculate transaction equity parameters (share price, shares issued, post-money, ownership %)
   */
  calculateTransactionEquity({
    preMoneyValuation,
    investmentAmount,
    existingTotalShares = 10000000, // Default 10M initial share pool if unconfigured
  }) {
    const preMoney = Number(preMoneyValuation) || 0;
    const investment = Number(investmentAmount) || 0;
    const totalSharesBefore = Number(existingTotalShares) || 10000000;

    if (preMoney < 0 || investment < 0 || totalSharesBefore <= 0) {
      throw new Error('Invalid financial inputs for cap table calculation');
    }

    const postMoneyValuation = preMoney + investment;
    const ownershipPercentage = postMoneyValuation > 0 ? Number(((investment / postMoneyValuation) * 100).toFixed(4)) : 0;
    const sharePrice = preMoney > 0 && totalSharesBefore > 0 ? Number((preMoney / totalSharesBefore).toFixed(6)) : 1.0;
    const sharesIssued = sharePrice > 0 ? Math.round(investment / sharePrice) : 0;
    const totalSharesAfter = totalSharesBefore + sharesIssued;

    return {
      preMoneyValuation: preMoney,
      investmentAmount: investment,
      postMoneyValuation,
      ownershipPercentage,
      sharePrice,
      sharesIssued,
      totalSharesBefore,
      totalSharesAfter,
    };
  }

  /**
   * Get active cap table breakdown for a startup
   */
  async getCapTable(startupId) {
    let holdings = await Shareholding.find({ startup: startupId, active: true }).lean();

    if (!holdings || holdings.length === 0) {
      // Return initial founder default zero-state cap table
      return {
        startupId,
        totalShares: 10000000,
        founderOwnership: 100,
        investorOwnership: 0,
        otherOwnership: 0,
        holdings: [
          {
            holderName: 'Founding Team Pool',
            holderType: 'Founder',
            shares: 10000000,
            ownershipPercentage: 100,
            shareClass: 'Common Stock',
          },
        ],
      };
    }

    const totalShares = holdings.reduce((sum, h) => sum + (h.shares || 0), 0);
    let founderShares = 0;
    let investorShares = 0;
    let otherShares = 0;

    holdings.forEach((h) => {
      if (h.holderType === 'Founder') founderShares += h.shares || 0;
      else if (h.holderType === 'Investor') investorShares += h.shares || 0;
      else otherShares += h.shares || 0;
    });

    const founderOwnership = totalShares > 0 ? Number(((founderShares / totalShares) * 100).toFixed(2)) : 0;
    const investorOwnership = totalShares > 0 ? Number(((investorShares / totalShares) * 100).toFixed(2)) : 0;
    const otherOwnership = totalShares > 0 ? Number(((otherShares / totalShares) * 100).toFixed(2)) : 0;

    return {
      startupId,
      totalShares,
      founderOwnership,
      investorOwnership,
      otherOwnership,
      holdings,
    };
  }

  /**
   * Create immutable Cap Table Snapshot upon closing
   */
  async createSnapshot({ startupId, transactionId, createdById, preMoneyValuation, investmentAmount }) {
    const currentCapTable = await this.getCapTable(startupId);
    const equityCalc = this.calculateTransactionEquity({
      preMoneyValuation,
      investmentAmount,
      existingTotalShares: currentCapTable.totalShares,
    });

    const snapshot = await CapTableSnapshot.create({
      startup: startupId,
      transaction: transactionId,
      snapshotDate: new Date(),
      preTransactionOwnership: currentCapTable.holdings.map((h) => ({
        holderName: h.holderName,
        holderType: h.holderType,
        shares: h.shares,
        ownershipPercentage: h.ownershipPercentage,
      })),
      postTransactionOwnership: currentCapTable.holdings.map((h) => ({
        holderName: h.holderName,
        holderType: h.holderType,
        shares: h.shares,
        ownershipPercentage: Number(((h.shares / equityCalc.totalSharesAfter) * 100).toFixed(2)),
      })),
      totalSharesBefore: equityCalc.totalSharesBefore,
      totalSharesAfter: equityCalc.totalSharesAfter,
      investorOwnership: currentCapTable.investorOwnership,
      founderOwnership: currentCapTable.founderOwnership,
      otherOwnership: currentCapTable.otherOwnership,
      valuation: equityCalc.postMoneyValuation,
      sharePrice: equityCalc.sharePrice,
      createdBy: createdById,
    });

    return snapshot;
  }
}

module.exports = new CapTableEngineService();
