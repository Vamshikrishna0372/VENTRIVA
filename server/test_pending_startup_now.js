const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  await mongoose.connect(uri);

  const Startup = require('./models/Startup');
  const User = require('./models/User');

  // Update AgriGrow to Pending Review (simulating founder submitting profile for audit)
  const agriGrow = await Startup.findById('6a8c70b32b2fb82220f68084');
  if (agriGrow) {
    agriGrow.verificationStatus = 'Pending Review';
    agriGrow.isPublished = true;
    agriGrow.isVerified = false;
    await agriGrow.save();
    console.log('AgriGrow updated to Pending Review (isPublished: true, isVerified: false)');
  }

  // Execute canonical queries
  const canonicalQuery = {
    isDeleted: false,
    isVerified: false,
    $or: [
      { verificationStatus: 'Pending Review' },
      { verificationStatus: 'Pending' },
      { isPublished: true, verificationStatus: { $ne: 'Rejected' } },
    ],
  };

  const count = await Startup.countDocuments(canonicalQuery);
  const pendingItems = await Startup.find(canonicalQuery).select('_id startupName verificationStatus isVerified isPublished');

  console.log('\n--- DIAGNOSTIC RESULTS ---');
  console.log('CANONICAL MONGO PENDING COUNT:', count);
  console.log('PENDING ITEMS IN DB:', pendingItems);

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
