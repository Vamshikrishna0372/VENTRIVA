const BoardMember = require('../models/BoardMember');
const GovernanceRight = require('../models/GovernanceRight');
const Shareholder = require('../models/Shareholder');
const ActivityLog = require('../models/ActivityLog');

class GovernanceService {
  /**
   * Get active board composition for a startup
   */
  async getBoardComposition(startupId) {
    const members = await BoardMember.find({ startup: startupId, status: 'Active' })
      .populate('user', 'name email avatar organization')
      .populate('shareholder', 'holderName ownershipPercentage')
      .lean();

    const founderDirectors = members.filter((m) => m.role === 'Founder Director');
    const investorDirectors = members.filter((m) => m.role === 'Investor Director');
    const independentDirectors = members.filter((m) => m.role === 'Independent Director');
    const observers = members.filter((m) => m.role === 'Observer');

    return {
      startupId,
      totalSeats: members.length,
      founderSeats: founderDirectors.length,
      investorSeats: investorDirectors.length,
      independentSeats: independentDirectors.length,
      observerSeats: observers.length,
      members,
    };
  }

  /**
   * Log immutable governance activity audit record
   */
  async recordActivity({ startupId, actorId, eventType, entityType, entityId, description, metadata = {} }) {
    try {
      await ActivityLog.create({
        activityType: 'governance',
        startup: startupId,
        actor: actorId,
        action: eventType,
        description,
        metadata: { ...metadata, entityType, entityId },
      });
    } catch (err) {
      console.error('Failed to log governance activity:', err.message);
    }
  }
}

module.exports = new GovernanceService();
