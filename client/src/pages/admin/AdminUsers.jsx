import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ShieldCheck, ShieldAlert, UserCheck, UserX, Eye, Loader2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';

import { getAdminUsers, updateUserStatus, updateUserVerification } from '../../services/adminService';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter, verificationFilter, currentPage]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAdminUsers({
        search: searchTerm,
        role: roleFilter,
        status: statusFilter,
        verification: verificationFilter,
        page: currentPage,
        limit: 10,
      });

      if (res?.success && Array.isArray(res.users)) {
        setUsers(res.users);
        setPagination(res.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
      } else {
        setError('Unable to load users. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err?.response?.data?.message || 'Unable to load users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const actionWord = user.isActive ? 'suspend' : 'activate';
    if (!window.confirm(`Are you sure you want to ${actionWord} account for ${user.email}?`)) return;

    try {
      await updateUserStatus(user._id, !user.isActive);
      fetchUsers();
    } catch (err) {
      alert(err?.response?.data?.message || `Failed to ${actionWord} user account`);
    }
  };

  const handleToggleVerification = async (user) => {
    try {
      await updateUserVerification(user._id, !user.isVerified);
      fetchUsers();
    } catch (err) {
      alert('Failed to update verification status');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">User Account Governance</h1>
            <p className="text-sm text-slate-400">Manage platform users, roles, account suspensions, and verification status.</p>
          </div>
          <Badge variant="brand">{pagination.total} Registered Accounts</Badge>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl pl-10 pr-3 py-2 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </form>

          <Select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
            options={[
              { value: 'all', label: 'All Roles' },
              { value: 'founder', label: 'Founders' },
              { value: 'investor', label: 'Investors' },
              { value: 'admin', label: 'Admins' },
            ]}
          />

          <Select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'suspended', label: 'Suspended' },
            ]}
          />

          <Select
            value={verificationFilter}
            onChange={(e) => { setVerificationFilter(e.target.value); setCurrentPage(1); }}
            options={[
              { value: 'all', label: 'All Verification' },
              { value: 'verified', label: 'Verified' },
              { value: 'unverified', label: 'Unverified' },
            ]}
          />
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Loading User Accounts...</p>
        </div>
      ) : users.length === 0 ? (
        <Card className="text-center py-16 px-4 space-y-4">
          <UserX className="w-12 h-12 text-slate-500 mx-auto" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-100">No User Accounts Found</h3>
            <p className="text-xs text-slate-400">Try adjusting your search terms or filter criteria.</p>
          </div>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 font-mono uppercase text-[10px] text-slate-400">
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Verification</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-semibold text-slate-100">
                    <div className="font-bold text-sm">{user.name}</div>
                    {(user.professionalTitle || user.organization) && (
                      <div className="text-[11px] text-brand-300 font-medium">
                        {[user.professionalTitle, user.organization].filter(Boolean).join(' • ')}
                      </div>
                    )}
                    <div className="text-xs font-mono text-slate-400 font-normal">{user.email}</div>
                  </td>
                  <td className="p-4">
                    <Badge variant={user.role === 'admin' ? 'rose' : user.role === 'investor' ? 'indigo' : 'brand'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant={user.isActive ? 'emerald' : 'rose'}>
                      {user.isActive ? 'Active' : 'Suspended'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    {user.isVerified ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Unverified</span>
                    )}
                  </td>
                  <td className="p-4 font-mono">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleVerification(user)}
                        className="text-xs text-slate-400 hover:text-emerald-400 p-1 transition-colors"
                        title={user.isVerified ? 'Unverify Account' : 'Verify Account'}
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>

                      {user.role !== 'admin' && (
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          className={`text-xs p-1 transition-colors ${user.isActive ? 'text-slate-400 hover:text-rose-400' : 'text-emerald-400 hover:text-emerald-300'}`}
                          title={user.isActive ? 'Suspend User' : 'Activate User'}
                        >
                          {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      )}

                      <Link to={`/admin/users/${user._id}`} className="text-slate-400 hover:text-brand-300 p-1">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Showing Page {pagination.page} of {pagination.pages}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= pagination.pages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
