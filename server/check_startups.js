const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  console.log('Connecting to Mongo URI...');
  await mongoose.connect(uri);
  const Startup = require('./models/Startup');
  const User = require('./models/User');

  const all = await Startup.find({ isDeleted: false });
  console.log('TOTAL NON-DELETED STARTUPS:', all.length);
  all.forEach(s => {
    console.log({
      id: s._id.toString(),
      name: s.startupName,
      isVerified: s.isVerified,
      verificationStatus: s.verificationStatus,
      isPublished: s.isPublished,
      founder: s.founder?.toString()
    });
  });
  process.exit(0);
}

check().catch(err => {
  console.error('MONGO CHECK ERROR:', err);
  process.exit(1);
});
