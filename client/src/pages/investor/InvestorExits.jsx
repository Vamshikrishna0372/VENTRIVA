import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  CheckCircle2,
  Award,
  Loader2,
  Plus,
  X,
  RefreshCw,
  Building2,
  TrendingUp,
  PieChart,
  Target,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { getExitTransactions, completeExitTransaction, createExitTransaction } from '../../services/exitService';
import api from '../../services/api';

export const InvestorExits = () => {
  const [exits, setExits] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    investmentId: '',
    exitType: 'Acquisition',
    exitValue: 1000000,
    buyerName: 'Strategic Acquirer Inc',
    notes: 'Strategic exit transaction',
  });

  useEffect(() => {
    fetchExits();
    fetchInvestments();
  }, []);

  const fetchExits = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await getExitTransactions();
      if (res?.success) setExits(res.data || []);
    } catch (err) {
      console.error('Error fetching exit transactions:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInvestments = async () => {
    try {
      const res = await api.get('/investments');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setInvestments(res.data.data);
        if (res.data.data.length > 0) {
          setFormData((prev) => ({ ...prev, investmentId: res.data.data[0]._id }));
        }
      }
    } catch (err) {
      console.error('Error fetching portfolio investments:', err);
    }
  };

  const handleCompleteExit = async (id) => {
    setFeedback({ type: '', message: '' });
    try {
      const res = await completeExitTransaction(id);
      if (res?.success) {
        setFeedback({ type: 'success', message: 'Exit transaction completed and holding updated to Exited status!' });
        fetchExits();
      } else {
        setFeedback({ type: 'error', message: res?.message || 'Failed to complete exit' });
      }
    } catch (err) {
      console.error('Error completing exit transaction:', err);
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message || 'Error completing exit' });
    }
  };

  const handleCreateExit = async (e) => {
    e.preventDefault();
    if (!formData.investmentId) {
      alert('Please select a portfolio venture investment');
      return;
    }
    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await createExitTransaction(formData);
      if (res?.success) {
        setFeedback({ type: 'success', message: 'Exit transaction recorded successfully!' });
        setShowModal(false);
        fetchExits();
      } else {
        setFeedback({ type: 'error', message: res?.message || 'Failed to record exit' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err?.response?.data?.message || err.message || 'Failed to record exit transaction' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Exit Transactions & Realized Returns...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Award className="w-6 h-6 text-emerald-400" /> Exit Transactions & Realized Returns
            </h1>
            <p className="text-sm text-slate-400">
              Track acquisitions, IPOs, secondary sales, and write-offs while auditing realized return multiples (MOIC).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={fetchExits} icon={RefreshCw} variant="outline" size="sm">
              Refresh
            </Button>
            {investments.length > 0 && (
              <Button variant="brand" size="sm" icon={Plus} onClick={() => setShowModal(true)}>
                Record Exit Transaction
              </Button>
            )}
          </div>
        </div>

        {/* Connected Workflows Quick Bar */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
          <Link to="/investor/portfolio" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Venture Portfolio
          </Link>
          <Link to="/investor/portfolio/intelligence" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-purple-400" /> Portfolio Intelligence
          </Link>
          <Link to="/investor/follow-on-investments" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-brand-400" /> Follow-On Opportunities
          </Link>
          <Link to="/investor/cap-table" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <PieChart className="w-3.5 h-3.5 text-indigo-400" /> Cap Table Ownership
          </Link>
        </div>
      </div>

      {feedback.message && (
        <div className={`p-4 rounded-xl border text-xs flex items-center gap-2.5 ${
          feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {isError && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>Failed to load exit transactions dataset. Please try again.</span>
          </div>
          <Button variant="outline" size="xs" onClick={fetchExits}>Retry</Button>
        </div>
      )}

      {exits.length === 0 ? (
        <Card className="text-center py-12 border-slate-800 bg-slate-900">
          <CardBody className="space-y-3">
            <Award className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-200">No Exit Transactions Recorded</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              When a portfolio holding reaches an acquisition, IPO, secondary sale, or write-off, the transaction record will appear here.
            </p>
            {investments.length > 0 && (
              <Button variant="outline" size="sm" icon={Plus} onClick={() => setShowModal(true)}>
                Record First Exit Transaction
              </Button>
            )}
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exits.map((ex) => (
            <Card key={ex._id} className="border-slate-800 bg-slate-900">
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{ex.startup?.startupName || ex.startup?.companyName || 'Portfolio Startup'}</h4>
                    <p className="text-xs text-slate-400">{ex.exitType} • {ex.buyerName || 'Undisclosed Buyer'}</p>
                  </div>
                  <Badge variant={ex.exitStatus === 'Completed' ? 'emerald' : 'amber'}>
                    {ex.exitStatus}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Realized Value</span>
                    <span className="font-bold text-emerald-400">${(ex.exitValue || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Realized MOIC</span>
                    <span className="font-bold text-emerald-400">{ex.realizedMultiple}x</span>
                  </div>
                </div>

                {ex.exitStatus === 'Planned' && (
                  <div className="flex justify-end pt-2 border-t border-slate-800">
                    <Button variant="primary" size="sm" icon={CheckCircle2} onClick={() => handleCompleteExit(ex._id)}>
                      Complete & Realize Exit
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Record Exit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" /> Record Exit Transaction
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExit} className="space-y-4">
              <Select
                label="Portfolio Venture Holding"
                value={formData.investmentId}
                onChange={(e) => setFormData({ ...formData, investmentId: e.target.value })}
                options={investments.map((inv) => {
                  const sName = inv.startup?.startupName || inv.startup?.companyName || 'Portfolio Venture';
                  const invAmount = inv.totalInvested || inv.investmentAmount || 0;
                  return {
                    value: inv._id,
                    label: `${sName} ($${invAmount.toLocaleString()})`,
                  };
                })}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Exit Type"
                  value={formData.exitType}
                  onChange={(e) => setFormData({ ...formData, exitType: e.target.value })}
                  options={[
                    { value: 'Acquisition', label: 'Strategic Acquisition' },
                    { value: 'IPO', label: 'Initial Public Offering (IPO)' },
                    { value: 'Secondary Sale', label: 'Secondary Equity Sale' },
                    { value: 'Write-Off', label: 'Venture Write-Off' },
                  ]}
                />

                <Input
                  label="Realized Proceeds ($)"
                  type="number"
                  min="0"
                  value={formData.exitValue}
                  onChange={(e) => setFormData({ ...formData, exitValue: Number(e.target.value) })}
                  required
                />
              </div>

              <Input
                label="Acquirer / Buyer Name"
                value={formData.buyerName}
                onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                placeholder="Acquiring Corporation or Investor..."
              />

              <Input
                label="Transaction Notes & Terms"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Details regarding transaction closure and escrow..."
              />

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <Button variant="ghost" onClick={() => setShowModal(false)} type="button">
                  Cancel
                </Button>
                <Button variant="emerald" type="submit" isLoading={isSubmitting}>
                  Save Exit Event
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorExits;

