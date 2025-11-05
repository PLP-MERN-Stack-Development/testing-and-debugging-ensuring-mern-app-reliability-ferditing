// server/scripts/createTestUser.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const User = require('../src/models/User');
const { generateToken } = require('../src/utils/auth');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mern-testing';

async function run() {
  await mongoose.connect(MONGO_URI);
  let user = await User.findOne({ email: 'dev@example.com' });
  if (!user) {
    user = await User.create({
      username: 'devuser',
      email: 'dev@example.com',
      password: 'password123'
    });
    console.log('Created test user:', user._id.toString());
  } else {
    console.log('Found existing test user:', user._id.toString());
  }
  const token = generateToken(user);
  console.log('TOKEN=', token);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
