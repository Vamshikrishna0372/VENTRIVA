const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');

const seedAdmin = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.error('[Admin Seed Error] MONGODB_URI is not set in environment variables.');
    process.exit(1);
  }

  const adminName = process.env.ADMIN_NAME || 'Ventriva Admin';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@ventriva.org';
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('[Admin Seed Error] Please set ADMIN_PASSWORD in environment variables prior to running seed.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI);
    console.log('[Admin Seed] Connected to MongoDB.');

    const normalizedEmail = adminEmail.toLowerCase().trim();

    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      $or: [{ email: normalizedEmail }, { role: 'admin' }],
    });

    if (existingAdmin) {
      console.log(`[Admin Seed] Admin user already exists (${existingAdmin.email}). No action taken.`);
      process.exit(0);
    }

    const adminUser = await User.create({
      name: adminName,
      email: normalizedEmail,
      password: adminPassword,
      role: 'admin',
      isVerified: true,
      isActive: true,
    });

    console.log(`=======================================================`);
    console.log(`✅ Admin Account Provisioned Successfully!`);
    console.log(`👤 Name: ${adminUser.name}`);
    console.log(`📧 Email: ${adminUser.email}`);
    console.log(`🛡️  Role: ${adminUser.role}`);
    console.log(`=======================================================`);

    process.exit(0);
  } catch (error) {
    console.error(`[Admin Seed Error] Execution failed: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
