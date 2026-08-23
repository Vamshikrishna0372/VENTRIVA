import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, MessageSquare, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';

import { getModerationFlags, updateModerationFlag } from '../../services/adminService';

export const AdminCommunication = () => {
  const [flags, setFlags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [targetStatus, setTargetStatus] = useState('Resolved');
  const [resolutionNote, setResolutionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchFlags();
  }, []);

  const fetchFlags = async () => {
    setIsLoading(true);
    try {
      const res = await getModerationFlags({ status: 'all', limit: 20 });
      if (res?.success && Array.isArray(res.flags)) {
        setFlags(res.flags);
      }
    } catch (err) {
      console.error('Error loading communication governance flags:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveResolution = async (flagId) => {
    setIsSubmitting(true);
    try {
      await updateModerationFlag(flagId, targetStatus, undefined, resolutionNote);
      setEditingId(null);
      setResolutionNote('');
      fetchFlags();
    } catch (err) {
      alert('Failed to update governance flag');
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
            <h1 className="text-2xl font-bold text-slate-100">Communication Governance</h1>
            <p className="text-sm text-slate-400">Review reported messages, meeting harassment flags, and platform engagement moderation audit logs.</p>
          </div>
          <Badge variant="rose">{flags.length} Reported Flags</Badge>
        </div>
      </div>

      {/* Flags List */}
      {isLoading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Loading Communication Governance...</p>
        </div>
      ) : flags.length === 0 ? (
        <Card className="text-center py-16 px-4 space-y-4">
          <ShieldAlert className="w-12 h-12 text-slate-500 mx-auto" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-100">No Reported Communication Flags</h3>
            <p className="text-xs text-slate-400">All user-submitted communication flags have been audited and resolved.</p>
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
                    <Badge variant={flag.priority === 'Critical' ? 'rose' : 'amber'} size="xs">{flag.priority}</Badge>
                    <Badge variant={flag.status === 'Open' ? 'rose' : 'emerald'} size="xs">{flag.status}</Badge>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Reported on {new Date(flag.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                  <p className="font-bold text-slate-200">Reason: {flag.reason}</p>
                  {flag.description && <p className="text-slate-400">{flag.description}</p>}
                </div>

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
                      placeholder="Add governance resolution note..."
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl border border-slate-800 p-2 focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                      <Button variant="primary" size="sm" isLoading={isSubmitting} onClick={() => handleSaveResolution(flag._id)}>Save Resolution</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => { setEditingId(flag._id); setTargetStatus(flag.status); }}>
                      Resolve Governance Flag
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

export default AdminCommunication;
