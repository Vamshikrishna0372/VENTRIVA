import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';

export const ClosingValidationPanel = ({ validation, onCompleteClosing, isCompleting = false, className = '' }) => {
  if (!validation) return null;

  const { isValid = false, missingRequirements = [] } = validation;

  return (
    <Card className={`p-5 space-y-4 border ${isValid ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-slate-800'} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {isValid ? (
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          ) : (
            <ShieldAlert className="w-6 h-6 text-amber-400" />
          )}
          <div>
            <h4 className="text-sm font-bold text-slate-100">
              {isValid ? 'Transaction Verification Ready for Closure' : 'Transaction Closing Requirements Check'}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {isValid
                ? 'All mandatory conditions, legal documents, digital signatures, and wire payments have passed validation.'
                : 'Pending items must be completed before finalizing investment closure.'}
            </p>
          </div>
        </div>

        {isValid && onCompleteClosing && (
          <Button variant="emerald" size="sm" onClick={onCompleteClosing} disabled={isCompleting} className="flex items-center gap-1.5 shrink-0">
            <CheckCircle2 className="w-4 h-4" /> {isCompleting ? 'Finalizing Closing...' : 'Execute Transaction Closure'}
          </Button>
        )}
      </div>

      {!isValid && missingRequirements.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Missing / Incomplete Requirements ({missingRequirements.length}):</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-300 font-mono pl-1">
            {missingRequirements.map((req, idx) => (
              <li key={idx}>{req}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};

export default ClosingValidationPanel;
