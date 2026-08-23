const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const User = require('../models/User');

async function ensureAccounts() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas');

  const accounts = [
    { email: 'admin@ventriva.com', name: 'System Administrator', role: 'admin', password: 'admin123' },
    { email: 'founder@ventriva.com', name: 'Demo Founder', role: 'founder', password: 'founder123' },
    { email: 'investor@ventriva.com', name: 'Demo Investor', role: 'investor', password: 'investor123' },
  ];

  for (const acc of accounts) {
    let user = await User.findOne({ email: acc.email });
    if (!user) {
      user = new User({
        name: acc.name,
        email: acc.email,
        password: acc.password,
        role: acc.role,
        isVerified: true,
        isActive: true,
      });
      await user.save();
      console.log(`Created ${acc.role} account: ${acc.email}`);
    } else {
      user.role = acc.role;
      user.isVerified = true;
      user.isActive = true;
      user.password = acc.password;
      await user.save();
      console.log(`Updated ${acc.role} account: ${acc.email}`);
    }
  }

  await mongoose.connection.close();
  console.log('Account setup complete.');
}

ensureAccounts().catch(console.error);
