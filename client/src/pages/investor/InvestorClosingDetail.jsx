import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, ShieldCheck, FileText, CheckCircle2, DollarSign, PenTool } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ClosingStatusBadge } from '../../components/closing/ClosingStatusBadge';
import { ClosingProgressCard } from '../../components/closing/ClosingProgressCard';
import { ClosingConditionList } from '../../components/closing/ClosingConditionList';
import { LegalDocumentChecklist } from '../../components/closing/LegalDocumentChecklist';
import { PaymentStatusCard } from '../../components/closing/PaymentStatusCard';
import { ClosingValidationPanel } from '../../components/closing/ClosingValidationPanel';
import { ClosingActivityTimeline } from '../../components/closing/ClosingActivityTimeline';
import api from '../../services/api';

export const InvestorClosingDetail = () => {
  const { id } = useParams();
  const [transactionData, setTransactionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchClosingDetail();
  }, [id]);

  const fetchClosingDetail = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/closings/${id}`);
      if (res.data?.success) setTransactionData(res.data.data);
    } catch (err) {
      console.error('Error fetching closing detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignDocument = async (docId) => {
    try {
      const res = await api.post(`/closings/documents/${docId}/sign`, { signerRole: 'Investor' });
      if (res.data?.success) {
        setActionMessage({ type: 'success', text: 'Digital signature recorded!' });
        fetchClosingDetail();
      } else {
        setActionMessage({ type: 'error', text: res.data?.message || 'Signature failed' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitPayment = async (paymentData) => {
    try {
      const res = await api.post(`/closings/${id}/payment`, paymentData);
      if (res.data?.success) {
        setActionMessage({ type: 'success', text: 'Wire transfer payment reference submitted' });
        fetchClosingDetail();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Closing Workspace...</p>
      </div>
    );
  }

  if (!transactionData) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm text-slate-400">Closing transaction not found.</p>
        <Link to="/investor/closings">
          <Button size="sm" variant="brand">
            Back to Closings
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/investor/closings" className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 font-mono">
        <ArrowLeft className="w-4 h-4" /> Back to Closings Overview
      </Link>

      {actionMessage.text && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
            actionMessage.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
          }`}
        >
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Progress Banner */}
      <ClosingProgressCard transaction={transactionData} />

      {/* Validation Panel */}
      <ClosingValidationPanel validation={transactionData.validation} />

      {/* Conditions & Payment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
            Closing Conditions Checklist
          </h3>
          <ClosingConditionList conditions={transactionData.conditions || []} />
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
            Payment & Wire Transfer Record
          </h3>
          <PaymentStatusCard
            payment={transactionData.payment}
            transaction={transactionData}
            userRole="investor"
            onSubmitPayment={handleSubmitPayment}
          />
        </div>
      </div>

      {/* Legal Documents Checklist */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
          Legal Documents & Signatures
        </h3>
        <LegalDocumentChecklist
          documents={transactionData.legalDocuments || []}
          onSign={handleSignDocument}
        />
      </div>

      {/* Activity Audit Timeline */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
          Closing Audit Trail
        </h3>
        <ClosingActivityTimeline activities={transactionData.activity || []} />
      </div>
    </div>
  );
};

export default InvestorClosingDetail;
