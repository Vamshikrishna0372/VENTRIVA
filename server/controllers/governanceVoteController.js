const votingService = require('../services/votingService');

exports.castVote = async (req, res, next) => {
  try {
    const { resolutionId } = req.params;
    const { vote, comment } = req.body;

    if (!['For', 'Against', 'Abstain'].includes(vote)) {
      return res.status(400).json({ success: false, message: 'Invalid vote value. Must be For, Against, or Abstain' });
    }

    const recordedVote = await votingService.castVote({
      resolutionId,
      voterId: req.user._id,
      voteValue: vote,
      comment: comment || '',
    });

    res.status(200).json({ success: true, data: recordedVote });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
