import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { FileText, CheckCircle2, PenTool, ShieldCheck, ExternalLink } from 'lucide-react';

export const LegalDocumentChecklist = ({ documents = [], onSign, onApprove, className = '' }) => {
  if (!documents.length) {
    return (
      <Card className={`p-4 text-center text-xs text-slate-400 ${className}`}>
        No legal documents attached to this transaction checklist.
      </Card>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {documents.map((doc) => {
        const isSigned = doc.status === 'Signed' || doc.signed;
        const founderSigned = doc.signedByFounder;
        const investorSigned = doc.signedByInvestor;

        return (
          <Card key={doc._id} className="p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">{doc.documentName}</h4>
                  <p className="text-[11px] text-slate-400">
                    Type: <span className="text-slate-300">{doc.documentType}</span> • Version {doc.version}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Badge variant={isSigned ? 'emerald' : 'purple'} size="xs">
                  {doc.status}
                </Badge>
              </div>
            </div>

            {/* Signature Trackers */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/50">
              <div className="flex items-center gap-1.5">
                {founderSigned ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-600 inline-block" />
                )}
                <span className={founderSigned ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                  Founder Signature
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {investorSigned ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-600 inline-block" />
                )}
                <span className={investorSigned ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                  Investor Signature
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-2 pt-1">
              {!isSigned && onSign && (
                <Button size="sm" variant="brand" onClick={() => onSign(doc._id)} className="flex items-center gap-1 text-xs">
                  <PenTool className="w-3.5 h-3.5" /> Sign Digital Document
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default LegalDocumentChecklist;
