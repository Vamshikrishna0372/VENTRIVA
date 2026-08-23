import React, { useState } from 'react';
import { FileText, X, AlertCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';

export const PortfolioUpdateModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    reportingPeriod: 'Q3 2026',
    annualRecurringRevenue: 1200000,
    monthlyRecurringRevenue: 100000,
    revenueGrowth: 15,
    burnRate: 35000,
    runwayMonths: 14,
    cashBalance: 490000,
    customerCount: 120,
    keyWins: 'Closed enterprise contract with Fortune 500 partner.',
    keyChallenges: 'Hiring senior backend engineers.',
    founderNotes: 'On track for Series A fundraising next quarter.',
    outlook: 'Optimistic',
  });

  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.reportingPeriod.trim()) {
      setError('Reporting period is required');
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
            <h3 className="font-bold text-slate-100 text-base">Submit Founder Portfolio Update</h3>
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
              label="Reporting Period"
              type="text"
              placeholder="e.g. Q3 2026 or Aug 2026"
              value={formData.reportingPeriod}
              onChange={(e) => setFormData({ ...formData, reportingPeriod: e.target.value })}
              required
            />

            <Select
              label="Company Outlook"
              value={formData.outlook}
              onChange={(e) => setFormData({ ...formData, outlook: e.target.value })}
              options={[
                { value: 'Optimistic', label: 'Optimistic' },
                { value: 'Stable', label: 'Stable' },
                { value: 'Cautious', label: 'Cautious' },
                { value: 'Challenged', label: 'Challenged' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="ARR ($)"
              type="number"
              min="0"
              value={formData.annualRecurringRevenue}
              onChange={(e) => setFormData({ ...formData, annualRecurringRevenue: Number(e.target.value) })}
            />
            <Input
              label="Monthly Burn ($)"
              type="number"
              min="0"
              value={formData.burnRate}
              onChange={(e) => setFormData({ ...formData, burnRate: Number(e.target.value) })}
            />
            <Input
              label="Runway (Months)"
              type="number"
              min="0"
              value={formData.runwayMonths}
              onChange={(e) => setFormData({ ...formData, runwayMonths: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Key Wins & Highlights</label>
            <textarea
              rows={2}
              value={formData.keyWins}
              onChange={(e) => setFormData({ ...formData, keyWins: e.target.value })}
              placeholder="Share major contracts, product launches, or key hires..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Key Challenges & Asks for Investor</label>
            <textarea
              rows={2}
              value={formData.keyChallenges}
              onChange={(e) => setFormData({ ...formData, keyChallenges: e.target.value })}
              placeholder="Detail roadblocks or areas where investor help is needed..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Submit Progress Update
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PortfolioUpdateModal;
