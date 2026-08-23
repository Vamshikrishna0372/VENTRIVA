const Notification = require('../models/Notification');
const BoardMember = require('../models/BoardMember');

class GovernanceNotificationService {
  /**
   * Dispatch notification to all active board members
   */
  async notifyBoardMembers({ startupId, title, message, relatedEntityType, relatedEntityId }) {
    try {
      const boardMembers = await BoardMember.find({ startup: startupId, status: 'Active' });
      for (const member of boardMembers) {
        await Notification.create({
          user: member.user,
          type: 'System',
          title,
          message,
          relatedEntityType: relatedEntityType || 'BoardMeeting',
          relatedEntityId: relatedEntityId || null,
        });
      }
    } catch (err) {
      console.error('Failed to notify board members:', err.message);
    }
  }
}

module.exports = new GovernanceNotificationService();
