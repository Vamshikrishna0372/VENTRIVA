const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Startup = require('./models/Startup');
const TeamMember = require('./models/TeamMember');
const { getAdminUserById, getAdminStartupById } = require('./controllers/adminController');

const runSyncVerificationTest = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/ventriva';
  console.log('Connecting to MongoDB at:', mongoUri);
  await mongoose.connect(mongoUri);

  try {
    console.log('\n=========================================');
    console.log('STEP 1: CREATING TEST FOUNDER & STARTUP');
    console.log('=========================================');

    const founderData = {
      name: 'SYNC_TEST_FOUNDER_NAME',
      email: `sync_founder_${Date.now()}@test.com`,
      password: 'Password123!',
      role: 'founder',
      professionalTitle: 'Co-Founder & CEO',
      organization: 'Acme Ventures',
      phone: '+1 (555) 019-2831',
      location: 'San Francisco, CA',
      linkedin: 'https://linkedin.com/in/sync-founder-test',
      bio: 'Serial entrepreneur with 10 years of experience building B2B SaaS applications.',
      yearsOfExperience: 10,
      isActive: true,
      isVerified: true,
    };

    const founder = await User.create(founderData);
    console.log('✓ Founder Created in MongoDB:', founder._id);

    const startupData = {
      founder: founder._id,
      startupName: 'SYNC_TEST_STARTUP_NAME',
      tagline: 'Empowering enterprise automation with generative AI',
      description: 'Comprehensive AI automation platform for modern enterprise workflows.',
      foundedYear: 2023,
      sector: 'AI / Machine Learning',
      subSector: 'Workflow Automation',
      stage: 'Seed',
      businessModel: 'B2B',
      country: 'United States',
      state: 'California',
      city: 'San Francisco',
      locationDisplay: 'San Francisco, CA',
      website: 'https://sync-test-startup.io',
      linkedin: 'https://linkedin.com/company/sync-test-startup',
      monthlyRevenue: 25000,
      annualRevenue: 300000,
      revenueCurrency: 'USD',
      revenueGrowth: 18,
      customerCount: 42,
      userCount: 1500,
      tractionSummary: 'Growing 18% MoM with 42 paying enterprise customers.',
      otherTraction: 'Featured on Product Hunt Top 3 of the Day.',
      fundraisingStatus: 'Currently Raising',
      fundingStage: 'Seed',
      fundingRequired: 1500000,
      fundingCurrency: 'USD',
      previousFunding: 250000,
      previousFundingCurrency: 'USD',
      targetCloseDate: new Date('2026-12-31'),
      fundraisingSummary: 'Raising $1.5M Seed round for engineering expansion and go-to-market.',
      profileVisibility: 'Investors Only',
      isPublished: true,
    };

    const startup = await Startup.create(startupData);
    console.log('✓ Startup Created in MongoDB:', startup._id);

    const teamMember = await TeamMember.create({
      startup: startup._id,
      name: 'SYNC_TEST_CTO_NAME',
      role: 'Chief Technology Officer',
      bio: 'Ex-Google Staff Engineer',
      linkedin: 'https://linkedin.com/in/sync-cto',
      yearsOfExperience: 12,
      isFounder: true,
    });
    console.log('✓ Team Member Created in MongoDB:', teamMember._id);

    console.log('\n=========================================');
    console.log('STEP 2: CREATING TEST INVESTOR');
    console.log('=========================================');

    const investorData = {
      name: 'SYNC_TEST_INVESTOR_NAME',
      email: `sync_investor_${Date.now()}@test.com`,
      password: 'Password123!',
      role: 'investor',
      professionalTitle: 'Managing Partner',
      organization: 'Apex Horizon Ventures',
      phone: '+1 (555) 987-6543',
      location: 'New York, NY',
      linkedin: 'https://linkedin.com/in/sync-investor-test',
      bio: 'Focused on early-stage Seed and Series A investments in SaaS and AI.',
      yearsOfExperience: 15,
      preferredSectors: ['AI / Machine Learning', 'SaaS / Enterprise Software', 'FinTech'],
      preferredStages: ['Seed', 'Series A'],
      preferredBusinessModels: ['B2B', 'Enterprise'],
      preferredGeographies: ['North America', 'Europe'],
      minimumInvestment: 100000,
      maximumInvestment: 500000,
      investmentCurrency: 'USD',
      isActive: true,
      isVerified: true,
    };

    const investor = await User.create(investorData);
    console.log('✓ Investor Created in MongoDB:', investor._id);

    console.log('\n=========================================');
    console.log('STEP 3: TESTING ADMIN API CONTROLLERS');
    console.log('=========================================');

    // Test Founder Admin User API
    const reqFounder = { params: { id: founder._id.toString() } };
    let adminFounderRes = null;
    const resFounder = {
      status: () => resFounder,
      json: (data) => { adminFounderRes = data; },
    };

    await getAdminUserById(reqFounder, resFounder, (err) => { if (err) console.error(err); });

    console.log('\n--- Admin Founder User API Response Check ---');
    console.log('Success status:', adminFounderRes?.success);
    console.log('User Name:', adminFounderRes?.user?.name);
    console.log('User Title:', adminFounderRes?.user?.professionalTitle);
    console.log('User Experience:', adminFounderRes?.user?.yearsOfExperience);
    console.log('Founder Startup Name:', adminFounderRes?.founderStartup?.startupName);
    console.log('Team Members Count:', adminFounderRes?.teamMembers?.length);

    if (
      adminFounderRes?.user?.yearsOfExperience === 10 &&
      adminFounderRes?.founderStartup?.startupName === 'SYNC_TEST_STARTUP_NAME' &&
      adminFounderRes?.teamMembers?.length === 1
    ) {
      console.log('>>> PASS: Admin User API for Founder returned complete user, startup & team member data!');
    } else {
      console.error('>>> FAIL: Admin User API for Founder missing data');
    }

    // Test Investor Admin User API
    const reqInvestor = { params: { id: investor._id.toString() } };
    let adminInvestorRes = null;
    const resInvestor = {
      status: () => resInvestor,
      json: (data) => { adminInvestorRes = data; },
    };

    await getAdminUserById(reqInvestor, resInvestor, (err) => { if (err) console.error(err); });

    console.log('\n--- Admin Investor User API Response Check ---');
    console.log('Success status:', adminInvestorRes?.success);
    console.log('Investor Name:', adminInvestorRes?.user?.name);
    console.log('Preferred Sectors:', adminInvestorRes?.user?.preferredSectors);
    console.log('Preferred Stages:', adminInvestorRes?.user?.preferredStages);
    console.log('Preferred Business Models:', adminInvestorRes?.user?.preferredBusinessModels);

    if (
      adminInvestorRes?.user?.preferredStages?.includes('Seed') &&
      adminInvestorRes?.user?.preferredBusinessModels?.includes('B2B')
    ) {
      console.log('>>> PASS: Admin User API for Investor returned complete investment preferences!');
    } else {
      console.error('>>> FAIL: Admin Investor User API missing data');
    }

    // Test Startup Admin API
    const reqStartup = { params: { id: startup._id.toString() } };
    let adminStartupRes = null;
    const resStartup = {
      status: () => resStartup,
      json: (data) => { adminStartupRes = data; },
    };

    await getAdminStartupById(reqStartup, resStartup, (err) => { if (err) console.error(err); });

    console.log('\n--- Admin Startup API Response Check ---');
    console.log('Success status:', adminStartupRes?.success);
    console.log('Startup Name:', adminStartupRes?.startup?.startupName);
    console.log('Tagline:', adminStartupRes?.startup?.tagline);
    console.log('Founded Year:', adminStartupRes?.startup?.foundedYear);
    console.log('Monthly MRR:', adminStartupRes?.startup?.monthlyRevenue);
    console.log('Customer Count:', adminStartupRes?.startup?.customerCount);
    console.log('User Count:', adminStartupRes?.startup?.userCount);
    console.log('Founder Name on Startup:', adminStartupRes?.startup?.founder?.name);
    console.log('Founder Title on Startup:', adminStartupRes?.startup?.founder?.professionalTitle);
    console.log('Founder Experience on Startup:', adminStartupRes?.startup?.founder?.yearsOfExperience);
    console.log('Team Members Count:', adminStartupRes?.teamMembers?.length);

    if (
      adminStartupRes?.startup?.userCount === 1500 &&
      adminStartupRes?.startup?.founder?.professionalTitle === 'Co-Founder & CEO' &&
      adminStartupRes?.startup?.founder?.yearsOfExperience === 10 &&
      adminStartupRes?.teamMembers?.length === 1
    ) {
      console.log('>>> PASS: Admin Startup API returned complete startup details, populated founder details & team members!');
    } else {
      console.error('>>> FAIL: Admin Startup API missing data');
    }

    // Clean up test documents
    console.log('\n=========================================');
    console.log('CLEANING UP TEST DOCUMENTS');
    console.log('=========================================');
    await User.findByIdAndDelete(founder._id);
    await User.findByIdAndDelete(investor._id);
    await Startup.findByIdAndDelete(startup._id);
    await TeamMember.findByIdAndDelete(teamMember._id);
    console.log('✓ Test cleanup complete!');

  } catch (err) {
    console.error('Error during verification script:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
};

runSyncVerificationTest();
