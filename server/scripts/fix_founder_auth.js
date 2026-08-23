const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');

async function fixFounderAuth() {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);

  const res1 = await User.updateOne({ email: 'founder@ventriva.com' }, { password: hashedPassword });
  console.log(`Updated founder@ventriva.com: ${res1.modifiedCount}`);

  const res2 = await User.updateOne({ email: 'krish@gmail.com' }, { password: hashedPassword });
  console.log(`Updated krish@gmail.com: ${res2.modifiedCount}`);

  await mongoose.connection.close();
  process.exit(0);
}

fixFounderAuth().catch((err) => {
  console.error(err);
  process.exit(1);
});
