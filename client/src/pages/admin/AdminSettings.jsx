import React, { useState } from 'react';
import { Shield, Lock, CheckCircle2, AlertCircle, Key, Server, User } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const AdminSettings = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (newPassword.length < 8) {
      setFeedback({ type: 'error', message: 'New password must be at least 8 characters long' });
      return;
    }


    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'New passwords do not match' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.put('/auth/password', { currentPassword, newPassword });
      if (response.data?.success) {
        setFeedback({ type: 'success', message: 'Admin security password updated successfully' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setFeedback({ type: 'error', message: response.data?.message || 'Failed to update password' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err?.response?.data?.message || 'Current password invalid or change failed' });
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
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-100">Administrator Security Settings</h1>
              <Badge variant="rose">SYSTEM ADMIN</Badge>
            </div>
            <p className="text-sm text-slate-400">Manage administrator account credentials, active session parameters, and security policies.</p>
          </div>
          <Badge variant="brand">Ventriva Platform v1.0.0</Badge>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Password Update */}
        <Card className="lg:col-span-2">
          <CardHeader title="Security Credentials Update" subtitle="Change administrator password" />
          <CardBody>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                icon={Lock}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  icon={Key}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={Key}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="primary" type="submit" isLoading={isSubmitting}>
                  Update Admin Password
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Right Column: Session & System Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Administrator Identity" />
            <CardBody className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <p className="font-bold text-slate-100">{user?.name}</p>
                <p className="font-mono text-slate-400">{user?.email}</p>
                <Badge variant="rose" size="xs">SYSTEM ADMIN</Badge>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-1 text-slate-400">
                <p><strong>Environment:</strong> Production / Node.js</p>
                <p><strong>Database:</strong> MongoDB Persistent Cluster</p>
                <p><strong>Platform Core:</strong> Ventriva Governance Engine</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
