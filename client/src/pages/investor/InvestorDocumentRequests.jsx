import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, Plus, Search, Download, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { DOCUMENT_CATEGORIES } from '../../utils/documentConstants';

import { getDocumentRequests, createDocumentRequest, downloadDocumentBlob } from '../../services/documentService';
import { getShortlist } from '../../services/shortlistService';

export const InvestorDocumentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [shortlisted, setShortlisted] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Request Form State
  const [showForm, setShowForm] = useState(false);
  const [selectedStartupId, setSelectedStartupId] = useState('');
  const [category, setCategory] = useState(DOCUMENT_CATEGORIES[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRequestsAndShortlist();
  }, []);

  const fetchRequestsAndShortlist = async () => {
    setIsLoading(true);
    try {
      const [reqRes, shortlistRes] = await Promise.all([
        getDocumentRequests(),
        getShortlist(),
      ]);

      if (reqRes?.success && Array.isArray(reqRes.requests)) {
        setRequests(reqRes.requests);
      }

      if (shortlistRes?.success && Array.isArray(shortlistRes.shortlists)) {
        const valid = shortlistRes.shortlists.filter((s) => s.startup !== null);
        setShortlisted(valid);
        if (valid.length > 0) setSelectedStartupId(valid[0].startup._id);
      }
    } catch (err) {
      console.error('Error fetching document requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!selectedStartupId) {
      alert('Please select a startup to request documents from.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createDocumentRequest({
        startupId: selectedStartupId,
        category,
        title: title.trim(),
        description: description.trim(),
        priority,
      });

      if (res?.success) {
        setShowForm(false);
        setTitle('');
        setDescription('');
        fetchRequestsAndShortlist();
      }
    } catch (err) {
      alert('Failed to submit document request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadResponse = async (docId, fileName) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Document Requests Center</h1>
            <p className="text-sm text-slate-400">Request specific due-diligence files from founders and track delivery status.</p>
          </div>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowForm(!showForm)}>
            New Document Request
          </Button>
        </div>
      </div>

      {/* New Request Modal/Card */}
      {showForm && (
        <Card className="border-brand-500/30 bg-slate-900">
          <CardHeader title="Request Document from Founder" />
          <CardBody>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select
                  label="Target Startup"
                  value={selectedStartupId}
                  onChange={(e) => setSelectedStartupId(e.target.value)}
                  options={shortlisted.map((s) => ({ value: s.startup._id, label: s.startup.startupName }))}
                />
                <Select
                  label="Document Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  options={DOCUMENT_CATEGORIES.map((c) => ({ value: c, label: c }))}
                />
                <Select
                  label="Priority Level"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  options={[
                    { value: 'Low', label: 'Low' },
                    { value: 'Medium', label: 'Medium' },
                    { value: 'High', label: 'High' },
                  ]}
                />
              </div>

              <Input
                label="Requested Document Title"
                placeholder="e.g. Updated Cap Table with Convertible Notes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <textarea
                rows={3}
                placeholder="Specific details or questions regarding the document..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl border border-slate-800 p-3 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />

              <div className="flex justify-end gap-2">
                <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button variant="primary" type="submit" isLoading={isSubmitting}>Submit Request</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Requests List */}
      {isLoading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Loading Document Requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <Card className="text-center py-16 px-4 space-y-4">
          <FileCheck className="w-12 h-12 text-slate-500 mx-auto" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-100">No Document Requests Submitted</h3>
            <p className="text-xs text-slate-400">Request custom financial models, customer evidence, or legal documents from founders.</p>
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
                    <Badge variant="indigo" size="xs">{req.startup?.startupName || 'Startup'}</Badge>
                    <Badge variant={req.status === 'Provided' ? 'emerald' : req.status === 'Rejected' ? 'rose' : 'amber'} size="xs">
                      {req.status}
                    </Badge>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400">
                    Requested on {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                  <p className="font-bold text-slate-200">Title: {req.title}</p>
                  {req.description && <p className="text-slate-400">{req.description}</p>}
                </div>

                {req.founderResponse && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl text-xs text-emerald-300">
                    <strong>Founder Response:</strong> {req.founderResponse}
                  </div>
                )}

                {req.responseDocument && (
                  <div className="pt-2 flex justify-end">
                    <Button variant="primary" size="sm" icon={Download} onClick={() => handleDownloadResponse(req.responseDocument._id, req.responseDocument.fileName)}>
                      Download Response File ({req.responseDocument.title})
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

export default InvestorDocumentRequests;
