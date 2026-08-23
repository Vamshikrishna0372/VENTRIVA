import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { INVESTOR_ROLES } from '../../utils/fundraisingConstants';
import { X, DollarSign, ShieldAlert, Award } from 'lucide-react';

export const CommitmentModal = ({
  isOpen,
  onClose,
  onSubmit,
  round,
  existingCommitment = null,
  isSubmitting = false,
}) => {
  if (!isOpen || !round) return null;

  const [committedAmount, setCommittedAmount] = useState(
    existingCommitment?.committedAmount || existingCommitment?.requestedAmount || round.minimumTicketSize || 25000
  );
  const [investorRole, setInvestorRole] = useState(existingCommitment?.investorRole || 'Participant');
  const [proposedOwnership, setProposedOwnership] = useState(existingCommitment?.proposedOwnership || 0);
  const [proposedValuation, setProposedValuation] = useState(existingCommitment?.proposedValuation || round.preMoneyValuation || 0);
  const [message, setMessage] = useState(existingCommitment?.message || '');
  const [notes, setNotes] = useState(existingCommitment?.notes || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const amountNum = Number(committedAmount);

    if (amountNum <= 0) {
      setError('Commitment amount must be greater than zero.');
      return;
    }
    if (round.minimumTicketSize > 0 && amountNum < round.minimumTicketSize) {
      setError(`Commitment amount must be at least $${round.minimumTicketSize.toLocaleString()}`);
      return;
    }
    if (round.maximumTicketSize > 0 && amountNum > round.maximumTicketSize) {
      setError(`Commitment amount cannot exceed maximum ticket size of $${round.maximumTicketSize.toLocaleString()}`);
      return;
    }

    onSubmit({
      committedAmount: amountNum,
      requestedAmount: amountNum,
      investorRole,
      proposedOwnership: Number(proposedOwnership),
      proposedValuation: Number(proposedValuation),
      message,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h3 className="text-lg font-bold text-slate-100">
            {existingCommitment ? 'Update Investment Commitment' : 'Submit Investment Commitment'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Round: <span className="text-slate-200 font-semibold">{round.roundName}</span> ({round.roundType})
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Commitment Check Size ($) <span className="text-rose-400">*</span>
            </label>
            <Input
              type="number"
              value={committedAmount}
              onChange={(e) => setCommittedAmount(e.target.value)}
              placeholder="e.g. 100000"
              required
              min={1}
            />
            {round.minimumTicketSize > 0 && (
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Min Ticket: ${round.minimumTicketSize.toLocaleString()}
                {round.maximumTicketSize > 0 && ` • Max Ticket: $${round.maximumTicketSize.toLocaleString()}`}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Investor Role</label>
              <Select value={investorRole} onChange={(e) => setInvestorRole(e.target.value)}>
                {INVESTOR_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Proposed Ownership (%)</label>
              <Input
                type="number"
                step="0.1"
                value={proposedOwnership}
                onChange={(e) => setProposedOwnership(e.target.value)}
                placeholder="e.g. 5"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Target Pre-Money Valuation ($)</label>
            <Input
              type="number"
              value={proposedValuation}
              onChange={(e) => setProposedValuation(e.target.value)}
              placeholder="e.g. 5000000"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Message for Founder</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add investment terms note or message to founder..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Private Investor Note (Only viewable by you)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal investment rationale, due diligence notes..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="brand" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : existingCommitment ? 'Update Commitment' : 'Submit Commitment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommitmentModal;
