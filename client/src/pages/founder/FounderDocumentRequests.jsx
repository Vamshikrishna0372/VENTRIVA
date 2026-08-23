import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, Upload, CheckCircle2, XCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

import { getDocumentRequests, updateDocumentRequest, getDocumentsByStartup } from '../../services/documentService';
import { getMyStartup } from '../../services/startupService';

export const FounderDocumentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [availableDocs, setAvailableDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [respondingId, setRespondingId] = useState(null);

  // Response Form State
  const [selectedDocId, setSelectedDocId] = useState('');
  const [founderNote, setFounderNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRequestsAndDocs();
  }, []);

  const fetchRequestsAndDocs = async () => {
    setIsLoading(true);
    try {
      const [reqRes, startupRes] = await Promise.all([
        getDocumentRequests(),
        getMyStartup(),
      ]);

      if (reqRes?.success && Array.isArray(reqRes.requests)) {
        setRequests(reqRes.requests);
      }

      if (startupRes?.success && startupRes?.startup) {
        const docsRes = await getDocumentsByStartup(startupRes.startup._id);
        if (docsRes?.success && Array.isArray(docsRes.documents)) {
          setAvailableDocs(docsRes.documents);
        }
      }
    } catch (err) {
      console.error('Error fetching document requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespond = async (requestId) => {
    setIsSubmitting(true);
    try {
      await updateDocumentRequest(requestId, {
        status: 'Provided',
        founderResponse: founderNote,
        responseDocumentId: selectedDocId || undefined,
      });
      setRespondingId(null);
      setFounderNote('');
      setSelectedDocId('');
      fetchRequestsAndDocs();
    } catch (err) {
      alert('Failed to respond to document request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (requestId) => {
    const reason = window.prompt('Provide rejection reason for investor:');
    if (!reason) return;

    setIsSubmitting(true);
    try {
      await updateDocumentRequest(requestId, {
        status: 'Rejected',
        founderResponse: reason,
      });
      fetchRequestsAndDocs();
    } catch (err) {
      alert('Failed to reject request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Document Requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to="/founder/documents">
                <Button variant="ghost" size="sm" icon={ArrowLeft} />
              </Link>
              <h1 className="text-2xl font-bold text-slate-100">Investor Document Requests</h1>
            </div>
            <p className="text-sm text-slate-400">Respond to formal document requests submitted by interested investors.</p>
          </div>
          <Badge variant="brand">{requests.length} Total Requests</Badge>
        </div>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <Card className="text-center py-16 px-4 space-y-4">
          <FileCheck className="w-12 h-12 text-slate-500 mx-auto" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-100">No Document Requests</h3>
            <p className="text-xs text-slate-400">When investors request additional documents during due-diligence, they will appear here.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req._id}>
              <CardBody className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="brand" size="xs">{req.category}</Badge>
                    <Badge variant={req.priority === 'High' ? 'rose' : 'indigo'} size="xs">{req.priority} Priority</Badge>
                    <Badge variant={req.status === 'Provided' ? 'emerald' : req.status === 'Rejected' ? 'rose' : 'amber'} size="xs">
                      {req.status}
                    </Badge>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400">
                    Requested by {req.investor?.name || 'Investor'} ({req.investor?.organization || 'Individual'}) on {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                  <p className="font-bold text-slate-200">Title: {req.title}</p>
                  {req.description && <p className="text-slate-400">{req.description}</p>}
                </div>

                {req.founderResponse && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl text-xs text-emerald-300">
                    <strong>Your Response:</strong> {req.founderResponse}
                  </div>
                )}

                {respondingId === req._id ? (
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 block">Attach Data Room File (Optional):</label>
                      <select
                        value={selectedDocId}
                        onChange={(e) => setSelectedDocId(e.target.value)}
                        className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl px-3 py-2 border border-slate-800 focus:outline-none"
                      >
                        <option value="">No file attached</option>
                        {availableDocs.map((d) => (
                          <option key={d._id} value={d._id}>
                            {d.title} ({d.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    <textarea
                      rows={2}
                      placeholder="Add commentary for investor..."
                      value={founderNote}
                      onChange={(e) => setFounderNote(e.target.value)}
                      className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl border border-slate-800 p-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />

                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setRespondingId(null)}>Cancel</Button>
                      <Button variant="primary" size="sm" isLoading={isSubmitting} onClick={() => handleRespond(req._id)}>Send Response</Button>
                    </div>
                  </div>
                ) : (
                  req.status === 'Requested' && (
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" icon={XCircle} onClick={() => handleReject(req._id)}>
                        Reject
                      </Button>
                      <Button variant="emerald" size="sm" icon={CheckCircle2} onClick={() => setRespondingId(req._id)}>
                        Respond & Attach Document
                      </Button>
                    </div>
                  )
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FounderDocumentRequests;
