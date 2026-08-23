import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Target, Search, ArrowRight, Loader2, DollarSign, Mail, CheckCircle, Briefcase } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { RoundStatusBadge } from '../../components/fundraising/RoundStatusBadge';
import { FundraisingInviteCard } from '../../components/fundraising/FundraisingInviteCard';
import { formatCurrency } from '../../utils/fundraisingConstants';
import api from '../../services/api';

export const InvestorFundraising = () => {
  const [rounds, setRounds] = useState([]);
  const [invites, setInvites] = useState([]);
  const [commitments, setCommitments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('opportunities');

  useEffect(() => {
    fetchInvestorFundraisingData();
  }, []);

  const fetchInvestorFundraisingData = async () => {
    setIsLoading(true);
    try {
      const [roundsRes, invitesRes] = await Promise.all([
        api.get('/fundraising-rounds'),
        api.get('/fundraising-invites/my-invites'),
      ]);

      if (roundsRes.data?.success) setRounds(roundsRes.data.data || []);
      if (invitesRes.data?.success) setInvites(invitesRes.data.data || []);
    } catch (err) {
      console.error('Error fetching investor fundraising opportunities:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvite = async (inviteId) => {
    try {
      const res = await api.post(`/fundraising-invites/${inviteId}/accept`);
      if (res.data?.success) {
        fetchInvestorFundraisingData();
      }
    } catch (err) {
      console.error('Error accepting invite:', err);
    }
  };

  const handleDeclineInvite = async (inviteId) => {
    try {
      const res = await api.post(`/fundraising-invites/${inviteId}/decline`);
      if (res.data?.success) {
        fetchInvestorFundraisingData();
      }
    } catch (err) {
      console.error('Error declining invite:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Investment Opportunities...</p>
      </div>
    );
  }

  const pendingInvites = invites.filter((i) => i.status === 'Pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <Target className="w-7 h-7 text-brand-400" /> Investment Opportunities & Syndicates
        </h1>
        <p className="text-sm text-slate-400">
          Discover active startup fundraising rounds, review invitations, submit soft and firm check commitments, and track round progress.
        </p>
      </div>

      {/* Pending Invitations Section */}
      {pendingInvites.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
            <Mail className="w-4 h-4 text-purple-400" /> Pending Invitations ({pendingInvites.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingInvites.map((invite) => (
              <FundraisingInviteCard
                key={invite._id}
                invite={invite}
                onAccept={handleAcceptInvite}
                onDecline={handleDeclineInvite}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('opportunities')}
          className={`pb-3 px-4 border-b-2 transition-colors ${
            activeTab === 'opportunities'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Active Open Rounds ({rounds.length})
        </button>
      </div>

      {/* Rounds Grid */}
      {rounds.length === 0 ? (
        <Card className="text-center py-12">
          <CardBody className="space-y-3">
            <Search className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-200">No Active Fundraising Rounds</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              There are currently no public active fundraising rounds available. Check back soon or explore discovered ventures.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rounds.map((round) => {
            const startup = round.startup || {};

            return (
              <Card key={round._id} className="hover:border-slate-700 transition-all flex flex-col justify-between">
                <CardBody className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-100">{startup.startupName || startup.name || startup.companyName || 'Venture'}</h3>
                      <p className="text-xs text-slate-400">{round.roundName} ({round.roundType})</p>
                    </div>
                    <RoundStatusBadge status={round.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/50 p-3 rounded-xl border border-slate-800/60 font-mono">
                    <div>
                      <span className="text-slate-500">Target Raise</span>
                      <p className="font-bold text-slate-100">{formatCurrency(round.targetAmount)}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Valuation</span>
                      <p className="font-bold text-emerald-400">{formatCurrency(round.preMoneyValuation)}</p>
                    </div>
                  </div>

                  {round.useOfFunds && (
                    <p className="text-xs text-slate-400 line-clamp-2 italic">
                      "{round.useOfFunds}"
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-end">
                    <Link to={`/investor/fundraising/${round._id}`}>
                      <Button size="sm" variant="brand" className="flex items-center gap-1.5 text-xs">
                        Review Opportunity & Commit <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InvestorFundraising;
