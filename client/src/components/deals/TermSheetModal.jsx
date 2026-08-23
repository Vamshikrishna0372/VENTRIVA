import React, { useState } from 'react';
import { FileText, X, AlertCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';

export const TermSheetModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    investmentAmount: 500000,
    preMoneyValuation: 3500000,
    liquidationPreference: '1x Non-Participating',
    boardSeats: 1,
    votingRights: 'Standard Major Investor Voting Rights',
    expiryDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
    notes: '',
  });

  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.investmentAmount <= 0) {
      setError('Investment amount must be greater than zero');
      return;
    }
    if (formData.preMoneyValuation <= 0) {
      setError('Pre-money valuation must be greater than zero');
      return;
    }
    setError('');
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <Card className="max-w-xl w-full bg-slate-900 border-slate-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-400" />
            <h3 className="font-bold text-slate-100 text-base">Propose Investment Term Sheet</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Investment Amount ($)"
              type="number"
              value={formData.investmentAmount}
              onChange={(e) => setFormData({ ...formData, investmentAmount: Number(e.target.value) })}
              required
            />

            <Input
              label="Pre-Money Valuation ($)"
              type="number"
              value={formData.preMoneyValuation}
              onChange={(e) => setFormData({ ...formData, preMoneyValuation: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Liquidation Preference"
              value={formData.liquidationPreference}
              onChange={(e) => setFormData({ ...formData, liquidationPreference: e.target.value })}
              options={[
                { value: '1x Non-Participating', label: '1x Non-Participating (Standard)' },
                { value: '1x Participating', label: '1x Participating' },
                { value: '2x Non-Participating', label: '2x Non-Participating' },
              ]}
            />

            <Input
              label="Board Seats Offered"
              type="number"
              min="0"
              value={formData.boardSeats}
              onChange={(e) => setFormData({ ...formData, boardSeats: Number(e.target.value) })}
            />
          </div>

          <Input
            label="Offer Expiry Date"
            type="date"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Proposer Notes & Key Conditions</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add key terms, closing conditions, or negotiation context..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Submit Term Sheet Proposal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default TermSheetModal;
