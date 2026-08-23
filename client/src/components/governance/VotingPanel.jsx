import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Vote, CheckCircle2, XCircle, MinusCircle, X } from 'lucide-react';

export const VotingPanel = ({ resolution, onSubmitVote, onClose }) => {
  const [voteValue, setVoteValue] = useState('For');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!resolution) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmitVote(resolution._id, voteValue, comment);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Vote className="w-4 h-4 text-brand-400" /> Cast Board / Shareholder Vote
          </h4>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h5 className="text-xs font-bold text-slate-200">{resolution.title}</h5>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{resolution.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-2">
            <label className="block text-slate-300 font-medium">Select Vote Option</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setVoteValue('For')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 font-bold transition-all ${
                  voteValue === 'For'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> FOR
              </button>

              <button
                type="button"
                onClick={() => setVoteValue('Against')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 font-bold transition-all ${
                  voteValue === 'Against'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <XCircle className="w-5 h-5 text-rose-400" /> AGAINST
              </button>

              <button
                type="button"
                onClick={() => setVoteValue('Abstain')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 font-bold transition-all ${
                  voteValue === 'Abstain'
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <MinusCircle className="w-5 h-5 text-purple-400" /> ABSTAIN
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Optional Comment / Justification</label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="State rationale for your vote..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="brand" disabled={isSubmitting}>
              {isSubmitting ? 'Recording Vote...' : 'Submit Official Vote'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VotingPanel;
