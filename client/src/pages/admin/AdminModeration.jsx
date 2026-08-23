import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, Search, Filter, Loader2, MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';

import { getModerationFlags, updateModerationFlag } from '../../services/adminService';

export const AdminModeration = () => {
  const [flags, setFlags] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resolution Modal / Inline State
  const [editingId, setEditingId] = useState(null);
  const [targetStatus, setTargetStatus] = useState('Resolved');
  const [resolutionNote, setResolutionNote] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchFlags();
  }, [statusFilter, priorityFilter, currentPage]);

  const fetchFlags = async () => {
    setIsLoading(true);
    try {
      const res = await getModerationFlags({
        status: statusFilter,
        priority: priorityFilter,
        page: currentPage,
        limit: 10,
      });

      if (res?.success && Array.isArray(res.flags)) {
        setFlags(res.flags);
        setPagination(res.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
      }
    } catch (err) {
      console.error('Error fetching moderation flags:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveResolution = async (flagId) => {
    setIsSubmitting(true);
    try {
      await updateModerationFlag(flagId, targetStatus, priorityFilter !== 'all' ? priorityFilter : undefined, resolutionNote);
      setEditingId(null);
      setResolutionNote('');
      fetchFlags();
    } catch (err) {
      alert('Failed to resolve moderation flag');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Moderation Flag Center</h1>
            <p className="text-sm text-slate-400">Audit user-reported flags, set priority status, and log resolution commentary.</p>
          </div>
          <Badge variant="rose">{pagination.total} Flags Reported</Badge>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800 max-w-md">
          <Select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'Open', label: 'Open' },
              { value: 'Under Review', label: 'Under Review' },
              { value: 'Resolved', label: 'Resolved' },
              { value: 'Dismissed', label: 'Dismissed' },
            ]}
          />

          <Select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'Low', label: 'Low' },
              { value: 'Medium', label: 'Medium' },
              { value: 'High', label: 'High' },
              { value: 'Critical', label: 'Critical' },
            ]}
          />
        </div>
      </div>

      {/* Flags List */}
      {isLoading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Loading Moderation Flags...</p>
        </div>
      ) : flags.length === 0 ? (
        <Card className="text-center py-16 px-4 space-y-4">
          <ShieldAlert className="w-12 h-12 text-slate-500 mx-auto" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-100">No Moderation Flags Reported</h3>
            <p className="text-xs text-slate-400">All user-submitted flags have been resolved or dismissed.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {flags.map((flag) => (
            <Card key={flag._id}>
              <CardBody className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="brand" size="xs">{flag.targetType.toUpperCase()}</Badge>
                    <Badge variant={flag.priority === 'Critical' ? 'rose' : flag.priority === 'High' ? 'amber' : 'indigo'} size="xs">
                      {flag.priority}
                    </Badge>
                    <Badge variant={flag.status === 'Open' ? 'rose' : flag.status === 'Resolved' ? 'emerald' : 'slate'} size="xs">
                      {flag.status}
                    </Badge>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500">
                    Reported by {flag.reportedBy?.name || 'User'} ({flag.reportedRole}) on {new Date(flag.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                  <p className="font-bold text-slate-200">Reason: {flag.reason}</p>
                  {flag.description && <p className="text-slate-400">{flag.description}</p>}
                </div>

                {flag.resolutionNote && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl text-xs text-emerald-300">
                    <strong>Resolution Note:</strong> {flag.resolutionNote}
                  </div>
                )}

                {editingId === flag._id ? (
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <Select
                      label="Set Resolution Status"
                      value={targetStatus}
                      onChange={(e) => setTargetStatus(e.target.value)}
                      options={[
                        { value: 'Resolved', label: 'Resolved' },
                        { value: 'Under Review', label: 'Under Review' },
                        { value: 'Dismissed', label: 'Dismissed' },
                      ]}
                    />
                    <textarea
                      rows={2}
                      placeholder="Add resolution note for audit log..."
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl border border-slate-800 p-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                      <Button variant="primary" size="sm" isLoading={isSubmitting} onClick={() => handleSaveResolution(flag._id)}>Save Resolution</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => { setEditingId(flag._id); setTargetStatus(flag.status); }}>
                      Resolve Flag
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

export default AdminModeration;
