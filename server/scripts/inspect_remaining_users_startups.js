const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const User = require('../models/User');
const Startup = require('../models/Startup');

async function inspectRemaining() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find().select('name email role createdAt').lean();
  const startups = await Startup.find().select('startupName founder status createdAt').lean();

  console.log('=== REMAINING USERS IN MONGO ATLAS ===');
  console.log(JSON.stringify(users, null, 2));

  console.log('\n=== REMAINING STARTUPS IN MONGO ATLAS ===');
  console.log(JSON.stringify(startups, null, 2));

  await mongoose.connection.close();
}

inspectRemaining();
