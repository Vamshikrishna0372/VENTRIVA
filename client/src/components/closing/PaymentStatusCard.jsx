import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { ClosingStatusBadge } from './ClosingStatusBadge';
import { formatCurrency } from '../../utils/closingConstants';
import { DollarSign, CheckCircle2, ShieldCheck, CreditCard } from 'lucide-react';

export const PaymentStatusCard = ({
  payment,
  transaction,
  userRole = 'founder',
  onSubmitPayment,
  onVerifyPayment,
  className = '',
}) => {
  const [receivedAmount, setReceivedAmount] = useState(
    payment?.receivedAmount || transaction?.finalInvestmentAmount || 0
  );
  const [paymentMethod, setPaymentMethod] = useState(payment?.paymentMethod || 'Wire Transfer / Escrow');
  const [paymentReference, setPaymentReference] = useState(payment?.paymentReference || '');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  if (!transaction) return null;

  const status = payment?.paymentStatus || 'Pending';
  const isVerified = ['Verified', 'Received'].includes(status);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmitPayment) {
      onSubmitPayment({
        receivedAmount: Number(receivedAmount),
        paymentMethod,
        paymentReference,
      });
      setShowSubmitModal(false);
    }
  };

  return (
    <Card className={`p-5 space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <DollarSign className="w-5 h-5 text-emerald-400" />
          <h4 className="text-sm font-bold text-slate-100">Investment Payment & Wire Verification</h4>
        </div>
        <ClosingStatusBadge status={status} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/50">
        <div>
          <span className="text-slate-500">Expected Check</span>
          <p className="text-sm font-bold text-slate-100 mt-0.5">
            {formatCurrency(payment?.expectedAmount || transaction.finalInvestmentAmount)}
          </p>
        </div>

        <div>
          <span className="text-slate-500">Recorded Payment</span>
          <p className="text-sm font-bold text-emerald-400 mt-0.5">
            {formatCurrency(payment?.receivedAmount || 0)}
          </p>
        </div>

        <div>
          <span className="text-slate-500">Wire Ref Code</span>
          <p className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
            {payment?.paymentReference || 'Unrecorded'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/40">
        {userRole === 'investor' && !isVerified && (
          <Button size="sm" variant="emerald" onClick={() => setShowSubmitModal(true)} className="flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5" /> Submit Wire / Payment Reference
          </Button>
        )}

        {(userRole === 'founder' || userRole === 'admin') && status === 'Submitted' && onVerifyPayment && (
          <Button size="sm" variant="emerald" onClick={() => onVerifyPayment(payment._id)} className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Verify Receipt of Funds
          </Button>
        )}
      </div>

      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4">
            <h4 className="text-base font-bold text-slate-100">Record Wire Payment Details</h4>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Received / Transferred Amount ($)</label>
                <Input
                  type="number"
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Payment Method</label>
                <Input
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  placeholder="Wire Transfer, Escrow, ACH..."
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Wire / Reference Tracking Number</label>
                <Input
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="e.g. WT-984029482-XYZ"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <Button type="button" variant="ghost" onClick={() => setShowSubmitModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="emerald">
                  Submit Payment Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PaymentStatusCard;
