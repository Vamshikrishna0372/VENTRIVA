const mongoose = require('mongoose');
const { SECTORS, STAGES, BUSINESS_MODELS, FUNDRAISING_STATUSES, PROFILE_VISIBILITY, CURRENCIES } = require('../config/constants');

const startupSchema = new mongoose.Schema(
  {
    founder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Founder ID is required'],
      index: true,
    },
    startupName: {
      type: String,
      required: [true, 'Startup name is required'],
      trim: true,
      maxlength: [100, 'Startup name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    logo: {
      type: String,
      default: '',
    },
    tagline: {
      type: String,
      default: '',
      maxlength: [200, 'Tagline cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Startup description is required'],
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    foundedYear: {
      type: Number,
      required: [true, 'Founded year is required'],
      min: [1900, 'Founded year cannot be earlier than 1900'],
      max: [new Date().getFullYear() + 1, 'Founded year cannot be in the future'],
    },

    // Classification
    sector: {
      type: String,
      required: [true, 'Sector is required'],
      enum: {
        values: SECTORS,
        message: 'Invalid sector selected',
      },
    },
    subSector: {
      type: String,
      default: '',
    },
    stage: {
      type: String,
      required: [true, 'Startup stage is required'],
      enum: {
        values: STAGES,
        message: 'Invalid stage selected',
      },
    },
    businessModel: {
      type: String,
      required: [true, 'Business model is required'],
      enum: {
        values: BUSINESS_MODELS,
        message: 'Invalid business model selected',
      },
    },

    // Location
    country: {
      type: String,
      default: '',
    },
    state: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
    },
    locationDisplay: {
      type: String,
      default: '',
    },

    // Online Presence
    website: {
      type: String,
      default: '',
    },
    linkedin: {
      type: String,
      default: '',
    },

    // Traction
    tractionSummary: {
      type: String,
      default: '',
      maxlength: [1000, 'Traction summary cannot exceed 1000 characters'],
    },
    monthlyRevenue: {
      type: Number,
      default: 0,
      min: [0, 'Monthly revenue cannot be negative'],
    },
    annualRevenue: {
      type: Number,
      default: 0,
      min: [0, 'Annual revenue cannot be negative'],
    },
    revenueCurrency: {
      type: String,
      enum: CURRENCIES,
      default: 'USD',
    },
    revenueGrowth: {
      type: Number,
      default: 0,
    },
    customerCount: {
      type: Number,
      default: 0,
      min: [0, 'Customer count cannot be negative'],
    },
    userCount: {
      type: Number,
      default: 0,
      min: [0, 'User count cannot be negative'],
    },
    otherTraction: {
      type: String,
      default: '',
    },

    // Fundraising
    fundraisingStatus: {
      type: String,
      required: [true, 'Fundraising status is required'],
      enum: {
        values: FUNDRAISING_STATUSES,
        message: 'Invalid fundraising status',
      },
      default: 'Currently Raising',
    },
    fundingStage: {
      type: String,
      enum: STAGES,
      default: 'Seed',
    },
    fundingRequired: {
      type: Number,
      default: 0,
      min: [0, 'Funding required cannot be negative'],
    },
    fundingCurrency: {
      type: String,
      enum: CURRENCIES,
      default: 'USD',
    },
    previousFunding: {
      type: Number,
      default: 0,
      min: [0, 'Previous funding cannot be negative'],
    },
    previousFundingCurrency: {
      type: String,
      enum: CURRENCIES,
      default: 'USD',
    },
    targetCloseDate: {
      type: Date,
      default: null,
    },
    fundraisingSummary: {
      type: String,
      default: '',
    },

    // Status & Visibility
    profileVisibility: {
      type: String,
      enum: {
        values: PROFILE_VISIBILITY,
        message: 'Invalid profile visibility selected',
      },
      default: 'Private', // Default Private as specified in Step 14
    },
    profileCompletion: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ['Unverified', 'Pending Review', 'Verified', 'Rejected'],
      default: 'Unverified',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verificationReason: {
      type: String,
      default: '',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
startupSchema.index({ sector: 1, stage: 1, profileVisibility: 1 });
startupSchema.index({ isPublished: 1, isDeleted: 1, profileVisibility: 1 });
startupSchema.index({ founder: 1, isDeleted: 1 });

// Pre-save hook to generate slug
startupSchema.pre('save', function (next) {
  if (this.isModified('startupName') || !this.slug) {
    const baseSlug = this.startupName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    this.slug = `${baseSlug}-${Date.now().toString().slice(-6)}`;
  }
  next();
});

const Startup = mongoose.model('Startup', startupSchema);

module.exports = Startup;
