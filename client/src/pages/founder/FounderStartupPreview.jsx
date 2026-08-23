import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Building2, Globe, MapPin, DollarSign, TrendingUp, Users, ArrowLeft, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { getMyStartup } from '../../services/startupService';

export const FounderStartupPreview = () => {
  const [startup, setStartup] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPreviewData();
  }, []);

  const fetchPreviewData = async () => {
    setIsLoading(true);
    try {
      const res = await getMyStartup();
      if (res?.success && res?.startup) {
        setStartup(res.startup);
        setTeamMembers(res.teamMembers || []);
      }
    } catch (err) {
      setStartup(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Generating Profile Preview...</p>
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="text-center py-16 space-y-4">
        <Building2 className="w-12 h-12 mx-auto text-slate-500" />
        <h2 className="text-xl font-bold text-slate-100">No Venture Profile Found</h2>
        <p className="text-sm text-slate-400">Create your startup profile first to enable preview mode.</p>
        <Link to="/founder/startup">
          <Button variant="primary">Create Venture Profile</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Founder Preview Banner */}
      <div className="bg-brand-500/10 border border-brand-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-300">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-brand-400 shrink-0" />
          <span><strong className="text-slate-100 font-semibold">Founder Preview Mode:</strong> This is how your startup profile appears to authorized VC investors.</span>
        </div>
        <Link to="/founder/startup">
          <Button variant="secondary" size="sm" icon={ArrowLeft}>Back to Editor</Button>
        </Link>
      </div>

      {/* Hero Venture Card */}
      <Card hoverEffect={false} className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-2">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-brand-500/20">
              {startup.startupName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-100">{startup.startupName}</h1>
                <Badge variant="brand">{startup.stage}</Badge>
                <Badge variant="emerald">{startup.businessModel}</Badge>
              </div>
              <p className="text-sm text-slate-300 font-medium mt-1">{startup.tagline}</p>
              <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-2">
                {startup.locationDisplay && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {startup.locationDisplay}
                  </span>
                )}
                {startup.website && (
                  <a href={startup.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-brand-400 hover:underline">
                    <Globe className="w-3.5 h-3.5" /> Website
                  </a>
                )}
                <span>Founded {startup.foundedYear}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <Badge variant="cyan">{startup.profileVisibility}</Badge>
            <span className="text-[11px] font-mono text-slate-400">Score: {startup.profileCompletion}% Complete</span>
          </div>
        </div>
      </Card>

      {/* Main Grid Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Description & Traction */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Executive Overview & Problem Statement" />
            <CardBody>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {startup.description}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Traction & Revenue Performance" />
            <CardBody className="space-y-4">
              {startup.tractionSummary && (
                <p className="text-sm text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  {startup.tractionSummary}
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center">
                  <p className="text-[10px] font-mono text-slate-400 uppercase">Monthly Revenue</p>
                  <p className="text-lg font-bold text-emerald-400 mt-0.5">
                    {startup.monthlyRevenue > 0 ? `$${startup.monthlyRevenue.toLocaleString()}` : 'Pre-Revenue'}
                  </p>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center">
                  <p className="text-[10px] font-mono text-slate-400 uppercase">Annual ARR</p>
                  <p className="text-lg font-bold text-slate-100 mt-0.5">
                    {startup.annualRevenue > 0 ? `$${startup.annualRevenue.toLocaleString()}` : '$0'}
                  </p>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center">
                  <p className="text-[10px] font-mono text-slate-400 uppercase">MoM Growth</p>
                  <p className="text-lg font-bold text-brand-400 mt-0.5">
                    {startup.revenueGrowth > 0 ? `+${startup.revenueGrowth}%` : '—'}
                  </p>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center">
                  <p className="text-[10px] font-mono text-slate-400 uppercase">Customers</p>
                  <p className="text-lg font-bold text-slate-100 mt-0.5">
                    {startup.customerCount > 0 ? startup.customerCount.toLocaleString() : '—'}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Team Members Grid */}
          <Card>
            <CardHeader title="Founding Team & Executives" subtitle="Primary Founder, Co-Founders, and Staff" />
            <CardBody className="space-y-4">
              {/* Primary Founder */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-brand-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
                    {startup?.founder?.name ? startup.founder.name.substring(0, 2).toUpperCase() : 'PF'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{startup?.founder?.name || 'Primary Venture Founder'}</h4>
                    <p className="text-xs text-brand-400">Founder & CEO</p>
                  </div>
                </div>
                <Badge variant="emerald" size="xs">Primary Founder</Badge>
              </div>

              {/* Co-Founders */}
              {teamMembers.filter(m => m.isFounder).length > 0 && (
                <div className="space-y-2 pt-2">
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Co-Founders</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {teamMembers.filter(m => m.isFounder).map((member) => (
                      <div key={member._id} className="bg-slate-950/60 p-3 rounded-xl border border-emerald-500/20 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-100 text-sm">{member.name}</h4>
                          <Badge variant="emerald" size="xs">Co-Founder</Badge>
                        </div>
                        <p className="text-xs text-emerald-400">{member.role}</p>
                        {member.linkedin && (
                          <a href={member.linkedin.startsWith('http') ? member.linkedin : `https://${member.linkedin}`} target="_blank" rel="noreferrer" className="text-[10px] text-brand-400 hover:underline block pt-1">
                            LinkedIn
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Team Members */}
              {teamMembers.filter(m => !m.isFounder).length > 0 && (
                <div className="space-y-2 pt-2">
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Team Members</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {teamMembers.filter(m => !m.isFounder).map((member) => (
                      <div key={member._id} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                        <h4 className="font-bold text-slate-100 text-sm">{member.name}</h4>
                        <p className="text-xs text-brand-400">{member.role}</p>
                        {member.linkedin && (
                          <a href={member.linkedin.startsWith('http') ? member.linkedin : `https://${member.linkedin}`} target="_blank" rel="noreferrer" className="text-[10px] text-brand-400 hover:underline block pt-1">
                            LinkedIn
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Col: Fundraising Card & Metadata */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-b from-slate-900 to-indigo-950/40 border-slate-800">
            <CardHeader title="Fundraising Terms" />
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Status:</span>
                <Badge variant="brand">{startup.fundraisingStatus}</Badge>
              </div>

              {startup.fundraisingStatus === 'Currently Raising' && (
                <>
                  <div className="pt-2 border-t border-slate-800/80">
                    <p className="text-[10px] font-mono text-slate-400 uppercase">Target Raise</p>
                    <p className="text-2xl font-extrabold text-emerald-400 mt-0.5">
                      {startup.fundingCurrency} ${startup.fundingRequired.toLocaleString()}
                    </p>
                  </div>

                  <div className="text-xs space-y-1 text-slate-300">
                    <p><strong>Round:</strong> {startup.fundingStage}</p>
                    {startup.targetCloseDate && (
                      <p><strong>Target Close:</strong> {new Date(startup.targetCloseDate).toLocaleDateString()}</p>
                    )}
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FounderStartupPreview;
