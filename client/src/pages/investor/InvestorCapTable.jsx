import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart,
  Loader2,
  Search,
  Briefcase,
  RefreshCw,
  Building2,
  ShieldCheck,
  Target,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { CapTablePreview } from '../../components/closing/CapTablePreview';
import api from '../../services/api';

export const InvestorCapTable = () => {
  const [investments, setInvestments] = useState([]);
  const [selectedStartupId, setSelectedStartupId] = useState('');
  const [capTable, setCapTable] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetchInvestments();
  }, []);

  useEffect(() => {
    if (selectedStartupId) {
      fetchCapTable(selectedStartupId);
    }
  }, [selectedStartupId]);

  const fetchInvestments = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await api.get('/investments');

      if (res.data?.success && res.data?.data?.length > 0) {
        setInvestments(res.data.data);
        const firstStartup = res.data.data[0].startup?._id || res.data.data[0].startup;
        if (firstStartup) setSelectedStartupId(firstStartup);
      }
    } catch (err) {
      console.error('Error fetching investor investments:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCapTable = async (startupId) => {
    try {
      const res = await api.get(`/cap-table/${startupId}`);
      if (res.data?.success) {
        setCapTable(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching cap table:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Portfolio Cap Tables...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <PieChart className="w-7 h-7 text-brand-400" /> Portfolio Venture Cap Tables
            </h1>
            <p className="text-sm text-slate-400">
              Review verified equity ownership, share classes, and post-closing shareholdings for your portfolio investments.
            </p>
          </div>
          <Button onClick={fetchInvestments} icon={RefreshCw} variant="outline" size="sm">
            Refresh Cap Table
          </Button>
        </div>

        {/* Connected Workflows Quick Bar */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
          <Link to="/investor/governance" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Corporate Governance
          </Link>
          <Link to="/investor/portfolio" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Venture Portfolio
          </Link>
          <Link to="/investor/portfolio/scenarios" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-cyan-400" /> Scenario Simulations
          </Link>
        </div>
      </div>

      {isError && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>Failed to load portfolio cap table dataset. Please try again.</span>
          </div>
          <Button variant="outline" size="xs" onClick={fetchInvestments}>Retry</Button>
        </div>
      )}

      {investments.length === 0 ? (
        <Card className="text-center py-12 border-slate-800 bg-slate-900">
          <CardBody className="space-y-3">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-200">No Closed Portfolio Investments</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Once an investment transaction closes and shareholdings are issued, venture cap tables will appear here.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Select Venture:</span>
            <select
              value={selectedStartupId}
              onChange={(e) => setSelectedStartupId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 focus:border-brand-500 focus:outline-none"
            >
              {investments.map((inv) => {
                const s = inv.startup || {};
                return (
                  <option key={inv._id} value={s._id || s}>
                    {s.startupName || s.companyName || 'Portfolio Venture'}
                  </option>
                );
              })}
            </select>
          </div>

          <CapTablePreview capTable={capTable} />
        </div>
      )}
    </div>
  );
};

export default InvestorCapTable;

