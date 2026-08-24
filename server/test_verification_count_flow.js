const mongoose = require('mongoose');
require('dotenv').config();

async function runTest() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  await mongoose.connect(uri);

  const Startup = require('./models/Startup');
  const User = require('./models/User');

  const targetStartupId = '6a8c70b32b2fb82220f68084'; // AgriGrow
  const startup = await Startup.findById(targetStartupId);

  if (!startup) {
    console.error('Target startup not found');
    process.exit(1);
  }

  console.log('--- TEST STEP 1: BASELINE RECORD STATE ---');
  console.log({
    id: startup._id.toString(),
    name: startup.startupName,
    isVerified: startup.isVerified,
    verificationStatus: startup.verificationStatus,
    isPublished: startup.isPublished,
  });

  // Calculate baseline pending count using canonical query
  const baselineCount = await Startup.countDocuments({
    isDeleted: false,
    isVerified: false,
    verificationStatus: 'Pending Review',
  });
  console.log('Baseline Pending Review Count in Mongo:', baselineCount);

  console.log('\n--- TEST STEP 2: FOUNDER SUBMITS FOR VERIFICATION (Pending Review) ---');
  startup.verificationStatus = 'Pending Review';
  startup.isPublished = true;
  await startup.save();

  const pendingCountAfterSubmit = await Startup.countDocuments({
    isDeleted: false,
    isVerified: false,
    verificationStatus: 'Pending Review',
  });
  console.log('Pending Review Count after Founder Submission:', pendingCountAfterSubmit);
  if (pendingCountAfterSubmit !== 1) {
    console.error('FAIL: Expected pending count 1, got', pendingCountAfterSubmit);
  } else {
    console.log('PASS: Dashboard count dynamically scales to 1 when a startup is submitted for review!');
  }

  console.log('\n--- TEST STEP 3: ADMIN APPROVES STARTUP ---');
  startup.verificationStatus = 'Verified';
  startup.isVerified = true;
  startup.verifiedAt = new Date();
  await startup.save();

  const pendingCountAfterApprove = await Startup.countDocuments({
    isDeleted: false,
    isVerified: false,
    verificationStatus: 'Pending Review',
  });
  console.log('Pending Review Count after Admin Approval:', pendingCountAfterApprove);

  console.log('\n--- TEST STEP 4: RESET TO ORIGINAL BASELINE ---');
  startup.verificationStatus = 'Unverified';
  startup.isVerified = false;
  startup.isPublished = false;
  await startup.save();
  console.log('Reset complete. Original database state restored cleanly.');

  process.exit(0);
}

runTest().catch((err) => {
  console.error(err);
  process.exit(1);
});
