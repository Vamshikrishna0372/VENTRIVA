import React from 'react';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { Card, CardBody } from './Card';
import { Button } from './Button';

export const OfflineState = ({ title = 'Network Disconnected', message = 'Unable to connect to Ventriva API server.', onRetry }) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center py-10 px-6 space-y-4 border-amber-500/30 bg-slate-900">
        <WifiOff className="w-12 h-12 text-amber-400 mx-auto animate-pulse" />
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-100">{title}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{message}</p>
        </div>
        <div className="pt-3 border-t border-slate-800 flex justify-center gap-3">
          {onRetry && (
            <Button variant="primary" size="sm" icon={RefreshCw} onClick={onRetry}>
              Retry Connection
            </Button>
          )}
          <Button variant="outline" size="sm" icon={Home} onClick={() => (window.location.href = '/')}>
            Return Home
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default OfflineState;
