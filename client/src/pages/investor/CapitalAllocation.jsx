import React, { useState, useEffect } from 'react';
import { DollarSign, PieChart, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { getAllocationPlans } from '../../services/capitalAllocationService';

export const CapitalAllocation = () => {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const res = await getAllocationPlans();
      if (res?.success) setPlans(res.data);
    } catch (err) {
      console.error('Error fetching capital allocation plans:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Capital Allocation & Deployment Plans...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2">
        <h1 className="text-2xl font-bold text-slate-100">Capital Deployment & Allocation Plans</h1>
        <p className="text-sm text-slate-400">Manage quarterly deployment targets, reserve follow-on funds, and record check size allocations.</p>
      </div>

      {plans.length === 0 ? (
        <Card className="text-center py-12">
          <CardBody className="space-y-3">
            <PieChart className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-200">No Allocation Plans Formally Recorded</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your capital allocation plans and check size deployment targets will appear here.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {plans.map((pl) => (
            <Card key={pl._id} className="border-slate-800 bg-slate-900">
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">Planning Period: {pl.planningPeriod}</h4>
                    <p className="text-xs text-slate-400">Total Available: ${(pl.totalAvailableCapital || 0).toLocaleString()}</p>
                  </div>
                  <Badge variant={pl.status === 'Approved' ? 'emerald' : 'amber'}>{pl.status}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Deployed</span>
                    <span className="font-bold text-slate-200">${(pl.alreadyDeployedCapital || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Follow-On Reserve</span>
                    <span className="font-bold text-slate-300">${(pl.reservedFollowOnCapital || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Proposed Check Sizes</span>
                    <span className="font-bold text-emerald-400">${(pl.totalProposedCapital || 0).toLocaleString()}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CapitalAllocation;
