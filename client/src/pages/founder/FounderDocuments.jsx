import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Upload,
  Search,
  Filter,
  Download,
  History,
  Trash2,
  Lock,
  Eye,
  Plus,
  Loader2,
  CheckCircle2,
  Building2,
  FileCheck
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';

import DocumentUploadModal from '../../components/documents/DocumentUploadModal';
import DocumentVersionHistoryModal from '../../components/documents/DocumentVersionHistoryModal';
import { DOCUMENT_CATEGORIES, DOCUMENT_VISIBILITY, formatFileSize } from '../../utils/documentConstants';
import { getMyStartup } from '../../services/startupService';
import { getDocumentsByStartup, downloadDocumentBlob, deleteDocument } from '../../services/documentService';

export const FounderDocuments = () => {
  const [startup, setStartup] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [versioningDoc, setVersioningDoc] = useState(null);
  const [historyDoc, setHistoryDoc] = useState(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const startupRes = await getMyStartup();
      if (startupRes?.success && startupRes?.startup) {
        setStartup(startupRes.startup);
        const docRes = await getDocumentsByStartup(startupRes.startup._id);
        if (docRes?.success && Array.isArray(docRes.documents)) {
          setDocuments(docRes.documents);
        }
      }
    } catch (err) {
      console.error('Error fetching founder documents:', err);
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
    } catch (err) {
      alert('Failed to download document file');
    }
  };

  const handleDelete = async (docId, title) => {
    if (!window.confirm(`Are you sure you want to delete ${title}? This action removes all version history.`)) return;

    try {
      await deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d._id !== docId));
    } catch (err) {
      alert('Failed to delete document');
    }
  };

  const primaryPitchDeck = documents.find((d) => d.category === 'Pitch Deck' && d.isPrimary);

  const filteredDocuments = documents.filter((doc) => {
    if (categoryFilter !== 'all' && doc.category !== categoryFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return doc.title.toLowerCase().includes(term) || doc.category.toLowerCase().includes(term);
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Data Room Workspace...</p>
      </div>
    );
  }

  if (!startup) {
    return (
      <Card className="text-center py-16 px-4 space-y-4">
        <Building2 className="w-12 h-12 text-slate-500 mx-auto" />
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-lg font-bold text-slate-100">Create Startup Profile First</h3>
          <p className="text-xs text-slate-400">Complete your startup profile to unlock your Virtual Data Room (VDR).</p>
        </div>
        <Link to="/founder/startup">
          <Button variant="primary" size="sm">Create Startup Profile</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-100">Virtual Data Room (VDR)</h1>
              <Badge variant="brand">{documents.length} Files Uploaded</Badge>
            </div>
            <p className="text-sm text-slate-400">
              Manage pitch decks, financial models, cap tables, and legal materials with secure access controls.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/founder/document-requests">
              <Button variant="outline" size="sm" icon={FileCheck}>
                Investor Requests
              </Button>
            </Link>
            <Button variant="primary" size="sm" icon={Plus} onClick={() => { setVersioningDoc(null); setShowUploadModal(true); }}>
              Upload Document
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
          <div className="relative col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents by title or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl pl-10 pr-3 py-2 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[{ value: 'all', label: 'All Document Categories' }, ...DOCUMENT_CATEGORIES.map((c) => ({ value: c, label: c }))]}
          />
        </div>
      </div>

      {/* Primary Pitch Deck Highlight Banner */}
      {primaryPitchDeck && (
        <div className="bg-gradient-to-r from-brand-900/30 via-slate-900 to-indigo-950/40 border border-brand-500/30 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-sm">{primaryPitchDeck.title}</h3>
                <Badge variant="emerald" size="xs">PRIMARY PITCH DECK</Badge>
                <Badge variant="slate" size="xs">v{primaryPitchDeck.version}</Badge>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {formatFileSize(primaryPitchDeck.fileSize)} • Updated {new Date(primaryPitchDeck.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" icon={Download} onClick={() => handleDownload(primaryPitchDeck._id, primaryPitchDeck.originalFileName)}>
              Download Deck
            </Button>
            <Button variant="primary" size="sm" icon={Upload} onClick={() => { setVersioningDoc(primaryPitchDeck); setShowUploadModal(true); }}>
              Upload New Version
            </Button>
          </div>
        </div>
      )}

      {/* Documents Grid / List */}
      {filteredDocuments.length === 0 ? (
        <Card className="text-center py-16 px-4 space-y-4">
          <FileText className="w-12 h-12 text-slate-500 mx-auto" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-100">No Documents Found</h3>
            <p className="text-xs text-slate-400">Upload your pitch deck, financial model, and cap table to share with interested investors.</p>
          </div>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => { setVersioningDoc(null); setShowUploadModal(true); }}>
            Upload First Document
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <div key={doc._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm line-clamp-1">{doc.title}</h3>
                    <p className="text-xs text-slate-400 font-mono">{doc.category}</p>
                  </div>
                  <Badge variant={doc.visibility === 'Founder Only' ? 'rose' : 'brand'} size="xs">
                    {doc.visibility}
                  </Badge>
                </div>

                {doc.description && <p className="text-xs text-slate-300 line-clamp-2">{doc.description}</p>}

                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-400 flex justify-between items-center">
                  <span>Size: {formatFileSize(doc.fileSize)}</span>
                  <span>Version: v{doc.version}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleDelete(doc._id, doc.title)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 transition-colors"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setHistoryDoc(doc)}
                    className="text-slate-400 hover:text-slate-200 p-1.5 transition-colors"
                    title="Version History"
                  >
                    <History className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" icon={Upload} onClick={() => { setVersioningDoc(doc); setShowUploadModal(true); }}>
                    Replace
                  </Button>
                  <Button variant="primary" size="sm" icon={Download} onClick={() => handleDownload(doc._id, doc.originalFileName)}>
                    Download
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload / Version Modal */}
      {showUploadModal && (
        <DocumentUploadModal
          startupId={startup._id}
          documentToVersion={versioningDoc}
          onClose={() => { setShowUploadModal(false); setVersioningDoc(null); }}
          onSuccess={() => fetchData()}
        />
      )}

      {/* Version History Modal */}
      {historyDoc && (
        <DocumentVersionHistoryModal
          document={historyDoc}
          onClose={() => setHistoryDoc(null)}
        />
      )}
    </div>
  );
};

export default FounderDocuments;
