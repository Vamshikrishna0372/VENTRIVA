import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Globe,
  MapPin,
  DollarSign,
  TrendingUp,
  Users,
  Bookmark,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ClipboardCheck,
  Columns,
  FileText,
  CheckSquare,
  Download,
  UserCheck,
  MessageSquare,
  Calendar
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

import EvaluationSummary from '../../components/investor/EvaluationSummary';
import MeetingRequestModal from '../../components/meetings/MeetingRequestModal';
import { getStartupDetailForInvestor } from '../../services/discoveryService';
import { addToShortlist, removeFromShortlist } from '../../services/shortlistService';
import { getEvaluationByStartup } from '../../services/evaluationService';
import { getPipelineByStartup, savePipelineEntry } from '../../services/pipelineService';
import { getDocumentsByStartup, downloadDocumentBlob } from '../../services/documentService';
import { expressInterest, getMyInterests } from '../../services/investorInterestService';
import { formatFileSize } from '../../utils/documentConstants';

export const InvestorStartupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'documents'
  const [startup, setStartup] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [pipeline, setPipeline] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [myInterest, setMyInterest] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingShortlist, setIsTogglingShortlist] = useState(false);
  const [isExpressingInterest, setIsExpressingInterest] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [startupRes, evalRes, pipeRes, docRes, intRes] = await Promise.all([
        getStartupDetailForInvestor(id),
        getEvaluationByStartup(id),
        getPipelineByStartup(id),
        getDocumentsByStartup(id),
        getMyInterests(),
      ]);

      if (startupRes?.success && startupRes?.startup) {
        setStartup(startupRes.startup);
        setTeamMembers(startupRes.teamMembers || []);
        setIsShortlisted(Boolean(startupRes.isShortlisted));
      } else {
        setErrorMsg(startupRes?.message || 'Startup profile unavailable for discovery');
      }

      if (evalRes?.success && evalRes?.evaluation) setEvaluation(evalRes.evaluation);
      if (pipeRes?.success && pipeRes?.pipeline) setPipeline(pipeRes.pipeline);
      if (docRes?.success && Array.isArray(docRes.documents)) setDocuments(docRes.documents);

      if (intRes?.success && Array.isArray(intRes.interests)) {
        const found = intRes.interests.find((i) => i.startup?._id === id || i.startup === id);
        if (found) setMyInterest(found);
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Failed to fetch startup venture profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleShortlist = async () => {
    if (!startup?._id || isTogglingShortlist) return;
    setIsTogglingShortlist(true);

    try {
      if (isShortlisted) {
        await removeFromShortlist(startup._id);
        setIsShortlisted(false);
      } else {
        await addToShortlist(startup._id);
        setIsShortlisted(true);
      }
    } catch (err) {
      alert(err?.message || 'Failed to toggle shortlist state');
    } finally {
      setIsTogglingShortlist(false);
    }
  };

  const handleExpressInterest = async () => {
    const note = window.prompt('Optional introductory note for the founder:');
    setIsExpressingInterest(true);
    try {
      const res = await expressInterest(startup._id, note || undefined);
      if (res?.success && res?.interest) {
        setMyInterest(res.interest);
        alert('Investor interest submitted to founder successfully!');
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to submit interest');
    } finally {
      setIsExpressingInterest(false);
    }
  };

  const handleDownloadDoc = async (docId, fileName) => {
    try {
      const res = await downloadDocumentBlob(docId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download document file');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Venture Profile...</p>
      </div>
    );
  }

  if (errorMsg || !startup) {
    return (
      <div className="text-center py-16 space-y-4">
        <Building2 className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-100">{errorMsg || 'Venture Profile Unavailable'}</h2>
        <Button variant="primary" icon={ArrowLeft} onClick={() => navigate('/investor/discover')}>
          Back to Discovery Engine
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/investor/discover')}>
          Back to Discovery Engine
        </Button>
      </div>

      {/* Hero Venture Header */}
      <Card hoverEffect={false} className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-2">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg shrink-0">
              {startup.startupName ? startup.startupName.substring(0, 2).toUpperCase() : 'ST'}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-100">{startup.startupName}</h1>
                {startup.isVerified && (
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" title="Verified Venture" />
                )}
                <Badge variant="brand">{startup.stage}</Badge>
                <Badge variant="emerald">{startup.businessModel}</Badge>
                {myInterest && <Badge variant={myInterest.status === 'Accepted' ? 'emerald' : 'amber'}>Interest: {myInterest.status}</Badge>}
              </div>

              <p className="text-sm text-slate-300 font-medium">{startup.tagline}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
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

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {!myInterest ? (
              <Button
                variant="primary"
                size="sm"
                icon={UserCheck}
                isLoading={isExpressingInterest}
                onClick={handleExpressInterest}
              >
                Express Interest
              </Button>
            ) : (
              myInterest.status === 'Accepted' && (
                <>
                  <Link to="/investor/messages">
                    <Button variant="emerald" size="sm" icon={MessageSquare}>
                      Start Conversation
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" icon={Calendar} onClick={() => setShowMeetingModal(true)}>
                    Request Meeting
                  </Button>
                </>
              )
            )}

            <Button
              variant={isShortlisted ? 'emerald' : 'outline'}
              size="sm"
              icon={Bookmark}
              isLoading={isTogglingShortlist}
              onClick={handleToggleShortlist}
            >
              {isShortlisted ? 'Shortlisted' : 'Save to Shortlist'}
            </Button>

            <Link to="/investor/investment-decisions">
              <Button variant="brand" size="sm" icon={FileText}>
                Record Private Decision
              </Button>
            </Link>

            <Link to={`/investor/due-diligence/${startup._id}`}>
              <Button variant="outline" size="sm" icon={CheckSquare}>
                Due Diligence
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'overview' ? 'border-brand-500 text-brand-300' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Venture Overview & Traction
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'documents' ? 'border-brand-500 text-brand-300' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Data Room Documents ({documents.length})</span>
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Private Evaluation Summary Panel if evaluation exists */}
          {evaluation && (
            <EvaluationSummary evaluation={evaluation} />
          )}

          {/* Main Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader title="Executive Overview" />
                <CardBody>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {startup.description}
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Traction & Revenue Metrics" />
                <CardBody className="space-y-4">
                  {startup.tractionSummary && (
                    <p className="text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
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

              {/* Team Roster */}
              <Card>
                <CardHeader title="Founding Team & Key Executives" subtitle="Primary Founder, Co-Founders, and Staff" />
                <CardBody className="space-y-4">
                  {/* Primary Founder */}
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-brand-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
                        {startup?.founder?.name ? startup.founder.name.substring(0, 2).toUpperCase() : 'PF'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm">{startup?.founder?.name || 'Primary Venture Founder'}</h4>
                        <p className="text-xs text-brand-400 font-medium">Founder & CEO</p>
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
                            <p className="text-xs text-emerald-400 font-medium">{member.role}</p>
                            {member.linkedin && (
                              <a href={member.linkedin.startsWith('http') ? member.linkedin : `https://${member.linkedin}`} target="_blank" rel="noreferrer" className="text-[10px] text-brand-400 hover:underline block pt-1">
                                LinkedIn Profile
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
                            <p className="text-xs text-brand-400 font-medium">{member.role}</p>
                            {member.linkedin && (
                              <a href={member.linkedin.startsWith('http') ? member.linkedin : `https://${member.linkedin}`} target="_blank" rel="noreferrer" className="text-[10px] text-brand-400 hover:underline block pt-1">
                                LinkedIn Profile
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

            {/* Right Column */}
            <div className="space-y-6">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader title="Fundraising Terms & Round" />
                <CardBody className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Status:</span>
                    <Badge variant="brand">{startup.fundraisingStatus}</Badge>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <p className="text-[10px] font-mono text-slate-400 uppercase">Target Funding Required</p>
                    <p className="text-2xl font-extrabold text-emerald-400 mt-0.5">
                      {startup.fundingCurrency || 'USD'} ${startup.fundingRequired ? startup.fundingRequired.toLocaleString() : '0'}
                    </p>
                  </div>

                  <div className="text-xs space-y-1 text-slate-300 pt-2 border-t border-slate-800">
                    <p><strong>Round Stage:</strong> {startup.fundingStage || startup.stage}</p>
                    {startup.targetCloseDate && (
                      <p><strong>Target Close:</strong> {new Date(startup.targetCloseDate).toLocaleDateString()}</p>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </>
      ) : (
        /* DATA ROOM DOCUMENTS TAB */
        <div className="space-y-4">
          {documents.length === 0 ? (
            <Card className="text-center py-16 px-4 space-y-4">
              <FileText className="w-12 h-12 text-slate-500 mx-auto" />
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-bold text-slate-100">No Data Room Files Uploaded</h3>
                <p className="text-xs text-slate-400">The founder has not published any investor documents yet for this startup.</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <div key={doc._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-100 text-sm line-clamp-1">{doc.title}</h3>
                        <p className="text-xs text-slate-400 font-mono">{doc.category}</p>
                      </div>
                      {doc.isPrimary && <Badge variant="emerald" size="xs">PRIMARY DECK</Badge>}
                    </div>

                    {doc.description && <p className="text-xs text-slate-300 line-clamp-2">{doc.description}</p>}

                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-400 flex justify-between items-center">
                      <span>Size: {formatFileSize(doc.fileSize)}</span>
                      <span>v{doc.version}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <Button variant="primary" size="sm" icon={Download} onClick={() => handleDownloadDoc(doc._id, doc.originalFileName)}>
                      Secure Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Meeting Request Modal */}
      {showMeetingModal && (
        <MeetingRequestModal
          startupId={startup._id}
          onClose={() => setShowMeetingModal(false)}
          onSuccess={() => alert('Meeting request submitted to founder!')}
        />
      )}
    </div>
  );
};

export default InvestorStartupDetail;
