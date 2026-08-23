import React, { useState, useEffect } from 'react';
import { Lightbulb, Filter, Loader2, Compass } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Select } from '../../components/common/Select';

import InsightCard from '../../components/analytics/InsightCard';
import { getInvestorInsights } from '../../services/analyticsService';

export const InvestorInsights = () => {
  const [insights, setInsights] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const res = await getInvestorInsights();
      if (res?.success && Array.isArray(res.insights)) {
        setInsights(res.insights);
      }
    } catch (err) {
      console.error('Error fetching investor insights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInsights = insights.filter((ins) => {
    if (priorityFilter !== 'all' && ins.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Investor Opportunity Insights</h1>
            <p className="text-sm text-slate-400">Rule-based intelligence alerts for high-conviction deals, overdue follow-ups, and meeting preparation.</p>
          </div>
          <Badge variant="brand">{filteredInsights.length} Active Insights</Badge>
        </div>

        {/* Filter Bar */}
        <div className="pt-2 border-t border-slate-800 max-w-xs">
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'critical', label: 'Critical' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ]}
          />
        </div>
      </div>

      {/* Insights Grid */}
      {isLoading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Generating Opportunity Insights...</p>
        </div>
      ) : filteredInsights.length === 0 ? (
        <Card className="text-center py-16 px-4 space-y-4">
          <Lightbulb className="w-12 h-12 text-slate-500 mx-auto" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-100">No Active Opportunity Insights</h3>
            <p className="text-xs text-slate-400">Insights will populate as you evaluate startups and track active pipeline deals.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInsights.map((ins) => (
            <InsightCard key={ins.id} insight={ins} />
          ))}
        </div>
      )}
    </div>
  );
};

export default InvestorInsights;
