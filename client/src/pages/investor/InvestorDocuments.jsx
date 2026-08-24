import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, Download, Compass, SlidersHorizontal, Loader2, AlertCircle, RefreshCw, CheckSquare, GitPullRequest, FileCheck } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { DOCUMENT_CATEGORIES, formatFileSize } from '../../utils/documentConstants';

import { getDocumentsByStartup, downloadDocumentBlob } from '../../services/documentService';
import { getShortlist } from '../../services/shortlistService';

export const InvestorDocuments = () => {
  const [shortlisted, setShortlisted] = useState([]);
  const [selectedStartupId, setSelectedStartupId] = useState('all');
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchShortlistAndDocuments();
  }, [selectedStartupId]);

  const fetchShortlistAndDocuments = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const shortlistRes = await getShortlist();
      if (shortlistRes?.success && Array.isArray(shortlistRes.shortlists)) {
        const valid = shortlistRes.shortlists.filter((s) => s.startup !== null);
        setShortlisted(valid);

        if (selectedStartupId !== 'all') {
          const docRes = await getDocumentsByStartup(selectedStartupId);
          if (docRes?.success && Array.isArray(docRes.documents)) {
            setDocuments(docRes.documents);
          }
        } else {
          // Fetch documents across all shortlisted startups
          const docPromises = valid.map((s) => getDocumentsByStartup(s.startup._id));
          const docResults = await Promise.allSettled(docPromises);
          let allDocs = [];
          docResults.forEach((res, idx) => {
            if (res.status === 'fulfilled' && res.value?.success && Array.isArray(res.value.documents)) {
              const startupInfo = valid[idx].startup;
              const docsWithStartup = res.value.documents.map((d) => ({ ...d, startupName: startupInfo.startupName }));
              allDocs = allDocs.concat(docsWithStartup);
            }
          });
          setDocuments(allDocs);
        }
      }
    } catch (err) {
      console.error('Error fetching investor documents:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (docId, fileName) => {
    try {
      const res = await downloadDocumentBlob(docId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setFeedback({ type: 'success', message: `Securely downloaded ${fileName}` });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to download document file. Access token may be expired or unauthorized.' });
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    if (categoryFilter !== 'all' && doc.category !== categoryFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (
        doc.title.toLowerCase().includes(term) ||
        doc.category.toLowerCase().includes(term) ||
        (doc.startupName && doc.startupName.toLowerCase().includes(term))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Workflow Navigation Bar */}
      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3 overflow-x-auto text-xs">
        <span className="text-slate-400 font-mono text-[10px] uppercase tracking-wider whitespace-nowrap">Workflow Nav</span>
        <div className="flex items-center gap-2">
          <Link to="/investor/discover" className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 transition-colors flex items-center gap-1.5 shrink-0">
            <Compass className="w-3.5 h-3.5 text-brand-400" /> Discover Engine
          </Link>
          <Link to="/investor/document-requests" className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 transition-colors flex items-center gap-1.5 shrink-0">
            <FileCheck className="w-3.5 h-3.5 text-amber-400" /> Document Requests
          </Link>

          <Link to="/investor/deals" className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 transition-colors flex items-center gap-1.5 shrink-0">
            <GitPullRequest className="w-3.5 h-3.5 text-indigo-400" /> Formal Deal Rooms
          </Link>
        </div>
      </div>

      {/* Action Feedback Notification Banner */}
      {feedback && (
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs ${feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white font-mono text-xs">Dismiss</button>
        </div>
      )}

      {/* Error Recovery Banner */}
      {isError && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-center justify-between gap-3 text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Unable to load data room documents from server. Please retry.</span>
          </div>
          <Button variant="outline" size="xs" icon={RefreshCw} onClick={fetchShortlistAndDocuments}>Retry</Button>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Investor Document Hub</h1>
            <p className="text-sm text-slate-400">Access pitch decks, financials, and diligence files for shortlisted and portfolio ventures.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="brand">{filteredDocuments.length} Accessible Documents</Badge>
            <Button variant="ghost" size="xs" icon={RefreshCw} onClick={fetchShortlistAndDocuments} />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, category, startup..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl pl-10 pr-3 py-2 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <Select
            value={selectedStartupId}
            onChange={(e) => setSelectedStartupId(e.target.value)}
            options={[
              { value: 'all', label: 'All Shortlisted Startups' },
              ...shortlisted.map((s) => ({ value: s.startup._id, label: s.startup.startupName })),
            ]}
          />

          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[{ value: 'all', label: 'All Categories' }, ...DOCUMENT_CATEGORIES.map((c) => ({ value: c, label: c }))]}
          />
        </div>
      </div>

      {/* Documents Grid */}
      {isLoading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Loading Data Room Documents...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <Card className="text-center py-16 px-4 space-y-4">
          <FileText className="w-12 h-12 text-slate-500 mx-auto" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-100">No Documents Available</h3>
            <p className="text-xs text-slate-400">Save interesting startups to your shortlist to view permitted data room materials.</p>
          </div>
          <Link to="/investor/discover">
            <Button variant="primary" size="sm" icon={Compass}>Explore Discovery Engine</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <div key={doc._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm line-clamp-1">{doc.title}</h3>
                    <p className="text-xs text-brand-400 font-medium">{doc.startupName || 'Startup Venture'}</p>
                  </div>
                  <Badge variant="brand" size="xs">{doc.category}</Badge>
                </div>

                {doc.description && <p className="text-xs text-slate-300 line-clamp-2">{doc.description}</p>}

                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-400 flex justify-between items-center">
                  <span>Size: {formatFileSize(doc.fileSize)}</span>
                  <span>v{doc.version}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center gap-2">
                <Link to={`/investor/due-diligence/${doc.startup}`} className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1">
                  <CheckSquare className="w-3.5 h-3.5 text-brand-400" /> Diligence
                </Link>
                <Button variant="primary" size="sm" icon={Download} onClick={() => handleDownload(doc._id, doc.originalFileName)}>
                  Secure Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvestorDocuments;

