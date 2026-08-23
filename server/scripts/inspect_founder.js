const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const { connectDB, disconnectDB } = require('../config/database');
const User = require('../models/User');

async function inspectFounders() {
  await connectDB();
  console.log('Connected to DB');

  const founders = await User.find({ role: 'founder' }).select('+password').lean();
  console.log(`Total Founder accounts in DB: ${founders.length}`);

  for (const f of founders) {
    console.log({
      _id: f._id,
      name: f.name,
      email: f.email,
      role: f.role,
      isActive: f.isActive,
      isVerified: f.isVerified,
      hasPassword: !!f.password,
      passwordHash: f.password ? f.password.substring(0, 20) + '...' : 'MISSING',
    });
  }

  await disconnectDB();
}

inspectFounders().catch(console.error);
