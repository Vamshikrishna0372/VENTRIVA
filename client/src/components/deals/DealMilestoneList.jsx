import React, { useState } from 'react';
import { CheckSquare, Square, Plus, Trash2, Calendar } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const DealMilestoneList = ({ milestones = [], onCreate, onToggle, onDelete, onOpenAddModal }) => {
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Closing');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreate({ title: newTitle.trim(), category: newCategory });
    setNewTitle('');
  };

  return (
    <Card>
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
        <div>
          <h3 className="font-bold text-slate-100 text-sm">Closing Milestones & Due Diligence Checklist</h3>
          <p className="text-xs text-slate-400">Track transaction closing prerequisites</p>
        </div>
        {onOpenAddModal && (
          <Button variant="primary" size="sm" icon={Plus} onClick={onOpenAddModal}>
            Add Task
          </Button>
        )}
      </div>
      <CardBody className="space-y-4">
        {/* Milestone Add Form */}
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Add new closing task (e.g. Legal Counsel Review, SPA Execution)..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
          >
            <option value="Legal">Legal</option>
            <option value="Financial">Financial</option>
            <option value="Technical">Technical</option>
            <option value="Closing">Closing</option>
          </select>
          <Button variant="primary" size="sm" icon={Plus} type="submit">
            Add Task
          </Button>
        </form>

        {/* Milestone Items List */}
        {milestones.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl">
            <p className="text-xs text-slate-400">No closing milestones added yet. Add prerequisites above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {milestones.map((m) => (
              <div
                key={m._id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggle(m._id, m.status === 'Completed' ? 'Pending' : 'Completed')}
                    className="text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    {m.status === 'Completed' ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-500" />
                    )}
                  </button>

                  <div>
                    <span className={`text-xs font-medium ${m.status === 'Completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {m.title}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="slate" size="xs">
                        {m.category || 'Closing'}
                      </Badge>
                      {m.completedAt && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          Completed {new Date(m.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button onClick={() => onDelete(m._id)} className="text-slate-600 hover:text-rose-400 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default DealMilestoneList;
