import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { getMyDecisions } from '../../services/investmentDecisionService';
import { DECISION_STATUS_COLORS } from '../../utils/strategyConstants';

export const InvestmentDecisions = () => {
  const [decisions, setDecisions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDecisions();
  }, []);

  const fetchDecisions = async () => {
    setIsLoading(true);
    try {
      const res = await getMyDecisions();
      if (res?.success) setDecisions(res.data);
    } catch (err) {
      console.error('Error fetching investment decisions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Private Investment Decision Records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2">
        <h1 className="text-2xl font-bold text-slate-100">Private Investment Decisions</h1>
        <p className="text-sm text-slate-400">Record investment committee rationale, conviction ratings, and strategic upside/risk analysis (100% private to investor).</p>
      </div>

      {decisions.length === 0 ? (
        <Card className="text-center py-12">
          <CardBody className="space-y-3">
            <FileText className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-200">No Investment Decisions Recorded</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your private investment decision records, conviction scores, and rationale will appear here.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {decisions.map((dec) => (
            <Card key={dec._id} className="border-slate-800 bg-slate-900">
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{dec.startup?.startupName || 'Startup'}</h4>
                    <p className="text-xs text-slate-400">Type: {dec.decisionType} • Date: {new Date(dec.decisionDate).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={DECISION_STATUS_COLORS[dec.decisionStatus] || 'brand'}>
                    {dec.decisionStatus}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Conviction Score</span>
                    <span className="font-bold text-emerald-400">{dec.convictionScore}/100</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Target Amount</span>
                    <span className="font-bold text-slate-200">${(dec.recommendedInvestmentAmount || 0).toLocaleString()}</span>
                  </div>
                </div>

                {dec.rationale && (
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-slate-300">Investment Rationale:</span>
                    <p className="text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">{dec.rationale}</p>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvestmentDecisions;
