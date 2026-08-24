import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, LogOut, User, Settings, ShieldCheck, ChevronDown, Bell, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationPanel from '../notifications/NotificationPanel';

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isAuthPage = location.pathname.startsWith('/login') || location.pathname.startsWith('/register');
  const isAppDashboard =
    location.pathname.startsWith('/founder') ||
    location.pathname.startsWith('/investor') ||
    location.pathname.startsWith('/admin');

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'founder') return '/founder/dashboard';
    return '/investor/dashboard';
  };

  const getProfileLink = () => {
    if (!user) return '/';
    if (user.role === 'founder') return '/founder/profile';
    if (user.role === 'investor') return '/investor/settings';
    if (user.role === 'admin') return '/admin/settings';
    return '/';
  };

  const getSettingsLink = () => {
    if (!user) return '/';
    if (user.role === 'founder') return '/founder/profile';
    if (user.role === 'investor') return '/investor/settings';
    if (user.role === 'admin') return '/admin/settings';
    return '/';
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to={isAuthenticated && user ? getDashboardLink() : "/"} className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-100 tracking-tight">VENTRIVA</span>
              <Badge variant="brand" size="xs">Platform Active</Badge>
            </div>
            <p className="text-[10px] text-slate-400 -mt-1 hidden sm:block">Private Discovery Platform</p>
          </div>
        </Link>

        {/* Center Navigation (Public Pages Only) */}
        {!isAppDashboard && (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link to={isAuthenticated && user ? getDashboardLink() : "/"} className="hover:text-white transition-colors">Overview</Link>
            <Link to={isAuthenticated && user ? getDashboardLink() : "/login"} className="hover:text-white transition-colors">Discovery Portal</Link>
            <Link to={isAuthenticated && user ? getDashboardLink() : "/register"} className="hover:text-white transition-colors">Registration</Link>
          </nav>
        )}

        {/* Header Right Side: Authenticated Workspace Controls vs Public Auth Buttons */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {/* Theme Switcher Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all focus:outline-none"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              </button>

              {/* Notification Control */}
              <NotificationPanel />

              {/* Account Dropdown Trigger */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all focus:outline-none"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-300 font-bold text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden sm:flex flex-col items-start text-left text-xs">
                    <span className="font-bold text-slate-100 leading-tight">{user.name}</span>
                    <span className="text-[10px] text-slate-400 capitalize font-mono">{user.role}</span>
                  </div>
                  <Badge
                    variant={user.role === 'admin' ? 'rose' : user.role === 'founder' ? 'emerald' : 'brand'}
                    size="xs"
                    className="hidden md:inline-flex"
                  >
                    {user.role}
                  </Badge>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Account Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 py-2 divide-y divide-slate-800/80 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User Info Header */}
                    <div className="px-4 py-3 space-y-1">
                      <p className="text-xs font-bold text-slate-100 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">{user.email}</p>
                      <div className="pt-1">
                        <Badge variant={user.role === 'admin' ? 'rose' : user.role === 'founder' ? 'emerald' : 'brand'} size="xs">
                          Active Role: {user.role?.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="py-1 text-xs font-medium">
                      <Link
                        to={getDashboardLink()}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                        <span>Dashboard Overview</span>
                      </Link>
                      <Link
                        to={getProfileLink()}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
                      >
                        <User className="w-4 h-4 text-brand-400" />
                        <span>Profile Details</span>
                      </Link>
                      <Link
                        to={getSettingsLink()}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-indigo-400" />
                        <span>Account & Workspace</span>
                      </Link>
                    </div>

                    {/* Sign Out Action */}
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            !isAuthPage && (
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all focus:outline-none"
                  title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                  aria-label="Toggle Theme"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                </button>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Create Account
                  </Button>
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
