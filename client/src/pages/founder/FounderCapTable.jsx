import React, { useState, useEffect } from 'react';
import { PieChart, Loader2, ShieldCheck, History } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { CapTablePreview } from '../../components/closing/CapTablePreview';
import api from '../../services/api';

export const FounderCapTable = () => {
  const [capTable, setCapTable] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');

  useEffect(() => {
    fetchCapTableData();
  }, []);

  const fetchCapTableData = async () => {
    setIsLoading(true);
    try {
      const startupRes = await api.get('/startups/my');

      if (startupRes.data?.success && startupRes.data?.startup) {
        const startup = startupRes.data.startup;
        if (startup?._id) {
          const [ctRes, histRes] = await Promise.all([
            api.get(`/cap-table/${startup._id}`),
            api.get(`/cap-table/${startup._id}/history`),
          ]);

          if (ctRes.data?.success) setCapTable(ctRes.data.data);
          if (histRes.data?.success) setHistory(histRes.data.data || []);
        }
      }
    } catch (err) {
      console.error('Error fetching cap table:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Venture Equity Cap Table...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <PieChart className="w-7 h-7 text-brand-400" /> Venture Equity Cap Table
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time equity breakdown, shareholdings, share classes, and immutable historical snapshot ledger.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('current')}
          className={`pb-3 px-4 border-b-2 transition-colors ${
            activeTab === 'current' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Active Ownership Breakdown
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 border-b-2 transition-colors ${
            activeTab === 'history' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Immutable Snapshot History ({history.length})
        </button>
      </div>

      {activeTab === 'current' ? (
        <CapTablePreview capTable={capTable} />
      ) : (
        <div className="space-y-3">
          {history.length === 0 ? (
            <Card className="p-6 text-center text-xs text-slate-400">
              No historical cap table snapshots recorded yet.
            </Card>
          ) : (
            history.map((snap) => (
              <Card key={snap._id} className="p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 font-mono">
                  <span className="font-bold text-slate-200">
                    Snapshot Date: {new Date(snap.snapshotDate).toLocaleString()}
                  </span>
                  <span className="text-emerald-400">Total Shares: {snap.totalSharesAfter?.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-slate-300">
                  <div>Founders: {snap.founderOwnership}%</div>
                  <div>Investors: {snap.investorOwnership}%</div>
                  <div>Other: {snap.otherOwnership}%</div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default FounderCapTable;
