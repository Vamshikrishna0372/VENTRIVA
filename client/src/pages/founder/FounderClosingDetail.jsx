import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, ShieldCheck, FileText, CheckCircle2, DollarSign, PenTool, Plus } from 'lucide-react';
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

export const FounderClosingDetail = () => {
  const { id } = useParams();
  const [transactionData, setTransactionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
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

  const handleUpdateConditionStatus = async (conditionId, status) => {
    try {
      const res = await api.patch(`/closings/conditions/${conditionId}`, { status });
      if (res.data?.success) {
        setActionMessage({ type: 'success', text: 'Condition updated' });
        fetchClosingDetail();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignDocument = async (docId) => {
    try {
      const res = await api.post(`/closings/documents/${docId}/sign`, { signerRole: 'Founder' });
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

  const handleVerifyPayment = async (paymentId) => {
    try {
      const res = await api.post(`/closings/payment/${paymentId}/verify`);
      if (res.data?.success) {
        setActionMessage({ type: 'success', text: 'Payment verified successfully!' });
        fetchClosingDetail();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecuteClosing = async () => {
    setIsCompleting(true);
    setActionMessage({ type: '', text: '' });

    try {
      const res = await api.post(`/closings/${id}/complete`);
      if (res.data?.success) {
        setActionMessage({ type: 'success', text: 'Transaction Closed Successfully! Portfolio & Cap Table Updated.' });
        fetchClosingDetail();
      } else {
        setActionMessage({ type: 'error', text: res.data?.message || 'Closure failed validation' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Network error completing transaction' });
    } finally {
      setIsCompleting(false);
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
        <Link to="/founder/closings">
          <Button size="sm" variant="brand">
            Back to Closings
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/founder/closings" className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 font-mono">
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

      {/* Closing Progress Banner */}
      <ClosingProgressCard transaction={transactionData} />

      {/* Validation Readiness Panel */}
      <ClosingValidationPanel
        validation={transactionData.validation}
        onCompleteClosing={handleExecuteClosing}
        isCompleting={isCompleting}
      />

      {/* Conditions & Payment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
            Closing Conditions Checklist
          </h3>
          <ClosingConditionList
            conditions={transactionData.conditions || []}
            onUpdateStatus={handleUpdateConditionStatus}
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
            Payment & Wire Verification
          </h3>
          <PaymentStatusCard
            payment={transactionData.payment}
            transaction={transactionData}
            userRole="founder"
            onVerifyPayment={handleVerifyPayment}
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

      {/* Activity Timeline Audit */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
          Closing Activity Timeline
        </h3>
        <ClosingActivityTimeline activities={transactionData.activity || []} />
      </div>
    </div>
  );
};

export default FounderClosingDetail;
