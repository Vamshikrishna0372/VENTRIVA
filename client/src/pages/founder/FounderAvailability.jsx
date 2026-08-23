import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';

import { getAvailability, createAvailability, deleteAvailability } from '../../services/availabilityService';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const FounderAvailability = () => {
  const [slots, setSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [dayOfWeek, setDayOfWeek] = useState('1');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    setIsLoading(true);
    try {
      const res = await getAvailability();
      if (res?.success && Array.isArray(res.slots)) {
        setSlots(res.slots);
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    setIsSubmitting(true);
    try {
      const res = await createAvailability({
        dayOfWeek: Number(dayOfWeek),
        startTime,
        endTime,
      });

      if (res?.success) {
        fetchSlots();
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Failed to add availability slot');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    try {
      await deleteAvailability(slotId);
      setSlots((prev) => prev.filter((s) => s._id !== slotId));
    } catch (err) {
      alert('Failed to delete slot');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <h1 className="text-2xl font-bold text-slate-100">Weekly Meeting Availability</h1>
        <p className="text-sm text-slate-400">Configure recurring weekly time slots for investor intro calls and diligence syncs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Add Slot */}
        <Card className="lg:col-span-1">
          <CardHeader title="Add Availability Slot" />
          <CardBody>
            <form onSubmit={handleAddSlot} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <Select
                label="Day of Week"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                options={DAYS.map((d, idx) => ({ value: String(idx), label: d }))}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Start Time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
                <Input
                  label="End Time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>

              <Button variant="primary" type="submit" className="w-full" isLoading={isSubmitting} icon={Plus}>
                Add Slot
              </Button>
            </form>
          </CardBody>
        </Card>

        {/* Right List: Active Weekly Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader title="Current Weekly Schedule" />
          <CardBody className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
              </div>
            ) : slots.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No availability slots configured.</p>
            ) : (
              <div className="space-y-3">
                {DAYS.map((dayName, dayIdx) => {
                  const daySlots = slots.filter((s) => s.dayOfWeek === dayIdx);
                  if (daySlots.length === 0) return null;

                  return (
                    <div key={dayName} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                      <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">{dayName}</h4>
                      <div className="flex flex-wrap gap-2">
                        {daySlots.map((s) => (
                          <div key={s._id} className="bg-slate-900 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-200 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-brand-400" />
                            <span>{s.startTime} – {s.endTime}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteSlot(s._id)}
                              className="text-slate-500 hover:text-rose-400 transition-colors ml-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default FounderAvailability;
