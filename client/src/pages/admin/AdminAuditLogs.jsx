import React, { useState, useEffect } from 'react';
import { History, Search, Filter, Shield, Loader2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';

import { getAdminAuditLogs } from '../../services/adminService';

export const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [targetTypeFilter, setTargetTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, targetTypeFilter, currentPage]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminAuditLogs({
        search: searchTerm,
        action: actionFilter,
        targetType: targetTypeFilter,
        page: currentPage,
        limit: 15,
      });

      if (res?.success && Array.isArray(res.logs)) {
        setLogs(res.logs);
        setPagination(res.pagination || { page: 1, limit: 15, total: 0, pages: 1 });
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLogs();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Administrative Audit Trail</h1>
            <p className="text-sm text-slate-400">Immutable chronological log of system administration and governance events.</p>
          </div>
          <Badge variant="brand">{pagination.total} Logged Audit Events</Badge>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl pl-10 pr-3 py-2 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </form>

          <Select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}
            options={[
              { value: 'all', label: 'All Action Types' },
              { value: 'USER_SUSPENDED', label: 'USER_SUSPENDED' },
              { value: 'USER_ACTIVATED', label: 'USER_ACTIVATED' },
              { value: 'USER_VERIFIED', label: 'USER_VERIFIED' },
              { value: 'STARTUP_VERIFIED', label: 'STARTUP_VERIFIED' },
              { value: 'STARTUP_REJECTED', label: 'STARTUP_REJECTED' },
              { value: 'STARTUP_PUBLISHED', label: 'STARTUP_PUBLISHED' },
              { value: 'FLAG_RESOLVED', label: 'FLAG_RESOLVED' },
            ]}
          />

          <Select
            value={targetTypeFilter}
            onChange={(e) => { setTargetTypeFilter(e.target.value); setCurrentPage(1); }}
            options={[
              { value: 'all', label: 'All Target Models' },
              { value: 'User', label: 'User' },
              { value: 'Startup', label: 'Startup' },
              { value: 'ModerationFlag', label: 'ModerationFlag' },
            ]}
          />
        </div>
      </div>

      {/* Audit Log Table */}
      {isLoading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Loading Audit Logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <Card className="text-center py-16 px-4 space-y-4">
          <History className="w-12 h-12 text-slate-500 mx-auto" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-100">No Audit Events Logged</h3>
            <p className="text-xs text-slate-400">Try adjusting your search criteria.</p>
          </div>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 font-mono uppercase text-[10px] text-slate-400">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Action</th>
                <th className="p-4">Description</th>
                <th className="p-4">Administrator</th>
                <th className="p-4">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-slate-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-4">
                    <Badge variant="brand" size="xs">{log.action}</Badge>
                  </td>
                  <td className="p-4 font-sans text-slate-200">{log.description}</td>
                  <td className="p-4">
                    <div className="font-bold text-slate-100">{log.admin?.name || 'Admin'}</div>
                    <div className="text-[10px] text-slate-500">{log.admin?.email}</div>
                  </td>
                  <td className="p-4 text-slate-400">
                    {log.targetType} #{log.targetId ? log.targetId.substring(0, 8) : '—'}
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

export default AdminAuditLogs;
