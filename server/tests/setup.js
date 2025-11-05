const mongoose = require('mongoose');

beforeAll(async () => {
  // const url = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mern-testing-test';
  // await mongoose.connect(url);
});

afterAll(async () => {
  await mongoose.connection.close();
});