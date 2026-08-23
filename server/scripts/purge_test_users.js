const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function purgeTestUsers() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  await db.collection('users').deleteMany({
    email: { $nin: ['admin@ventriva.com', 'founder@ventriva.com', 'investor@ventriva.com'] },
  });
  const count = await db.collection('users').countDocuments();
  const totalDocs = (await db.listCollections().toArray()).reduce(async (accP, col) => {
    const acc = await accP;
    return acc + (await db.collection(col.name).countDocuments());
  }, Promise.resolve(0));

  console.log(`User Count: ${count}`);
  console.log(`Total Database Document Count: ${await totalDocs}`);
  await mongoose.connection.close();
}

purgeTestUsers().catch(console.error);
