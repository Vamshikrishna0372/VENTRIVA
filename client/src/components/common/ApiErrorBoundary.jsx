import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardBody } from './Card';
import { Button } from './Button';

export const ApiErrorBoundary = ({ message, onRetry }) => {
  return (
    <Card className="border-rose-500/30 bg-rose-500/5 my-4">
      <CardBody className="p-6 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <div className="space-y-1">
          <h3 className="font-bold text-slate-100 text-sm">Unable to Load Data</h3>
          <p className="text-xs text-slate-400">{message || 'An API request error occurred. Please check network connection.'}</p>
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={onRetry}>
            Retry Request
          </Button>
        )}
      </CardBody>
    </Card>
  );
};

export default ApiErrorBoundary;
