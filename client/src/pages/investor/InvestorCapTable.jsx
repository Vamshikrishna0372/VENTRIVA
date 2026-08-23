import React, { useState, useEffect } from 'react';
import { PieChart, Loader2, Search, Briefcase } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { CapTablePreview } from '../../components/closing/CapTablePreview';
import api from '../../services/api';

export const InvestorCapTable = () => {
  const [investments, setInvestments] = useState([]);
  const [selectedStartupId, setSelectedStartupId] = useState('');
  const [capTable, setCapTable] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
    try {
      const res = await api.get('/investments');

      if (res.data?.success && res.data?.data?.length > 0) {
        setInvestments(res.data.data);
        const firstStartup = res.data.data[0].startup?._id || res.data.data[0].startup;
        if (firstStartup) setSelectedStartupId(firstStartup);
      }
    } catch (err) {
      console.error('Error fetching investor investments:', err);
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
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <PieChart className="w-7 h-7 text-brand-400" /> Portfolio Venture Cap Tables
        </h1>
        <p className="text-sm text-slate-400">
          Review verified equity ownership, share classes, and post-closing shareholdings for your portfolio investments.
        </p>
      </div>

      {investments.length === 0 ? (
        <Card className="text-center py-12">
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
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">Select Venture:</span>
            <select
              value={selectedStartupId}
              onChange={(e) => setSelectedStartupId(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-100 focus:border-brand-500 focus:outline-none"
            >
              {investments.map((inv) => {
                const s = inv.startup || {};
                return (
                  <option key={inv._id} value={s._id || s}>
                    {s.companyName || 'Portfolio Venture'}
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
