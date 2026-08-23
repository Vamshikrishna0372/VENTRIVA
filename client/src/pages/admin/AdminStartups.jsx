import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Building2, CheckCircle2, XCircle, Eye, Globe, ShieldCheck, Loader2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { SECTORS, STAGES } from '../../utils/constants';

import { getAdminStartups, updateStartupPublication } from '../../services/adminService';

export const AdminStartups = () => {
  const [startups, setStartups] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [publicationFilter, setPublicationFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchStartups();
  }, [sectorFilter, stageFilter, verificationFilter, publicationFilter, currentPage]);

  const [error, setError] = useState(null);

  const fetchStartups = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAdminStartups({
        search: searchTerm,
        sector: sectorFilter,
        stage: stageFilter,
        verificationStatus: verificationFilter,
        isPublished: publicationFilter === 'all' ? undefined : publicationFilter,
        page: currentPage,
        limit: 10,
      });

      if (res?.success && Array.isArray(res.startups)) {
        setStartups(res.startups);
        setPagination(res.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
      } else {
        setError('Unable to load startups. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching admin startups:', err);
      setError(err?.response?.data?.message || 'Unable to load startups. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePublication = async (startup) => {
    const actionWord = startup.isPublished ? 'unpublish' : 'publish';
    if (!window.confirm(`Are you sure you want to ${actionWord} ${startup.startupName}?`)) return;

    try {
      await updateStartupPublication(startup._id, !startup.isPublished, startup.isPublished ? 'Private' : 'Investors Only');
      fetchStartups();
    } catch (err) {
      alert('Failed to update publication status');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchStartups();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Startup Profile Governance</h1>
            <p className="text-sm text-slate-400">Review startup completeness, control publication status, and perform verification audit.</p>
          </div>
          <Badge variant="brand">{pagination.total} Total Ventures</Badge>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2 border-t border-slate-800">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, sector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl pl-10 pr-3 py-2 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </form>

          <Select
            value={sectorFilter}
            onChange={(e) => { setSectorFilter(e.target.value); setCurrentPage(1); }}
            options={[{ value: 'all', label: 'All Sectors' }, ...SECTORS.map((s) => ({ value: s, label: s }))]}
          />

          <Select
            value={stageFilter}
            onChange={(e) => { setStageFilter(e.target.value); setCurrentPage(1); }}
            options={[{ value: 'all', label: 'All Stages' }, ...STAGES.map((s) => ({ value: s, label: s }))]}
          />

          <Select
            value={verificationFilter}
            onChange={(e) => { setVerificationFilter(e.target.value); setCurrentPage(1); }}
            options={[
              { value: 'all', label: 'All Verification' },
              { value: 'Verified', label: 'Verified' },
              { value: 'Pending Review', label: 'Pending Review' },
              { value: 'Rejected', label: 'Rejected' },
              { value: 'Unverified', label: 'Unverified' },
            ]}
          />

          <Select
            value={publicationFilter}
            onChange={(e) => { setPublicationFilter(e.target.value); setCurrentPage(1); }}
            options={[
              { value: 'all', label: 'All Publication' },
              { value: 'true', label: 'Published' },
              { value: 'false', label: 'Unpublished' },
            ]}
          />
        </div>
      </div>

      {/* Startups Table */}
      {isLoading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Loading Startup Records...</p>
        </div>
      ) : startups.length === 0 ? (
        <Card className="text-center py-16 px-4 space-y-4">
          <Building2 className="w-12 h-12 text-slate-500 mx-auto" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-100">No Startups Found</h3>
            <p className="text-xs text-slate-400">Try adjusting your search query or governance filters.</p>
          </div>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 font-mono uppercase text-[10px] text-slate-400">
                <th className="p-4">Startup</th>
                <th className="p-4">Founder</th>
                <th className="p-4">Taxonomy</th>
                <th className="p-4">Verification</th>
                <th className="p-4">Publication</th>
                <th className="p-4">Completion</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {startups.map((startup) => (
                <tr key={startup._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {startup.startupName ? startup.startupName.substring(0, 2).toUpperCase() : 'ST'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-100 text-sm">{startup.startupName}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{startup.tagline}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-200">{startup.founder?.name || 'Unknown'}</div>
                    <div className="text-[10px] font-mono text-slate-400">{startup.founder?.email}</div>
                  </td>
                  <td className="p-4 font-mono">
                    <div>{startup.sector}</div>
                    <div className="text-slate-500 text-[10px]">{startup.stage}</div>
                  </td>
                  <td className="p-4">
                    <Badge variant={startup.verificationStatus === 'Verified' ? 'emerald' : startup.verificationStatus === 'Rejected' ? 'rose' : 'amber'}>
                      {startup.verificationStatus || (startup.isVerified ? 'Verified' : 'Unverified')}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => handleTogglePublication(startup)}
                      className="hover:underline cursor-pointer"
                    >
                      <Badge variant={startup.isPublished ? 'brand' : 'slate'}>
                        {startup.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-200">{startup.profileCompletion}%</span>
                      <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-brand-500 h-1.5 rounded-full"
                          style={{ width: `${startup.profileCompletion}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <Link to={`/admin/startups/${startup._id}`} className="text-slate-400 hover:text-brand-300 p-1 inline-block">
                      <Eye className="w-4 h-4" />
                    </Link>
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

export default AdminStartups;
