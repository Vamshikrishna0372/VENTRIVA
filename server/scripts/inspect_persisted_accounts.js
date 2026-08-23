const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function checkExistingAccounts() {
  console.log('Connecting to MongoDB Atlas at:', process.env.MONGODB_URI?.substring(0, 30) + '...');
  await mongoose.connect(process.env.MONGODB_URI);
  const User = require('../models/User');

  const emails = ['admin@ventriva.com', 'founder@ventriva.com', 'investor@ventriva.com'];
  for (const email of emails) {
    const user = await User.findOne({ email }).select('+password');
    console.log('\n--- Account:', email, '---');
    if (!user) {
      console.log('STATUS: NOT FOUND IN MONGODB');
      continue;
    }
    console.log('ID:', user._id.toString());
    console.log('Name:', user.name);
    console.log('Role:', user.role);
    console.log('IsActive:', user.isActive);
    console.log('Password Hash Length:', user.password ? user.password.length : 'MISSING');
    console.log('Password Hash Format:', user.password ? user.password.substring(0, 12) + '...' : 'NONE');

    const passCandidate = email.split('@')[0] + '123';
    const isMatch = user.password ? await bcrypt.compare(passCandidate, user.password) : false;
    console.log(`Bcrypt Compare ('${passCandidate}'):`, isMatch ? '✓ MATCH' : '❌ NO MATCH');
  }
  await mongoose.connection.close();
}

checkExistingAccounts().catch((err) => {
  console.error('Inspect Accounts Error:', err);
  process.exit(1);
});
