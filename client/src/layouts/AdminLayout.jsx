import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  CheckCircle2,
  ShieldAlert,
  BarChart3,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users & Roles', path: '/admin/users', icon: Users },
    { label: 'Startup Governance', path: '/admin/startups', icon: Building2 },
    { label: 'Verification Queue', path: '/admin/verification', icon: CheckCircle2 },
    { label: 'Moderation Flags', path: '/admin/moderation', icon: ShieldAlert },
    { label: 'Platform Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: History },
    { label: 'Admin Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-brand-500" />
          <span className="font-extrabold text-slate-100 text-lg tracking-wider">VENTRIVA <span className="text-xs text-brand-400 font-mono font-normal">ADMIN</span></span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-400 hover:text-slate-100"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-[calc(100vh-65px)] md:h-screen md:sticky md:top-0 shrink-0 z-30 ${mobileOpen ? 'block' : 'hidden md:flex'}`}>
        {/* Header / Brand Section */}
        <div className="p-4 border-b border-slate-800/60 shrink-0">
          <div className="hidden md:flex items-center gap-2.5 px-2">
            <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-slate-100 text-lg block leading-none">VENTRIVA</span>
              <span className="text-[10px] font-mono text-brand-400 uppercase tracking-widest block mt-0.5">Control Center</span>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Section */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0 space-y-1">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Logout Section (Always Sticky at Bottom) */}
        <div className="p-4 border-t border-slate-800 shrink-0 mt-auto bg-slate-900/95 space-y-3">
          <Link to="/admin/dashboard" className="flex items-center justify-between px-2 hover:bg-slate-800/50 p-1.5 rounded-xl transition-colors cursor-pointer">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-100 line-clamp-1">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-slate-400 font-mono line-clamp-1">{user?.email}</p>
            </div>
            <Badge variant="rose" size="xs">ADMIN</Badge>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 focus:ring-2 focus:ring-rose-500/40 focus:outline-none transition-all border border-rose-500/20 active:scale-[0.98]"
            aria-label="Sign out of Ventriva Admin"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Administrative Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
