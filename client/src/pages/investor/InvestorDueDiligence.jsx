import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckSquare,
  ArrowLeft,
  Lock,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  Clock
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';

import { getStartupDetailForInvestor } from '../../services/discoveryService';
import { getDueDiligenceChecklist, updateChecklistItem } from '../../services/dueDiligenceService';
import { getDocumentsByStartup } from '../../services/documentService';

export const InvestorDueDiligence = () => {
  const { startupId } = useParams();
  const navigate = useNavigate();

  const [startup, setStartup] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [startupId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [startupRes, ddRes, docsRes] = await Promise.all([
        getStartupDetailForInvestor(startupId),
        getDueDiligenceChecklist(startupId),
        getDocumentsByStartup(startupId),
      ]);

      if (startupRes?.success && startupRes?.startup) {
        setStartup(startupRes.startup);
      }

      if (ddRes?.success && ddRes?.checklist) {
        setChecklist(ddRes.checklist);
        setCompletionPercentage(ddRes.completionPercentage || 0);
      }

      if (docsRes?.success && Array.isArray(docsRes.documents)) {
        setDocuments(docsRes.documents);
      }
    } catch (err) {
      console.error('Error fetching due diligence data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemStatusChange = async (itemId, newStatus, currentNote, currentDocId) => {
    setUpdatingItemId(itemId);
    try {
      const res = await updateChecklistItem(startupId, itemId, {
        status: newStatus,
        investorNote: currentNote,
        documentId: currentDocId,
      });

      if (res?.success && res?.checklist) {
        setChecklist(res.checklist);
        setCompletionPercentage(res.completionPercentage || 0);
      }
    } catch (err) {
      alert('Failed to update due diligence item');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleNoteBlur = async (itemId, currentStatus, newNote, currentDocId) => {
    try {
      await updateChecklistItem(startupId, itemId, {
        status: currentStatus,
        investorNote: newNote,
        documentId: currentDocId,
      });
    } catch (err) {
      console.error('Failed to save investor note:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Due-Diligence Workspace...</p>
      </div>
    );
  }

  if (!startup || !checklist) {
    return (
      <div className="text-center py-16 space-y-4">
        <Building2 className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-100">Due Diligence Workspace Unavailable</h2>
        <Button variant="primary" icon={ArrowLeft} onClick={() => navigate('/investor/discover')}>
          Back to Discovery
        </Button>
      </div>
    );
  }

  // Group items by category
  const categoriesMap = {};
  checklist.items.forEach((item) => {
    if (!categoriesMap[item.category]) categoriesMap[item.category] = [];
    categoriesMap[item.category].push(item);
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(`/investor/startups/${startup._id}`)} />
              <h1 className="text-2xl font-bold text-slate-100">{startup.startupName} — Due Diligence Workspace</h1>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 ml-8">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> Confidential investor due diligence checklist. Notes are 100% private to you.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to={`/investor/pipeline/${startup._id}`}>
              <Button variant="outline" size="sm">
                View Deal Pipeline
              </Button>
            </Link>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300">Diligence Completion Progress</span>
            <span className="font-mono text-emerald-400 font-bold">{completionPercentage}% Complete</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Checklist Blocks */}
      <div className="space-y-6">
        {Object.keys(categoriesMap).map((catName) => (
          <Card key={catName}>
            <CardHeader title={catName} />
            <CardBody className="space-y-4">
              {categoriesMap[catName].map((item) => (
                <div key={item._id} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                        {item.status === 'Complete' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-400">{item.description}</p>
                    </div>

                    <Select
                      value={item.status}
                      onChange={(e) => handleItemStatusChange(item._id, e.target.value, item.investorNote, item.document)}
                      options={[
                        { value: 'Not Started', label: 'Not Started' },
                        { value: 'In Progress', label: 'In Progress' },
                        { value: 'Complete', label: 'Complete' },
                        { value: 'Blocked', label: 'Blocked' },
                        { value: 'Not Applicable', label: 'Not Applicable' },
                      ]}
                      className="w-40"
                    />
                  </div>

                  {/* Private Investor Note Input */}
                  <textarea
                    rows={2}
                    placeholder="Record private due-diligence notes for this item..."
                    defaultValue={item.investorNote}
                    onBlur={(e) => handleNoteBlur(item._id, item.status, e.target.value, item.document)}
                    className="w-full bg-slate-900 text-slate-200 text-xs rounded-xl border border-slate-800/80 p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              ))}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default InvestorDueDiligence;
