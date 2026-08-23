const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');

async function cleanExtraUsers() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const users = await db.collection('users').find({}).toArray();
  console.log('Current Total Users:', users.length);

  const primaryEmails = ['admin@ventriva.com', 'founder@ventriva.com', 'investor@ventriva.com'];
  for (const u of users) {
    console.log(`- [${u._id}] ${u.email} (${u.role})`);
    if (!primaryEmails.includes(u.email)) {
      console.log(`  Deleting test/extra user account: ${u.email}`);
      await db.collection('users').deleteOne({ _id: u._id });
    }
  }

  const remainingUsers = await db.collection('users').countDocuments();
  console.log('Remaining Primary Users Count:', remainingUsers);

  // Clean all other 49 business collections
  const dbCols = await db.listCollections().toArray();
  for (const col of dbCols) {
    if (col.name !== 'users') {
      await db.collection(col.name).deleteMany({});
    }
  }

  let totalDocs = 0;
  for (const col of dbCols) {
    totalDocs += await db.collection(col.name).countDocuments();
  }
  console.log('Final Total Database Documents:', totalDocs);

  await mongoose.connection.close();
}

cleanExtraUsers().catch(console.error);
