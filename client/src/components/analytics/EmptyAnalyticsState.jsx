import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

export const EmptyAnalyticsState = ({ title = 'No Analytics Data', message = 'Analytics will populate as interactions occur.', actionLabel, onAction }) => {
  return (
    <Card className="text-center py-16 px-4 space-y-4">
      <BarChart3 className="w-12 h-12 text-slate-500 mx-auto" />
      <div className="max-w-md mx-auto space-y-1">
        <h3 className="text-lg font-bold text-slate-100">{title}</h3>
        <p className="text-xs text-slate-400">{message}</p>
      </div>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Card>
  );
};

export default EmptyAnalyticsState;
