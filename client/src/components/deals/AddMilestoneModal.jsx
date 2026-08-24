import React, { useState } from 'react';
import { CheckSquare, X, AlertCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';

export const AddMilestoneModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Closing',
    description: '',
    dueDate: '',
  });

  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }
    setError('');
    onSubmit({
      title: formData.title.trim(),
      category: formData.category,
      description: formData.description.trim(),
      dueDate: formData.dueDate || null,
    });
    setFormData({ title: '', category: 'Closing', description: '', dueDate: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <Card className="max-w-lg w-full bg-slate-900 border-slate-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-slate-100 text-base">Add Closing Milestone & Due Diligence Task</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Input
            label="Task Title *"
            type="text"
            placeholder="e.g. Legal Counsel Review, SPA Execution, Wire Transfer..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category *"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={[
                { value: 'Legal', label: 'Legal' },
                { value: 'Financial', label: 'Financial' },
                { value: 'Technical', label: 'Technical' },
                { value: 'Closing', label: 'Closing' },
              ]}
            />

            <Input
              label="Target Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Description & Prerequisites</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add details, responsible party, or completion requirements..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Add Task
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddMilestoneModal;
