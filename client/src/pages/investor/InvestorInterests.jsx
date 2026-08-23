import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserCheck, MessageSquare, Compass, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

import { getMyInterests, withdrawInterest } from '../../services/investorInterestService';

export const InvestorInterests = () => {
  const navigate = useNavigate();
  const [interests, setInterests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInterests();
  }, []);

  const fetchInterests = async () => {
    setIsLoading(true);
    try {
      const res = await getMyInterests();
      if (res?.success && Array.isArray(res.interests)) {
        setInterests(res.interests);
      }
    } catch (err) {
      console.error('Error fetching investor interests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (id) => {
    if (!window.confirm('Withdraw this investor interest submission?')) return;
    try {
      await withdrawInterest(id);
      fetchInterests();
    } catch (err) {
      alert('Failed to withdraw interest');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Expressed Interests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Expressed Investor Interests</h1>
            <p className="text-sm text-slate-400">Track interest requests submitted to startup founders across your portfolio pipeline.</p>
          </div>
          <Badge variant="brand">{interests.length} Total Submissions</Badge>
        </div>
      </div>

      {/* Interests List */}
      {interests.length === 0 ? (
        <Card className="text-center py-16 px-4 space-y-4">
          <UserCheck className="w-12 h-12 text-slate-500 mx-auto" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-100">No Expressed Interests Submitted</h3>
            <p className="text-xs text-slate-400">Discover startups and click "Express Interest" to initiate direct founder communication.</p>
          </div>
          <Link to="/investor/discover">
            <Button variant="primary" size="sm" icon={Compass}>Explore Discovery Engine</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {interests.map((item) => (
            <Card key={item._id}>
              <CardBody className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center font-bold text-brand-300 text-xs">
                      {item.startup?.startupName ? item.startup.startupName.substring(0, 2).toUpperCase() : 'ST'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm">{item.startup?.startupName}</h3>
                      <p className="text-xs text-slate-400">{item.startup?.sector} • {item.startup?.stage}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={item.status === 'Accepted' ? 'emerald' : item.status === 'Declined' ? 'rose' : 'amber'}>
                      {item.status}
                    </Badge>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {item.message && (
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300 italic">
                    "{item.message}"
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                  {item.status === 'Accepted' && (
                    <Link to="/investor/messages">
                      <Button variant="emerald" size="sm" icon={MessageSquare}>
                        Open Messaging Thread
                      </Button>
                    </Link>
                  )}

                  {item.status === 'Interested' && (
                    <Button variant="outline" size="sm" onClick={() => handleWithdraw(item._id)}>
                      Withdraw Interest
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvestorInterests;
