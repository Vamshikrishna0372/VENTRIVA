import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';

export const UnauthorizedPage = () => {
  const { user } = useAuth();
  const targetDashboard = user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'founder' ? '/founder/dashboard' : '/investor/dashboard';

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center bg-slate-950">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6 shadow-xl shadow-rose-500/10">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-md">
        <Badge variant="rose">HTTP 403 — Access Denied</Badge>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Unauthorized Portal Access</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Your current account role <span className="text-slate-200 font-semibold">({user?.role || 'Guest'})</span> does not possess clearance to access this resource.
        </p>
      </div>

      <div className="mt-8 flex gap-4">
        <Link to={targetDashboard}>
          <Button variant="primary" icon={ArrowLeft}>
            Return to {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Home'} Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
