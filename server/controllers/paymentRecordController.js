const PaymentRecord = require('../models/PaymentRecord');
const ClosingTransaction = require('../models/ClosingTransaction');
const closingTransactionService = require('../services/closingTransactionService');

exports.submitPayment = async (req, res, next) => {
  try {
    const { receivedAmount, paymentMethod, paymentReference, notes } = req.body;
    const transaction = await ClosingTransaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });

    if (req.user.role !== 'admin' && transaction.investor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the investor or admin can submit payment details' });
    }

    const amount = Number(receivedAmount || transaction.finalInvestmentAmount);

    const payment = await PaymentRecord.findOneAndUpdate(
      { transaction: transaction._id },
      {
        transaction: transaction._id,
        investor: transaction.investor,
        expectedAmount: transaction.finalInvestmentAmount,
        receivedAmount: amount,
        paymentMethod: paymentMethod || 'Wire Transfer / Escrow',
        paymentReference: paymentReference || `WIRE-${Date.now()}`,
        paymentStatus: 'Submitted',
        receivedAt: new Date(),
        notes: notes || '',
      },
      { upsert: true, new: true }
    );

    transaction.paymentStatus = 'Submitted';
    await transaction.save();

    await closingTransactionService.recordActivity({
      transactionId: transaction._id,
      startupId: transaction.startup,
      actorId: req.user._id,
      action: 'PAYMENT_SUBMITTED',
      description: `Investor submitted payment details of $${amount.toLocaleString()} (Ref: ${payment.paymentReference})`,
    });

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const payment = await PaymentRecord.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });

    const transaction = await ClosingTransaction.findById(payment.transaction);

    if (req.user.role !== 'admin' && transaction.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the founder or admin can verify received payments' });
    }

    payment.paymentStatus = 'Verified';
    payment.verifiedAt = new Date();
    payment.verifiedBy = req.user._id;
    await payment.save();

    transaction.paymentStatus = 'Verified';
    await transaction.save();

    await closingTransactionService.recordActivity({
      transactionId: transaction._id,
      startupId: transaction.startup,
      actorId: req.user._id,
      action: 'PAYMENT_VERIFIED',
      description: `Founder verified receipt of $${payment.receivedAmount.toLocaleString()} investment payment`,
    });

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};
