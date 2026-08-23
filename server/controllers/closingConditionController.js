const ClosingCondition = require('../models/ClosingCondition');
const ClosingTransaction = require('../models/ClosingTransaction');
const closingTransactionService = require('../services/closingTransactionService');

exports.addCondition = async (req, res, next) => {
  try {
    const { title, description, category, required, responsibleParty, dueDate } = req.body;
    const transaction = await ClosingTransaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });

    if (
      req.user.role !== 'admin' &&
      transaction.founder.toString() !== req.user._id.toString() &&
      transaction.investor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const condition = await ClosingCondition.create({
      transaction: transaction._id,
      title,
      description: description || '',
      category: category || 'Legal',
      required: required !== undefined ? required : true,
      responsibleParty: responsibleParty || 'Mutual',
      dueDate: dueDate ? new Date(dueDate) : null,
      status: 'Pending',
    });

    res.status(201).json({ success: true, data: condition });
  } catch (error) {
    next(error);
  }
};

exports.updateConditionStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const condition = await ClosingCondition.findById(req.params.conditionId);
    if (!condition) return res.status(404).json({ success: false, message: 'Condition not found' });

    const transaction = await ClosingTransaction.findById(condition.transaction);

    if (
      req.user.role !== 'admin' &&
      transaction.founder.toString() !== req.user._id.toString() &&
      transaction.investor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    condition.status = status;
    if (notes !== undefined) condition.notes = notes;

    if (['Completed', 'Waived'].includes(status)) {
      condition.completedAt = new Date();
      condition.completedBy = req.user._id;
    }

    await condition.save();

    await closingTransactionService.recordActivity({
      transactionId: transaction._id,
      startupId: transaction.startup,
      actorId: req.user._id,
      action: 'CONDITION_UPDATED',
      description: `Condition '${condition.title}' status updated to ${status}`,
    });

    res.status(200).json({ success: true, data: condition });
  } catch (error) {
    next(error);
  }
};
