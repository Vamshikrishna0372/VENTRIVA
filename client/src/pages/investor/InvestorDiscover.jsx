import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, RefreshCw, X, ChevronLeft, ChevronRight, Loader2, Building2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

import StartupCard from '../../components/investor/StartupCard';
import { SECTORS, SECTOR_CONFIG, STAGES, BUSINESS_MODELS, FUNDRAISING_STATUSES } from '../../utils/constants';
import { discoverStartups } from '../../services/discoveryService';
import { getShortlist, addToShortlist, removeFromShortlist } from '../../services/shortlistService';

export const InvestorDiscover = () => {
  const [startups, setStartups] = useState([]);
  const [shortlistedIds, setShortlistedIds] = useState(new Set());
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, totalPages: 1 });

  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    sector: 'all',
    subSector: 'all',
    stage: 'all',
    businessModel: 'all',
    fundraisingStatus: 'all',
    country: '',
    minFunding: '',
    maxFunding: '',
    sort: 'newest',
  });

  useEffect(() => {
    fetchDiscoveryData();
  }, [filters, pagination.page]);

  useEffect(() => {
    fetchShortlistIds();
  }, []);

  const fetchShortlistIds = async () => {
    try {
      const res = await getShortlist();
      if (res?.success && Array.isArray(res.shortlists)) {
        const ids = new Set(res.shortlists.map((s) => s.startup?._id).filter(Boolean));
        setShortlistedIds(ids);
      }
    } catch (err) {
      console.error('Error fetching shortlist:', err);
    }
  };

  const fetchDiscoveryData = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sort: filters.sort,
      };

      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (filters.sector !== 'all') params.sector = filters.sector;
      if (filters.subSector !== 'all') params.subSector = filters.subSector;
      if (filters.stage !== 'all') params.stage = filters.stage;
      if (filters.businessModel !== 'all') params.businessModel = filters.businessModel;
      if (filters.fundraisingStatus !== 'all') params.fundraisingStatus = filters.fundraisingStatus;
      if (filters.country.trim()) params.country = filters.country.trim();
      if (filters.minFunding) params.minFunding = filters.minFunding;
      if (filters.maxFunding) params.maxFunding = filters.maxFunding;

      const res = await discoverStartups(params);

      if (res?.success && res?.data) {
        setStartups(res.data.startups || []);
        setPagination(res.data.pagination || { page: 1, limit: 9, total: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error('Error discovering startups:', err);
      setStartups([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchDiscoveryData();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const updated = { ...prev, [name]: value };
      // Reset subSector if sector changes
      if (name === 'sector') updated.subSector = 'all';
      return updated;
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({
      sector: 'all',
      subSector: 'all',
      stage: 'all',
      businessModel: 'all',
      fundraisingStatus: 'all',
      country: '',
      minFunding: '',
      maxFunding: '',
      sort: 'newest',
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleToggleShortlist = async (startupId, shouldAdd) => {
    try {
      if (shouldAdd) {
        await addToShortlist(startupId);
        setShortlistedIds((prev) => new Set([...prev, startupId]));
      } else {
        await removeFromShortlist(startupId);
        setShortlistedIds((prev) => {
          const next = new Set(prev);
          next.delete(startupId);
          return next;
        });
      }
    } catch (err) {
      console.error('Error toggling shortlist:', err);
    }
  };

  const subSectorOptions =
    filters.sector !== 'all' && SECTOR_CONFIG[filters.sector]
      ? SECTOR_CONFIG[filters.sector]
      : [];

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Startup Discovery Engine</h1>
            <p className="text-sm text-slate-400">Search and filter active rounds across verified venture sectors.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Filter}
              className="lg:hidden"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            >
              Filters
            </Button>
            <span className="text-xs font-mono text-slate-400">
              Showing {pagination.total} Startups
            </span>
          </div>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search startup name, tagline, sector, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl pl-10 pr-4 py-2.5 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            />
          </div>
          <Button type="submit" variant="primary" size="sm">
            Search
          </Button>
        </form>
      </div>

      {/* Main Grid & Filters Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Desktop Filter Sidebar */}
        <div className={`lg:block ${isMobileFilterOpen ? 'block' : 'hidden'} space-y-4`}>
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-400" /> Filter Discovery
              </h3>
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs text-brand-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Sort Control */}
            <Select
              label="Sort Results By"
              name="sort"
              value={filters.sort}
              onChange={handleFilterChange}
              options={[
                { value: 'newest', label: 'Newest Additions' },
                { value: 'completeness', label: 'Profile Completeness' },
                { value: 'funding-asc', label: 'Target Funding: Low to High' },
                { value: 'funding-desc', label: 'Target Funding: High to Low' },
                { value: 'growth-desc', label: 'Revenue Growth' },
              ]}
            />

            {/* Sector */}
            <Select
              label="Primary Sector"
              name="sector"
              value={filters.sector}
              onChange={handleFilterChange}
              options={[{ value: 'all', label: 'All Sectors' }, ...SECTORS.map((s) => ({ value: s, label: s }))]}
            />

            {/* Dynamic Sub-sector */}
            {subSectorOptions.length > 0 && (
              <Select
                label="Sub-sector Taxonomy"
                name="subSector"
                value={filters.subSector}
                onChange={handleFilterChange}
                options={[{ value: 'all', label: 'All Sub-sectors' }, ...subSectorOptions.map((sub) => ({ value: sub, label: sub }))]}
              />
            )}

            {/* Stage */}
            <Select
              label="Startup Stage"
              name="stage"
              value={filters.stage}
              onChange={handleFilterChange}
              options={[{ value: 'all', label: 'All Stages' }, ...STAGES.map((stg) => ({ value: stg, label: stg }))]}
            />

            {/* Business Model */}
            <Select
              label="Business Model"
              name="businessModel"
              value={filters.businessModel}
              onChange={handleFilterChange}
              options={[{ value: 'all', label: 'All Business Models' }, ...BUSINESS_MODELS.map((bm) => ({ value: bm, label: bm }))]}
            />

            {/* Fundraising Status */}
            <Select
              label="Fundraising Status"
              name="fundraisingStatus"
              value={filters.fundraisingStatus}
              onChange={handleFilterChange}
              options={[{ value: 'all', label: 'All Statuses' }, ...FUNDRAISING_STATUSES.map((status) => ({ value: status, label: status }))]}
            />

            <Input
              label="Country Location"
              name="country"
              placeholder="e.g. United States"
              value={filters.country}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        {/* Discovery Results Section */}
        <div className="lg:col-span-3 space-y-6">
          {isLoading ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
              <p className="text-xs text-slate-400 font-mono">Filtering Venture Database...</p>
            </div>
          ) : startups.length === 0 ? (
            <Card className="text-center py-16 px-4 space-y-4">
              <Building2 className="w-12 h-12 text-slate-500 mx-auto" />
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-bold text-slate-100">No Venture Profiles Match Criteria</h3>
                <p className="text-xs text-slate-400">
                  Try adjusting your search terms, broadening sector filters, or resetting filter constraints.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear All Filters
              </Button>
            </Card>
          ) : (
            <>
              {/* Startup Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {startups.map((startup) => (
                  <StartupCard
                    key={startup._id}
                    startup={startup}
                    isShortlisted={shortlistedIds.has(startup._id)}
                    onToggleShortlist={handleToggleShortlist}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
                  <span className="text-slate-400 font-mono">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={ChevronLeft}
                      disabled={pagination.page <= 1}
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={ChevronRight}
                      iconPosition="right"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestorDiscover;
