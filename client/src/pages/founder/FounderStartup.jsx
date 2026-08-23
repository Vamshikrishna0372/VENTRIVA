import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  TrendingUp,
  Globe,
  MapPin,
  Users,
  DollarSign,
  Eye,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  Briefcase
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

import { SECTORS, SECTOR_CONFIG, STAGES, BUSINESS_MODELS, FUNDRAISING_STATUSES, PROFILE_VISIBILITY, CURRENCIES } from '../../utils/constants';
import { getMyStartup, createStartup, updateMyStartup, addTeamMember, updateTeamMember, deleteTeamMember } from '../../services/startupService';

export const FounderStartup = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const [startup, setStartup] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    startupName: '',
    tagline: '',
    description: '',
    foundedYear: new Date().getFullYear(),
    sector: SECTORS[0],
    subSector: '',
    stage: 'Seed',
    businessModel: 'B2B',
    country: '',
    state: '',
    city: '',
    locationDisplay: '',
    website: '',
    linkedin: '',
    tractionSummary: '',
    monthlyRevenue: 0,
    annualRevenue: 0,
    revenueCurrency: 'USD',
    revenueGrowth: 0,
    customerCount: 0,
    userCount: 0,
    otherTraction: '',
    fundraisingStatus: 'Currently Raising',
    fundingStage: 'Seed',
    fundingRequired: 0,
    fundingCurrency: 'USD',
    previousFunding: 0,
    previousFundingCurrency: 'USD',
    targetCloseDate: '',
    fundraisingSummary: '',
    profileVisibility: 'Investors Only',
    isPublished: false,
  });

  // Team Modal State
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberForm, setMemberForm] = useState({
    name: '',
    role: '',
    bio: '',
    linkedin: '',
    yearsOfExperience: 0,
    isFounder: false,
  });

  useEffect(() => {
    fetchStartupData();
  }, []);

  const fetchStartupData = async () => {
    setIsLoading(true);
    try {
      const res = await getMyStartup();
      if (res?.success && res?.startup) {
        setStartup(res.startup);
        setTeamMembers(res.teamMembers || []);

        setFormData({
          startupName: res.startup.startupName || '',
          tagline: res.startup.tagline || '',
          description: res.startup.description || '',
          foundedYear: res.startup.foundedYear || new Date().getFullYear(),
          sector: res.startup.sector || SECTORS[0],
          subSector: res.startup.subSector || '',
          stage: res.startup.stage || 'Seed',
          businessModel: res.startup.businessModel || 'B2B',
          country: res.startup.country || '',
          state: res.startup.state || '',
          city: res.startup.city || '',
          locationDisplay: res.startup.locationDisplay || '',
          website: res.startup.website || '',
          linkedin: res.startup.linkedin || '',
          tractionSummary: res.startup.tractionSummary || '',
          monthlyRevenue: res.startup.monthlyRevenue || 0,
          annualRevenue: res.startup.annualRevenue || 0,
          revenueCurrency: res.startup.revenueCurrency || 'USD',
          revenueGrowth: res.startup.revenueGrowth || 0,
          customerCount: res.startup.customerCount || 0,
          userCount: res.startup.userCount || 0,
          otherTraction: res.startup.otherTraction || '',
          fundraisingStatus: res.startup.fundraisingStatus || 'Currently Raising',
          fundingStage: res.startup.fundingStage || 'Seed',
          fundingRequired: res.startup.fundingRequired || 0,
          fundingCurrency: res.startup.fundingCurrency || 'USD',
          previousFunding: res.startup.previousFunding || 0,
          previousFundingCurrency: res.startup.previousFundingCurrency || 'USD',
          targetCloseDate: res.startup.targetCloseDate ? res.startup.targetCloseDate.split('T')[0] : '',
          fundraisingSummary: res.startup.fundraisingSummary || '',
          profileVisibility: res.startup.profileVisibility || 'Investors Only',
          isPublished: res.startup.isPublished || false,
        });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to load startup profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveStartup = async (e) => {
    if (e) e.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
      let res;
      if (startup?._id) {
        res = await updateMyStartup(startup._id, formData);
      } else {
        res = await createStartup(formData);
      }

      if (res?.success && res?.startup) {
        setStartup(res.startup);
        setFeedback({ type: 'success', message: 'Startup profile saved successfully!' });
      } else {
        setFeedback({ type: 'error', message: res?.message || 'Failed to save startup profile' });
      }
    } catch (err) {
      if (err?.data?.startup) {
        setStartup(err.data.startup);
        setFeedback({ type: 'success', message: 'Existing venture profile loaded and synced successfully!' });
      } else {
        const errorMsg = err?.data?.message || err?.message || 'Error saving startup profile';
        setFeedback({ type: 'error', message: errorMsg });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Team Member Modal Operations
  const [modalError, setModalError] = useState('');

  const openAddMemberModal = () => {
    setEditingMember(null);
    setMemberForm({ name: '', role: '', bio: '', linkedin: '', yearsOfExperience: 0, isFounder: false });
    setModalError('');
    setIsTeamModalOpen(true);
  };

  const openEditMemberModal = (member) => {
    setEditingMember(member);
    setMemberForm({
      name: member.name || '',
      role: member.role || '',
      bio: member.bio || '',
      linkedin: member.linkedin || '',
      yearsOfExperience: member.yearsOfExperience || 0,
      isFounder: member.isFounder || false,
    });
    setModalError('');
    setIsTeamModalOpen(true);
  };

  const handleSaveTeamMember = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!startup?._id) {
      setFeedback({ type: 'error', message: 'Please save basic startup details before adding team members.' });
      setIsTeamModalOpen(false);
      return;
    }

    if (!memberForm.name || !memberForm.name.trim()) {
      setModalError('Full Name is required.');
      return;
    }

    if (!memberForm.role || !memberForm.role.trim()) {
      setModalError('Role / Title is required.');
      return;
    }

    try {
      if (editingMember?._id) {
        await updateTeamMember(startup._id, editingMember._id, memberForm);
      } else {
        await addTeamMember(startup._id, memberForm);
      }
      setIsTeamModalOpen(false);
      fetchStartupData();
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to save team member');
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) return;
    try {
      await deleteTeamMember(startup._id, memberId);
      fetchStartupData();
    } catch (err) {
      alert(err.message || 'Failed to remove team member');
    }
  };

  const subSectorOptions = SECTOR_CONFIG[formData.sector] || ['General'];

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Venture Profile Manager...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-100">
              {startup ? startup.startupName : 'Create Venture Profile'}
            </h1>
            {startup && (
              <Badge variant="emerald">
                {startup.profileCompletion}% Complete
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-400">
            Configure venture attributes, metrics, fundraising requirements, and team roster.
          </p>
        </div>

        <div className="flex gap-3">
          {startup && (
            <Link to="/founder/startup/preview">
              <Button variant="outline" size="sm" icon={Eye}>Preview Profile</Button>
            </Link>
          )}
          <Button variant="primary" size="sm" isLoading={isSubmitting} onClick={handleSaveStartup}>
            {startup ? 'Save Venture Profile' : 'Create Venture Profile'}
          </Button>
        </div>
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

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'basic', label: '1. Basic Info' },
          { id: 'classification', label: '2. Classification' },
          { id: 'location', label: '3. Location & Web' },
          { id: 'traction', label: '4. Traction & Revenue' },
          { id: 'fundraising', label: '5. Fundraising' },
          { id: 'team', label: '6. Team Roster' },
          { id: 'visibility', label: '7. Visibility Settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSaveStartup}>
        {/* TAB 1: BASIC INFORMATION */}
        {activeTab === 'basic' && (
          <Card>
            <CardHeader title="Basic Venture Information" subtitle="High-level identity and summary" />
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Startup Name"
                  name="startupName"
                  placeholder="e.g. Solara Health AI"
                  value={formData.startupName}
                  onChange={handleInputChange}
                  icon={Building2}
                  required
                />
                <Input
                  label="Founded Year"
                  name="foundedYear"
                  type="number"
                  placeholder="2023"
                  value={formData.foundedYear}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <Input
                label="Tagline (One-line Pitch)"
                name="tagline"
                placeholder="Enterprise AI Health Analytics Platform"
                value={formData.tagline}
                onChange={handleInputChange}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Detailed Venture Description
                </label>
                <textarea
                  name="description"
                  rows={5}
                  placeholder="Explain the problem, solution, target customer, market size, and technology differentiation..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900/90 text-slate-100 text-sm rounded-xl border border-slate-800 hover:border-slate-700 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
                  required
                />
              </div>
            </CardBody>
          </Card>
        )}

        {/* TAB 2: CLASSIFICATION */}
        {activeTab === 'classification' && (
          <Card>
            <CardHeader title="Business Classification" subtitle="Sector taxonomy and stage details" />
            <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Primary Sector"
                name="sector"
                value={formData.sector}
                onChange={handleInputChange}
                options={SECTORS.map((sec) => ({ value: sec, label: sec }))}
              />
              <Select
                label="Sub-sector Taxonomy"
                name="subSector"
                value={formData.subSector}
                onChange={handleInputChange}
                options={subSectorOptions.map((sub) => ({ value: sub, label: sub }))}
              />
              <Select
                label="Current Startup Stage"
                name="stage"
                value={formData.stage}
                onChange={handleInputChange}
                options={STAGES.map((stg) => ({ value: stg, label: stg }))}
              />
              <Select
                label="Business Model"
                name="businessModel"
                value={formData.businessModel}
                onChange={handleInputChange}
                options={BUSINESS_MODELS.map((bm) => ({ value: bm, label: bm }))}
              />
            </CardBody>
          </Card>
        )}

        {/* TAB 3: LOCATION & WEB */}
        {activeTab === 'location' && (
          <Card>
            <CardHeader title="Location & Online Presence" subtitle="Company links and geographic headquarters" />
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Country"
                  name="country"
                  placeholder="United States"
                  value={formData.country}
                  onChange={handleInputChange}
                  icon={MapPin}
                />
                <Input
                  label="State / Province"
                  name="state"
                  placeholder="California"
                  value={formData.state}
                  onChange={handleInputChange}
                />
                <Input
                  label="City"
                  name="city"
                  placeholder="San Francisco"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Company Website URL"
                  name="website"
                  placeholder="https://solara-health.io"
                  value={formData.website}
                  onChange={handleInputChange}
                  icon={Globe}
                />
                <Input
                  label="Company LinkedIn URL"
                  name="linkedin"
                  placeholder="https://linkedin.com/company/solara-health"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  icon={Globe}
                />
              </div>
            </CardBody>
          </Card>
        )}

        {/* TAB 4: TRACTION & REVENUE */}
        {activeTab === 'traction' && (
          <Card>
            <CardHeader title="Traction & Financial Metrics" subtitle="Monthly/annual revenue, growth, and customer count" />
            <CardBody className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Traction Summary & Milestones
                </label>
                <textarea
                  name="tractionSummary"
                  rows={3}
                  placeholder="Key milestones achieved (e.g. 10 paid pilot contracts, $150K ARR, 45% MoM user growth)..."
                  value={formData.tractionSummary}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900/90 text-slate-100 text-sm rounded-xl border border-slate-800 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  label="Monthly Revenue (MRR)"
                  name="monthlyRevenue"
                  type="number"
                  min="0"
                  value={formData.monthlyRevenue}
                  onChange={handleInputChange}
                  icon={DollarSign}
                />
                <Input
                  label="Annual Revenue (ARR)"
                  name="annualRevenue"
                  type="number"
                  min="0"
                  value={formData.annualRevenue}
                  onChange={handleInputChange}
                  icon={DollarSign}
                />
                <Input
                  label="MoM Growth %"
                  name="revenueGrowth"
                  type="number"
                  value={formData.revenueGrowth}
                  onChange={handleInputChange}
                />
                <Input
                  label="Customer Count"
                  name="customerCount"
                  type="number"
                  min="0"
                  value={formData.customerCount}
                  onChange={handleInputChange}
                />
              </div>
            </CardBody>
          </Card>
        )}

        {/* TAB 5: FUNDRAISING */}
        {activeTab === 'fundraising' && (
          <Card>
            <CardHeader title="Fundraising Terms & Target" subtitle="Round stage and capital requirement" />
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Fundraising Status"
                  name="fundraisingStatus"
                  value={formData.fundraisingStatus}
                  onChange={handleInputChange}
                  options={FUNDRAISING_STATUSES.map((status) => ({ value: status, label: status }))}
                />
                <Select
                  label="Target Funding Round Stage"
                  name="fundingStage"
                  value={formData.fundingStage}
                  onChange={handleInputChange}
                  options={STAGES.map((stg) => ({ value: stg, label: stg }))}
                />
              </div>

              {formData.fundraisingStatus === 'Currently Raising' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                  <Input
                    label="Funding Target Amount"
                    name="fundingRequired"
                    type="number"
                    min="0"
                    value={formData.fundingRequired}
                    onChange={handleInputChange}
                    icon={DollarSign}
                  />
                  <Select
                    label="Currency"
                    name="fundingCurrency"
                    value={formData.fundingCurrency}
                    onChange={handleInputChange}
                    options={CURRENCIES.map((curr) => ({ value: curr, label: curr }))}
                  />
                  <Input
                    label="Target Close Date"
                    name="targetCloseDate"
                    type="date"
                    value={formData.targetCloseDate}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* TAB 6: TEAM MANAGEMENT */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            {/* Primary Founder Card */}
            <Card className="border-brand-500/30 bg-gradient-to-r from-slate-900 to-slate-950">
              <CardHeader
                title="Primary Venture Founder"
                subtitle="Primary startup founder authenticated via venture ownership"
                action={<Badge variant="emerald">Primary Founder</Badge>}
              />
              <CardBody>
                <div className="flex items-center gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-lg">
                    {startup?.founder?.name ? startup.founder.name.substring(0, 2).toUpperCase() : 'PF'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100">{startup?.founder?.name || 'Primary Venture Founder'}</h4>
                    <p className="text-xs text-brand-400 font-medium">Founder & CEO</p>
                    <p className="text-xs text-slate-400 mt-0.5">{startup?.founder?.email || 'Authenticated Owner'}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Additional Team Roster */}
            <Card>
              <CardHeader
                title="Co-Founders & Core Team Members"
                subtitle="Manage additional co-founders, executives, and staff"
                action={
                  <Button size="sm" icon={Plus} onClick={openAddMemberModal}>
                    Add Team Member
                  </Button>
                }
              />
              <CardBody className="space-y-6">
                {/* CO-FOUNDERS SUB-SECTION */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    Co-Founders ({teamMembers.filter(m => m.isFounder).length})
                  </h4>
                  {teamMembers.filter(m => m.isFounder).length === 0 ? (
                    <p className="text-xs text-slate-500 italic bg-slate-950/40 p-3 rounded-lg border border-slate-800/50">
                      No additional co-founders added yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {teamMembers.filter(m => m.isFounder).map((member) => (
                        <div key={member._id} className="bg-slate-950/70 p-4 rounded-xl border border-emerald-500/20 flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-slate-100 text-sm">{member.name}</h5>
                              <Badge variant="emerald" size="xs">Co-Founder</Badge>
                            </div>
                            <p className="text-xs text-emerald-400 font-medium">{member.role}</p>
                            {member.linkedin && (
                              <a href={member.linkedin.startsWith('http') ? member.linkedin : `https://${member.linkedin}`} target="_blank" rel="noreferrer" className="text-[11px] text-brand-400 hover:underline inline-block mt-1">
                                LinkedIn Profile
                              </a>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => openEditMemberModal(member)} className="p-1.5 text-slate-400 hover:text-white">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => handleDeleteMember(member._id)} className="p-1.5 text-slate-400 hover:text-rose-400">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* TEAM MEMBERS SUB-SECTION */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-brand-400" />
                    Team Members ({teamMembers.filter(m => !m.isFounder).length})
                  </h4>
                  {teamMembers.filter(m => !m.isFounder).length === 0 ? (
                    <p className="text-xs text-slate-500 italic bg-slate-950/40 p-3 rounded-lg border border-slate-800/50">
                      No additional team members added yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {teamMembers.filter(m => !m.isFounder).map((member) => (
                        <div key={member._id} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex items-start justify-between">
                          <div className="space-y-1">
                            <h5 className="font-bold text-slate-100 text-sm">{member.name}</h5>
                            <p className="text-xs text-brand-400 font-medium">{member.role}</p>
                            {member.linkedin && (
                              <a href={member.linkedin.startsWith('http') ? member.linkedin : `https://${member.linkedin}`} target="_blank" rel="noreferrer" className="text-[11px] text-brand-400 hover:underline inline-block mt-1">
                                LinkedIn Profile
                              </a>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => openEditMemberModal(member)} className="p-1.5 text-slate-400 hover:text-white">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => handleDeleteMember(member._id)} className="p-1.5 text-slate-400 hover:text-rose-400">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* TAB 7: VISIBILITY */}
        {activeTab === 'visibility' && (
          <Card>
            <CardHeader title="Profile Visibility & Publishing" subtitle="Control discovery availability for VC investors" />
            <CardBody className="space-y-4">
              <Select
                label="Profile Visibility Mode"
                name="profileVisibility"
                value={formData.profileVisibility}
                onChange={handleInputChange}
                options={PROFILE_VISIBILITY.map((vis) => ({ value: vis, label: vis }))}
              />
              <p className="text-xs text-slate-400">
                {formData.profileVisibility === 'Private'
                  ? 'Private: Profile is hidden from investor discovery searches.'
                  : 'Investors Only: Profile will be discoverable by vetted VC investors.'}
              </p>
            </CardBody>
          </Card>
        )}

        <div className="pt-4 flex justify-end gap-3">
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Save Venture Profile Changes
          </Button>
        </div>
      </form>

      {/* TEAM MEMBER MODAL */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-100">
              {editingMember ? 'Edit Team Member' : 'Add Team Member'}
            </h3>

            {modalError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveTeamMember} className="space-y-4">
              <Input
                label="Full Name *"
                placeholder="e.g. Rahul Sharma"
                value={memberForm.name}
                onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                required
              />
              <Input
                label="Role / Title *"
                placeholder="e.g. Chief Technology Officer"
                value={memberForm.role}
                onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                required
              />
              <Input
                label="LinkedIn URL"
                placeholder="https://linkedin.com/in/username"
                value={memberForm.linkedin}
                onChange={(e) => setMemberForm({ ...memberForm, linkedin: e.target.value })}
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Member Designation
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setMemberForm({ ...memberForm, isFounder: false })}
                    className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                      !memberForm.isFounder
                        ? 'bg-brand-500/10 border-brand-500 text-brand-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Team Member / Staff
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemberForm({ ...memberForm, isFounder: true })}
                    className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                      memberForm.isFounder
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Co-Founder
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Primary founder is automatically linked to startup ownership. Select Co-Founder only for additional co-founders.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button variant="ghost" size="sm" onClick={() => setIsTeamModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Member
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FounderStartup;
