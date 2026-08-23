import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserCheck, CheckCircle2, XCircle, MessageSquare, Loader2, Building2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

import { getMyStartup } from '../../services/startupService';
import { getStartupInterests, respondToInterest } from '../../services/investorInterestService';

export const FounderInterests = () => {
  const navigate = useNavigate();
  const [startup, setStartup] = useState(null);
  const [interests, setInterests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [respondingId, setRespondingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const startupRes = await getMyStartup();
      if (startupRes?.success && startupRes?.startup) {
        setStartup(startupRes.startup);
        const intRes = await getStartupInterests(startupRes.startup._id);
        if (intRes?.success && Array.isArray(intRes.interests)) {
          setInterests(intRes.interests);
        }
      }
    } catch (err) {
      console.error('Error fetching founder investor interests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespond = async (interestId, status) => {
    setRespondingId(interestId);
    try {
      const res = await respondToInterest(interestId, status);
      if (res?.success) {
        fetchData();
        if (status === 'Accepted' && res?.conversationId) {
          navigate(`/founder/messages?conversationId=${res.conversationId}`);
        }
      }
    } catch (err) {
      alert('Failed to respond to investor interest');
    } finally {
      setRespondingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Investor Interests...</p>
      </div>
    );
  }

  if (!startup) {
    return (
      <Card className="text-center py-16 px-4 space-y-4">
        <Building2 className="w-12 h-12 text-slate-500 mx-auto" />
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-lg font-bold text-slate-100">Create Startup Profile First</h3>
          <p className="text-xs text-slate-400">Complete your startup profile to receive investor interest expressions.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Received Investor Interests</h1>
            <p className="text-sm text-slate-400">Review investor interest requests, evaluate fund profiles, and accept to start direct conversations.</p>
          </div>
          <Badge variant="brand">{interests.length} Expressed Interests</Badge>
        </div>
      </div>

      {/* Interests List */}
      {interests.length === 0 ? (
        <Card className="text-center py-16 px-4 space-y-4">
          <UserCheck className="w-12 h-12 text-slate-500 mx-auto" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-100">No Investor Interests Received Yet</h3>
            <p className="text-xs text-slate-400">Complete your startup profile and publish to be discovered by active investors.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {interests.map((item) => (
            <Card key={item._id}>
              <CardBody className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center font-bold text-brand-300 text-xs">
                      {item.investor?.name ? item.investor.name.substring(0, 2).toUpperCase() : 'INV'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm">{item.investor?.name}</h3>
                      <p className="text-xs text-slate-400">{item.investor?.organization || 'Individual Investor'}</p>
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

                {item.status === 'Interested' && (
                  <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={XCircle}
                      isLoading={respondingId === item._id}
                      onClick={() => handleRespond(item._id, 'Declined')}
                    >
                      Decline
                    </Button>
                    <Button
                      variant="emerald"
                      size="sm"
                      icon={CheckCircle2}
                      isLoading={respondingId === item._id}
                      onClick={() => handleRespond(item._id, 'Accepted')}
                    >
                      Accept & Open Messaging Thread
                    </Button>
                  </div>
                )}

                {item.status === 'Accepted' && (
                  <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                    <Button
                      variant="brand"
                      size="sm"
                      icon={MessageSquare}
                      onClick={() => navigate(`/founder/messages?userId=${item.investor?._id || item.investor}`)}
                    >
                      Message Investor
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

export default FounderInterests;
