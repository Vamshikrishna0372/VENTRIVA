import React, { useState, useEffect } from 'react';
import { User, Mail, Building2, Globe, MapPin, Briefcase, DollarSign, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';

import { SECTORS, STAGES, BUSINESS_MODELS, CURRENCIES } from '../../utils/constants';
import { getInvestorProfile, updateInvestorProfile } from '../../services/investorService';
import { useAuth } from '../../context/AuthContext';

export const InvestorSettings = () => {
  const { updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    professionalTitle: '',
    organization: '',
    bio: '',
    location: '',
    linkedin: '',
    preferredSectors: [],
    preferredStages: [],
    preferredBusinessModels: [],
    minimumInvestment: 0,
    maximumInvestment: 0,
    investmentCurrency: 'USD',
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
      const res = await getInvestorProfile();
      if (res?.success && res?.user) {
        setFormData({
          name: res.user.name || '',
          email: res.user.email || '',
          professionalTitle: res.user.professionalTitle || '',
          organization: res.user.organization || '',
          bio: res.user.bio || '',
          location: res.user.location || '',
          linkedin: res.user.linkedin || '',
          preferredSectors: res.user.preferredSectors || [],
          preferredStages: res.user.preferredStages || [],
          preferredBusinessModels: res.user.preferredBusinessModels || [],
          minimumInvestment: res.user.minimumInvestment || 0,
          maximumInvestment: res.user.maximumInvestment || 0,
          investmentCurrency: res.user.investmentCurrency || 'USD',
        });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to load investor profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxToggle = (category, item) => {
    setFormData((prev) => {
      const list = prev[category] || [];
      const updated = list.includes(item)
        ? list.filter((i) => i !== item)
        : [...list, item];
      return { ...prev, [category]: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
      const res = await updateInvestorProfile(formData);
      if (res?.success) {
        if (res.user && updateUser) updateUser(res.user);
        setFeedback({ type: 'success', message: 'Investment profile & mandate saved successfully!' });
      } else {
        setFeedback({ type: 'error', message: res?.message || 'Failed to update preferences' });
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
        <p className="text-xs text-slate-400 font-mono">Loading Investment Mandate...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Investor Mandate & Account Settings</h1>
        <p className="text-sm text-slate-400">Configure VC firm details, investment thesis, sector preferences, and check sizes.</p>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Identity & Organization */}
        <Card>
          <CardHeader title="Investor Identity & Firm Information" />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                icon={User}
                required
              />
              <Input
                label="Work Email Address"
                value={formData.email}
                icon={Mail}
                disabled
              />
              <Input
                label="Organization / Fund Name"
                name="organization"
                placeholder="e.g. Apex Venture Partners"
                value={formData.organization}
                onChange={handleInputChange}
                icon={Building2}
              />
              <Input
                label="Professional Title"
                name="professionalTitle"
                placeholder="e.g. Managing Partner / Principal"
                value={formData.professionalTitle}
                onChange={handleInputChange}
                icon={Briefcase}
              />
              <Input
                label="Location (City, Country)"
                name="location"
                placeholder="New York, NY"
                value={formData.location}
                onChange={handleInputChange}
                icon={MapPin}
              />
              <Input
                label="LinkedIn Profile URL"
                name="linkedin"
                placeholder="https://linkedin.com/in/username"
                value={formData.linkedin}
                onChange={handleInputChange}
                icon={Globe}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Investment Thesis & Bio
              </label>
              <textarea
                name="bio"
                rows={3}
                placeholder="Brief summary of fund thesis, stage focus, and value-add capabilities..."
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full bg-slate-900/90 text-slate-100 text-sm rounded-xl border border-slate-800 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>
          </CardBody>
        </Card>

        {/* Investment Preferences */}
        <Card>
          <CardHeader title="Target Investment Thesis & Filters" subtitle="Selected criteria drive default discovery recommendations" />
          <CardBody className="space-y-6">
            {/* Sectors */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Preferred Sectors
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {SECTORS.map((sec) => {
                  const isChecked = formData.preferredSectors.includes(sec);
                  return (
                    <button
                      type="button"
                      key={sec}
                      onClick={() => handleCheckboxToggle('preferredSectors', sec)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                        isChecked
                          ? 'bg-brand-500/20 border-brand-500/50 text-brand-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {sec}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stages */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Target Startup Stages
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STAGES.map((stg) => {
                  const isChecked = formData.preferredStages.includes(stg);
                  return (
                    <button
                      type="button"
                      key={stg}
                      onClick={() => handleCheckboxToggle('preferredStages', stg)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                        isChecked
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {stg}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Check Size Range */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
              <Input
                label="Minimum Check Size ($)"
                name="minimumInvestment"
                type="number"
                min="0"
                value={formData.minimumInvestment}
                onChange={handleInputChange}
                icon={DollarSign}
              />
              <Input
                label="Maximum Check Size ($)"
                name="maximumInvestment"
                type="number"
                min="0"
                value={formData.maximumInvestment}
                onChange={handleInputChange}
                icon={DollarSign}
              />
              <Select
                label="Currency"
                name="investmentCurrency"
                value={formData.investmentCurrency}
                onChange={handleInputChange}
                options={CURRENCIES.map((curr) => ({ value: curr, label: curr }))}
              />
            </div>
          </CardBody>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Save Investment Mandate
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InvestorSettings;
