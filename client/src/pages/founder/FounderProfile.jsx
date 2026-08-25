import React, { useState, useEffect } from 'react';
import { User, Mail, Globe, MapPin, Briefcase, Phone, CheckCircle2, AlertCircle, Loader2, RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { getFounderProfile, updateFounderProfile } from '../../services/founderService';
import { useAuth } from '../../context/AuthContext';

export const FounderProfile = () => {
  const { updateUser } = useAuth();
  const [initialData, setInitialData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    professionalTitle: '',
    bio: '',
    phone: '',
    linkedin: '',
    location: '',
    yearsOfExperience: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await getFounderProfile();
      if (res?.success && res?.user) {
        const loaded = {
          name: res.user.name || '',
          email: res.user.email || '',
          professionalTitle: res.user.professionalTitle || '',
          bio: res.user.bio || '',
          phone: res.user.phone || '',
          linkedin: res.user.linkedin || '',
          location: res.user.location || '',
          yearsOfExperience: res.user.yearsOfExperience || 0,
        };
        setInitialData(loaded);
        setFormData(loaded);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to load founder profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    if (initialData) {
      setFormData(initialData);
      setFeedback(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!formData.name || formData.name.trim().length === 0) {
      setFeedback({ type: 'error', message: 'Full name is required' });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await updateFounderProfile(formData);
      if (res?.success && res?.user) {
        const updated = {
          name: res.user.name || '',
          email: res.user.email || '',
          professionalTitle: res.user.professionalTitle || '',
          bio: res.user.bio || '',
          phone: res.user.phone || '',
          linkedin: res.user.linkedin || '',
          location: res.user.location || '',
          yearsOfExperience: res.user.yearsOfExperience || 0,
        };
        setInitialData(updated);
        setFormData(updated);
        if (updateUser) updateUser(res.user);
        setFeedback({ type: 'success', message: 'Founder profile updated successfully!' });
      } else {
        setFeedback({ type: 'error', message: res?.message || 'Failed to update profile' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'An error occurred while saving' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Founder Credentials...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Founder Account & Credentials</h1>
        <p className="text-sm text-slate-400">Manage personal contact info and professional background attached to your venture.</p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader title="Founder Profile Details" subtitle="Displayed alongside startup discovery listings" />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                icon={User}
                required
              />
              <Input
                label="Work Email Address"
                value={formData.email}
                icon={Mail}
                disabled
                helperText="Email address cannot be changed"
              />
              <Input
                label="Professional Title / Role"
                name="professionalTitle"
                placeholder="e.g. Co-Founder & CEO"
                value={formData.professionalTitle}
                onChange={handleChange}
                icon={Briefcase}
              />
              <Input
                label="Phone Number"
                name="phone"
                placeholder="+1 (555) 234-5678"
                value={formData.phone}
                onChange={handleChange}
                icon={Phone}
              />
              <Input
                label="LinkedIn Profile URL"
                name="linkedin"
                placeholder="https://linkedin.com/in/username"
                value={formData.linkedin}
                onChange={handleChange}
                icon={Globe}
              />
              <Input
                label="Location (City, Country)"
                name="location"
                placeholder="San Francisco, CA"
                value={formData.location}
                onChange={handleChange}
                icon={MapPin}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Founder Bio & Background
              </label>
              <textarea
                name="bio"
                rows={4}
                placeholder="Brief summary of domain expertise, previous ventures, and technical background..."
                value={formData.bio}
                onChange={handleChange}
                className="w-full bg-slate-900/90 text-slate-100 text-sm rounded-xl border border-slate-800 hover:border-slate-700 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="outline" icon={RotateCcw} onClick={handleReset}>
                Reset Changes
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Save Founder Profile
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>
    </div>
  );
};

export default FounderProfile;
