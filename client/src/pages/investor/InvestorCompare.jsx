import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SlidersHorizontal, CheckCircle2, Bookmark, Plus, X, Loader2, Building2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

import { getShortlist } from '../../services/shortlistService';
import { compareStartups } from '../../services/evaluationService';
import { CATEGORIES } from '../../utils/evaluationConstants';

export const InvestorCompare = () => {
  const [shortlisted, setShortlisted] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [isLoadingShortlist, setIsLoadingShortlist] = useState(true);
  const [isLoadingCompare, setIsLoadingCompare] = useState(false);

  useEffect(() => {
    fetchShortlistOptions();
  }, []);

  useEffect(() => {
    if (selectedIds.length > 0) {
      fetchComparison();
    } else {
      setComparisonData([]);
    }
  }, [selectedIds]);

  const fetchShortlistOptions = async () => {
    setIsLoadingShortlist(true);
    try {
      const res = await getShortlist();
      if (res?.success && Array.isArray(res.shortlists)) {
        const valid = res.shortlists.filter((s) => s.startup !== null);
        setShortlisted(valid);
        // Pre-select up to first 3 startups automatically
        const initial = valid.slice(0, 3).map((item) => item.startup._id);
        setSelectedIds(initial);
      }
    } catch (err) {
      console.error('Error fetching shortlist:', err);
    } finally {
      setIsLoadingShortlist(false);
    }
  };

  const fetchComparison = async () => {
    setIsLoadingCompare(true);
    try {
      const res = await compareStartups(selectedIds);
      if (res?.success && Array.isArray(res.comparisons)) {
        setComparisonData(res.comparisons);
      }
    } catch (err) {
      console.error('Error fetching comparison:', err);
    } finally {
      setIsLoadingCompare(false);
    }
  };

  const handleToggleSelect = (startupId) => {
    if (selectedIds.includes(startupId)) {
      setSelectedIds((prev) => prev.filter((id) => id !== startupId));
    } else {
      if (selectedIds.length >= 3) {
        alert('You can select a maximum of 3 startups for side-by-side comparison.');
        return;
      }
      setSelectedIds((prev) => [...prev, startupId]);
    }
  };

  if (isLoadingShortlist) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Shortlisted Ventures...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Venture Comparison Matrix</h1>
            <p className="text-sm text-slate-400">Side-by-side evaluation of up to 3 shortlisted venture opportunities.</p>
          </div>

          <Badge variant="brand">{selectedIds.length} / 3 Selected</Badge>
        </div>

        {/* Shortlist Selector Pills */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-xs font-mono text-slate-400 uppercase block">Select Shortlisted Startups (Max 3):</span>
          <div className="flex flex-wrap gap-2">
            {shortlisted.length === 0 ? (
              <span className="text-xs text-slate-400 italic">No shortlisted startups available. Save startups to your shortlist first.</span>
            ) : (
              shortlisted.map((item) => {
                const isSelected = selectedIds.includes(item.startup._id);
                return (
                  <button
                    key={item.startup._id}
                    type="button"
                    onClick={() => handleToggleSelect(item.startup._id)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-brand-500/20 border-brand-500/50 text-brand-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />}
                    <span>{item.startup.startupName}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Comparison Table Grid */}
      {selectedIds.length === 0 ? (
        <Card className="text-center py-16 px-4 space-y-4">
          <Building2 className="w-12 h-12 text-slate-500 mx-auto" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-100">No Ventures Selected for Comparison</h3>
            <p className="text-xs text-slate-400">Select 1 to 3 shortlisted startups from the pills above to generate a side-by-side matrix.</p>
          </div>
        </Card>
      ) : isLoadingCompare ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Building Comparison Matrix...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80">
                <th className="p-4 font-mono uppercase text-slate-400 w-1/4">Metric / Dimension</th>
                {comparisonData.map((item) => (
                  <th key={item.startup._id} className="p-4 font-bold text-slate-100 text-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-extrabold text-brand-300 text-base">{item.startup.startupName}</div>
                        <div className="text-xs text-slate-400 font-mono font-normal mt-0.5">{item.startup.stage} • {item.startup.sector}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(item.startup._id)}
                        className="text-slate-500 hover:text-slate-300 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {/* Category 1: Overview */}
              <tr className="bg-slate-950/30 font-bold text-slate-200">
                <td colSpan={comparisonData.length + 1} className="p-3 uppercase font-mono text-[10px] text-slate-400">
                  Business Overview & Taxonomy
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-400">Tagline</td>
                {comparisonData.map((item) => (
                  <td key={item.startup._id} className="p-4 italic">{item.startup.tagline || '—'}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-400">Business Model</td>
                {comparisonData.map((item) => (
                  <td key={item.startup._id} className="p-4 font-medium">{item.startup.businessModel}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-400">Headquarters</td>
                {comparisonData.map((item) => (
                  <td key={item.startup._id} className="p-4">{item.startup.locationDisplay || '—'}</td>
                ))}
              </tr>

              {/* Category 2: Financials & Traction */}
              <tr className="bg-slate-950/30 font-bold text-slate-200">
                <td colSpan={comparisonData.length + 1} className="p-3 uppercase font-mono text-[10px] text-slate-400">
                  Traction & Fundraising Terms
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-400">Target Funding Required</td>
                {comparisonData.map((item) => (
                  <td key={item.startup._id} className="p-4 font-bold text-emerald-400">
                    {item.startup.fundingRequired > 0
                      ? `${item.startup.fundingCurrency || 'USD'} $${item.startup.fundingRequired.toLocaleString()}`
                      : 'Undisclosed'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-400">Monthly Revenue (MRR)</td>
                {comparisonData.map((item) => (
                  <td key={item.startup._id} className="p-4">
                    {item.startup.monthlyRevenue > 0 ? `$${item.startup.monthlyRevenue.toLocaleString()}` : 'Pre-Revenue'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-400">MoM Growth Rate</td>
                {comparisonData.map((item) => (
                  <td key={item.startup._id} className="p-4 font-bold text-brand-300">
                    {item.startup.revenueGrowth > 0 ? `+${item.startup.revenueGrowth}%` : '—'}
                  </td>
                ))}
              </tr>

              {/* Category 3: Private Investor Evaluation Scores */}
              <tr className="bg-slate-950/30 font-bold text-slate-200">
                <td colSpan={comparisonData.length + 1} className="p-3 uppercase font-mono text-[10px] text-slate-400">
                  Your Private Evaluation Scores (1-10 Scale)
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-400">Overall Weighted Score</td>
                {comparisonData.map((item) => {
                  const ev = item.evaluation;
                  return (
                    <td key={item.startup._id} className="p-4 font-extrabold text-sm text-slate-100">
                      {ev ? `${ev.overallScore.toFixed(1)} / 10` : <span className="text-slate-500 font-normal italic">Not Evaluated</span>}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-400">Investment Decision</td>
                {comparisonData.map((item) => {
                  const ev = item.evaluation;
                  return (
                    <td key={item.startup._id} className="p-4">
                      {ev ? <Badge variant="brand">{ev.investmentDecision}</Badge> : '—'}
                    </td>
                  );
                })}
              </tr>

              {CATEGORIES.map((cat) => (
                <tr key={cat.id}>
                  <td className="p-4 font-medium text-slate-400">{cat.name}</td>
                  {comparisonData.map((item) => {
                    const score = item.evaluation?.scores?.[cat.id];
                    return (
                      <td key={item.startup._id} className="p-4 font-mono font-bold">
                        {score ? `${score} / 10` : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InvestorCompare;
