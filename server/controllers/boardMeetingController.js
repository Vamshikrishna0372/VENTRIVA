const BoardMeeting = require('../models/BoardMeeting');
const Startup = require('../models/Startup');
const governanceService = require('../services/governanceService');
const governanceNotificationService = require('../services/governanceNotificationService');

exports.getMeetings = async (req, res, next) => {
  try {
    const { startupId } = req.query;
    const filter = {};

    if (startupId) filter.startup = startupId;
    if (req.user.role === 'founder') {
      const startup = await Startup.findOne({ founder: req.user._id });
      if (startup) filter.startup = startup._id;
    }

    const meetings = await BoardMeeting.find(filter)
      .populate('createdBy', 'name email')
      .populate('participants.user', 'name email profileImage')
      .sort({ scheduledDate: -1 })
      .lean();

    res.status(200).json({ success: true, count: meetings.length, data: meetings });
  } catch (error) {
    next(error);
  }
};

exports.scheduleMeeting = async (req, res, next) => {
  try {
    const { startupId, title, meetingType, scheduledDate, startTime, endTime, location, meetingLink, agenda, participants } = req.body;
    const startup = await Startup.findById(startupId);
    if (!startup) return res.status(404).json({ success: false, message: 'Startup not found' });

    if (req.user.role !== 'admin' && startup.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only founders or admins can schedule board meetings' });
    }

    const meeting = await BoardMeeting.create({
      startup: startup._id,
      title,
      meetingType: meetingType || 'Regular',
      scheduledDate: new Date(scheduledDate),
      startTime: startTime || '10:00 AM',
      endTime: endTime || '11:30 AM',
      location: location || 'Virtual Video Conference',
      meetingLink: meetingLink || '',
      agenda: agenda || [{ itemNumber: 1, title: 'Quarterly Strategic Update & Financial Review', allocatedMinutes: 30 }],
      participants: participants || [],
      createdBy: req.user._id,
      status: 'Scheduled',
    });

    await governanceService.recordActivity({
      startupId: startup._id,
      actorId: req.user._id,
      eventType: 'MEETING_SCHEDULED',
      entityType: 'BoardMeeting',
      entityId: meeting._id,
      description: `Scheduled ${meeting.meetingType} Board Meeting: '${meeting.title}' for ${new Date(meeting.scheduledDate).toLocaleDateString()}`,
    });

    await governanceNotificationService.notifyBoardMembers({
      startupId: startup._id,
      title: 'New Board Meeting Scheduled',
      message: `Board meeting '${meeting.title}' scheduled for ${new Date(meeting.scheduledDate).toLocaleDateString()}`,
      relatedEntityType: 'BoardMeeting',
      relatedEntityId: meeting._id,
    });

    res.status(201).json({ success: true, data: meeting });
  } catch (error) {
    next(error);
  }
};

exports.updateMeetingStatus = async (req, res, next) => {
  try {
    const { status, minutes } = req.body;
    const meeting = await BoardMeeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });

    meeting.status = status;
    if (minutes) meeting.minutes = minutes;
    await meeting.save();

    if (status === 'Completed') {
      await governanceService.recordActivity({
        startupId: meeting.startup,
        actorId: req.user._id,
        eventType: 'MEETING_COMPLETED',
        entityType: 'BoardMeeting',
        entityId: meeting._id,
        description: `Board meeting '${meeting.title}' completed`,
      });
    }

    res.status(200).json({ success: true, data: meeting });
  } catch (error) {
    next(error);
  }
};
