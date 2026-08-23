const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function cleanUsers() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const res = await db.collection('users').deleteMany({
    email: { $nin: ['admin@ventriva.com', 'founder@ventriva.com', 'investor@ventriva.com'] }
  });
  console.log('Deleted non-baseline users count:', res.deletedCount);
  const count = await db.collection('users').countDocuments();
  console.log('Remaining clean users count:', count);
  await mongoose.disconnect();
}

cleanUsers().catch(console.error);
