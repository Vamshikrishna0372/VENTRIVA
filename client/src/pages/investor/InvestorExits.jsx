import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle2, Award, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { getExitTransactions, completeExitTransaction } from '../../services/exitService';

export const InvestorExits = () => {
  const [exits, setExits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchExits();
  }, []);

  const fetchExits = async () => {
    setIsLoading(true);
    try {
      const res = await getExitTransactions();
      if (res?.success) setExits(res.data);
    } catch (err) {
      console.error('Error fetching exit transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteExit = async (id) => {
    try {
      const res = await completeExitTransaction(id);
      if (res?.success) fetchExits();
    } catch (err) {
      console.error('Error completing exit transaction:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Exit Transactions & Realized Returns...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2">
        <h1 className="text-2xl font-bold text-slate-100">Exit Transactions & Realized Returns</h1>
        <p className="text-sm text-slate-400">Track acquisitions, IPOs, secondary sales, and write-offs while auditing realized return multiples (MOIC).</p>
      </div>

      {exits.length === 0 ? (
        <Card className="text-center py-12">
          <CardBody className="space-y-3">
            <Award className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-200">No Exit Transactions Recorded</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              When a portfolio holding reaches an acquisition, IPO, secondary sale, or write-off, the transaction record will appear here.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exits.map((ex) => (
            <Card key={ex._id} className="border-slate-800 bg-slate-900">
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{ex.startup?.startupName || 'Portfolio Startup'}</h4>
                    <p className="text-xs text-slate-400">{ex.exitType} • {ex.buyerName || 'Undisclosed Buyer'}</p>
                  </div>
                  <Badge variant={ex.exitStatus === 'Completed' ? 'emerald' : 'amber'}>
                    {ex.exitStatus}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Realized Value</span>
                    <span className="font-bold text-emerald-400">${(ex.exitValue || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Realized MOIC</span>
                    <span className="font-bold text-emerald-400">{ex.realizedMultiple}x</span>
                  </div>
                </div>

                {ex.exitStatus === 'Planned' && (
                  <div className="flex justify-end pt-2 border-t border-slate-800">
                    <Button variant="primary" size="sm" icon={CheckCircle2} onClick={() => handleCompleteExit(ex._id)}>
                      Complete & Realize Exit
                    </Button>
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

export default InvestorExits;
