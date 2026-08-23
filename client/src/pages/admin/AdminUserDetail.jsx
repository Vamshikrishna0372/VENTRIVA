import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  UserX,
  UserCheck,
  Building2,
  Mail,
  Calendar,
  Shield,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

import { getAdminUserById, updateUserStatus, updateUserVerification } from '../../services/adminService';

export const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [founderStartup, setFounderStartup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUserDetail();
  }, [id]);

  const fetchUserDetail = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminUserById(id);
      if (res?.success && res?.user) {
        setUserData(res.user);
        setFounderStartup(res.founderStartup || null);
      }
    } catch (err) {
      console.error('Error fetching user detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!userData) return;
    const actionWord = userData.isActive ? 'suspend' : 'activate';
    if (!window.confirm(`Are you sure you want to ${actionWord} account for ${userData.email}?`)) return;

    setIsSubmitting(true);
    try {
      await updateUserStatus(userData._id, !userData.isActive);
      fetchUserDetail();
    } catch (err) {
      alert(err?.response?.data?.message || `Failed to ${actionWord} user`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleVerification = async () => {
    if (!userData) return;
    setIsSubmitting(true);
    try {
      await updateUserVerification(userData._id, !userData.isVerified);
      fetchUserDetail();
    } catch (err) {
      alert('Failed to update verification status');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading User Profile...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center py-16 space-y-4">
        <Building2 className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-100">User Account Unavailable</h2>
        <Button variant="primary" icon={ArrowLeft} onClick={() => navigate('/admin/users')}>
          Back to User Management
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/admin/users')} />
            <h1 className="text-2xl font-bold text-slate-100">{userData.name}</h1>
            <Badge variant={userData.role === 'admin' ? 'rose' : userData.role === 'investor' ? 'indigo' : 'brand'}>
              {userData.role}
            </Badge>
            <Badge variant={userData.isActive ? 'emerald' : 'rose'}>
              {userData.isActive ? 'Active Account' : 'Suspended Account'}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono ml-8">{userData.email}</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            isLoading={isSubmitting}
            onClick={handleToggleVerification}
          >
            {userData.isVerified ? 'Unverify Account' : 'Verify Account'}
          </Button>

          {userData.role !== 'admin' && (
            <Button
              variant={userData.isActive ? 'rose' : 'emerald'}
              size="sm"
              isLoading={isSubmitting}
              onClick={handleToggleStatus}
            >
              {userData.isActive ? 'Suspend User' : 'Activate User'}
            </Button>
          )}
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="User Account Overview" />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Full Name</span>
                <span className="font-bold text-slate-100">{userData.name}</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Email Address</span>
                <span className="font-bold text-slate-100 text-xs font-mono">{userData.email}</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">User Role</span>
                <span className="font-bold text-brand-300 capitalize">{userData.role}</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Registered Date</span>
                <span className="font-bold text-slate-100">{new Date(userData.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Account Verification</span>
                <span className="font-bold text-emerald-400">{userData.isVerified ? 'Verified' : 'Unverified'}</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Account Status</span>
                <span className="font-bold text-slate-100">{userData.isActive ? 'Active' : 'Suspended'}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Associated Venture or Role Card */}
        <Card>
          <CardHeader title="Associated Platform Role" />
          <CardBody className="space-y-3">
            {userData.role === 'founder' ? (
              founderStartup ? (
                <div className="space-y-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">{founderStartup.startupName}</h4>
                      <p className="text-xs text-slate-400 font-mono">{founderStartup.sector} • {founderStartup.stage}</p>
                    </div>
                    <Badge variant="emerald">{founderStartup.profileCompletion}% Complete</Badge>
                  </div>
                  <Link to={`/admin/startups/${founderStartup._id}`}>
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      Review Startup Profile
                    </Button>
                  </Link>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No startup profile created yet by this founder.</p>
              )
            ) : userData.role === 'investor' ? (
              <div className="space-y-2 text-xs text-slate-300">
                <p><strong>Investor Account:</strong> Active discovery & evaluation privileges.</p>
              </div>
            ) : (
              <p className="text-xs text-rose-300 font-mono">Platform System Administrator</p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default AdminUserDetail;
