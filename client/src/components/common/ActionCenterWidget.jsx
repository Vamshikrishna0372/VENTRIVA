import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Clock, ArrowRight, ShieldAlert, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import api from '../../services/api';

export const ActionCenterWidget = () => {
  const [actions, setActions] = useState([]);
  const [totalActions, setTotalActions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActions();
  }, []);

  const fetchActions = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/actions/my');
      if (res.data?.success && Array.isArray(res.data.actions)) {
        setActions(res.data.actions);
        setTotalActions(res.data.totalActions || res.data.actions.length);
      }
    } catch (err) {
      console.error('Error fetching action center:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-900 border-slate-800 p-6 flex items-center justify-center space-y-2">
        <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
        <span className="text-xs text-slate-400 font-mono ml-2">Loading Real-Time Action Center...</span>
      </Card>
    );
  }

  const getPriorityVariant = (priority) => {
    if (priority === 'urgent') return 'rose';
    if (priority === 'high') return 'amber';
    return 'brand';
  };

  return (
    <Card className="bg-slate-900 border-slate-800 space-y-4">
      <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <h3 className="font-bold text-slate-100 text-sm">Action Center</h3>
          <Badge variant={totalActions > 0 ? 'brand' : 'slate'} size="xs">
            {totalActions} Pending
          </Badge>
        </div>

        <button
          onClick={fetchActions}
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors font-mono"
        >
          Refresh
        </button>
      </div>

      <CardBody className="space-y-3 pt-0">
        {actions.length === 0 ? (
          <div className="p-6 text-center space-y-2 bg-slate-950/60 rounded-xl border border-slate-800/60">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto opacity-90" />
            <p className="text-xs font-bold text-slate-200">Workspace Up to Date</p>
            <p className="text-[11px] text-slate-400">No urgent pending actions require your immediate attention.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {actions.map((action) => (
              <div
                key={action.id}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityVariant(action.priority)} size="xs">
                      {action.priority?.toUpperCase()}
                    </Badge>
                    <span className="font-bold text-slate-100">{action.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{action.description}</p>
                </div>

                <Link to={action.targetRoute} className="shrink-0">
                  <Button variant="primary" size="xs" icon={ArrowRight}>
                    Action
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default ActionCenterWidget;
