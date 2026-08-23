const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

async function ensureAdminAccount() {
  try {
    console.log('=== ENSURING ADMIN ACCOUNT: admin@ventriva.com / admin123 ===');
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('✓ Connected to MongoDB Atlas');

    // 1. Delete any old/conflicting admin user accounts that are not admin@ventriva.com
    const deleted = await User.deleteMany({
      $or: [
        { role: 'admin', email: { $ne: 'admin@ventriva.com' } },
        { email: 'admin@ventriva.org' },
      ],
    });
    console.log(`✓ Removed ${deleted.deletedCount} old/conflicting admin accounts.`);

    // 2. Find or Create admin@ventriva.com
    let admin = await User.findOne({ email: 'admin@ventriva.com' });
    if (admin) {
      admin.name = 'System Administrator';
      admin.password = 'admin123';
      admin.role = 'admin';
      admin.isActive = true;
      admin.isVerified = true;
      await admin.save();
      console.log('✓ Updated existing admin account: admin@ventriva.com');
    } else {
      admin = new User({
        name: 'System Administrator',
        email: 'admin@ventriva.com',
        password: 'admin123',
        role: 'admin',
        isActive: true,
        isVerified: true,
      });
      await admin.save();
      console.log('✓ Created fresh admin account: admin@ventriva.com');
    }

    // 3. Verify account password
    const verifiedAdmin = await User.findOne({ email: 'admin@ventriva.com' }).select('+password');
    const isMatch = await verifiedAdmin.matchPassword('admin123');
    console.log(`✓ Password match check for admin123: ${isMatch}`);

    if (!isMatch) {
      throw new Error('Password verification failed for admin@ventriva.com');
    }

    console.log('✓ Admin account setup complete: admin@ventriva.com / admin123');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error(`✗ Error creating admin account: ${err.message}`);
    process.exit(1);
  }
}

ensureAdminAccount();
