const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const User = require('../models/User');
const Startup = require('../models/Startup');

async function seedBaselineFounderStartup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    const founder = await User.findOne({ email: 'founder@ventriva.com' });
    if (!founder) {
      console.error('Founder user founder@ventriva.com not found!');
      process.exit(1);
    }

    let startup = await Startup.findOne({ founder: founder._id, isDeleted: false });
    if (!startup) {
      startup = await Startup.create({
        founder: founder._id,
        startupName: 'VentrivaPay',
        slug: 'ventrivapay',
        tagline: 'Venture Capital Settlement Infrastructure',
        description: 'Automated deal room transactions and cap table equity management platform for modern ventures.',
        foundedYear: 2024,
        sector: 'FinTech',
        stage: 'Seed',
        businessModel: 'SaaS',
        country: 'United States',
        city: 'San Francisco',
        monthlyRevenue: 35000,
        annualRevenue: 420000,
        fundingRequired: 2000000,
        targetRoundStage: 'Seed',
        isVerified: true,
        verificationStatus: 'Verified',
        isPublished: true,
        profileVisibility: 'Investors Only',
      });
      console.log('✓ Created baseline VentrivaPay startup for founder@ventriva.com:', startup._id);
    } else {
      console.log('✓ Existing baseline startup found for founder@ventriva.com:', startup.startupName, startup._id);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding baseline startup:', err);
    process.exit(1);
  }
}

seedBaselineFounderStartup();
