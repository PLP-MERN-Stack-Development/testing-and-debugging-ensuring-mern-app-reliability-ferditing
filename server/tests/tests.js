const mongoose = require('mongoose');

beforeAll(async () => {
  const url = process.env.MONGO_URI || 'mongodb://localhost:27017/testing';
  await mongoose.connect(url);
});

afterAll(async () => {
  await mongoose.connection.close();
});