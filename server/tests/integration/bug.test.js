// server/tests/integration/bug.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const Bug = require('../../src/models/Bug');
const User = require('../../src/models/User');
const { generateToken } = require('../../src/utils/auth');

let mongoServer;
let token;
let userId;
let bugId;

beforeAll(async () => {
  // Allow longer time for setup
  jest.setTimeout(30000);

  // If MONGO_URI is provided (e.g., you set it for local Mongo / Docker), use that
  const envUri = process.env.MONGO_URI || process.env.MONGO_URI_TEST;
  if (envUri) {
    // Connect to provided Mongo (local or Docker)
    await mongoose.connect(envUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  } else {
    // Fallback to mongodb-memory-server with retries
    const maxAttempts = 3;
    let attempt = 0;
    let lastErr;
    while (attempt < maxAttempts) {
      attempt += 1;
      try {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        });
        break;
      } catch (err) {
        lastErr = err;
        console.warn(`[test-setup] MongoMemoryServer.create() attempt ${attempt} failed:`, err.message || err);
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    if (!mongoose.connection.readyState) {
      throw lastErr || new Error('Failed to start MongoMemoryServer');
    }
  }

  // Create a test user and token used by tests
  const existing = await User.findOne({ email: 'test@example.com' });
  let user;
  if (existing) {
    user = existing;
  } else {
    user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
  }
  userId = user._id;
  token = generateToken(user);

  // Create an initial bug used by some tests
  const bug = await Bug.create({
    title: 'Test Bug',
    content: 'This is a test bug content',
    author: userId,
    status: 'open'
  });
  bugId = bug._id;
}, 30000);

afterAll(async () => {
  try {
    await mongoose.disconnect();
  } catch (e) {
    console.warn('[test-teardown] mongoose.disconnect() failed', e);
  }
  if (mongoServer && typeof mongoServer.stop === 'function') {
    try {
      await mongoServer.stop();
    } catch (e) {
      console.warn('[test-teardown] mongoServer.stop() failed', e);
    }
  }
});

// Clean up database between tests, keep users collection (so token/user remain)
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    // keep users collection so token + user survive across tests
    if (collection.collectionName === 'users') continue;
    try {
      await collection.deleteMany({});
    } catch (e) {
      // ignore
    }
  }

  // Recreate initial bug for tests that expect it
  const existingBug = await Bug.findOne({ title: 'Test Bug' });
  if (!existingBug) {
    const recreated = await Bug.create({
      title: 'Test Bug',
      content: 'This is a test bug content',
      author: userId,
      status: 'open'
    });
    bugId = recreated._id;
  }
});

describe('POST /api/bugs', () => {
  it('should create a new bug when authenticated', async () => {
    const newBug = {
      title: 'New Test Bug',
      content: 'This is a new test bug content'
    };

    const res = await request(app)
      .post('/api/bugs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBug);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toBe(newBug.title);
    expect(res.body.content).toBe(newBug.content);
    expect(res.body.author).toBe(userId.toString());
  });

  it('should return 401 if not authenticated', async () => {
    const newBug = {
      title: 'Unauthorized Bug',
      content: 'This should not be created'
    };

    const res = await request(app)
      .post('/api/bugs')
      .send(newBug);

    expect(res.status).toBe(401);
  });

  it('should return 400 if validation fails', async () => {
    const invalidBug = {
      // Missing title
      content: 'This bug is missing a title'
    };

    const res = await request(app)
      .post('/api/bugs')
      .set('Authorization', `Bearer ${token}`)
      .send(invalidBug);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /api/bugs', () => {
  it('should return all bugs', async () => {
    const res = await request(app).get('/api/bugs');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should paginate results', async () => {
    // Create multiple bugs
    const bugs = [];
    for (let i = 0; i < 15; i++) {
      bugs.push({
        title: `Pagination Bug ${i}`,
        content: `Content for pagination test ${i}`,
        author: userId,
        status: 'open'
      });
    }
    await Bug.insertMany(bugs);

    const page1 = await request(app)
      .get('/api/bugs?page=1&limit=10');

    const page2 = await request(app)
      .get('/api/bugs?page=2&limit=10');

    expect(page1.status).toBe(200);
    expect(page2.status).toBe(200);
    expect(page1.body.length).toBe(10);
    expect(page2.body.length).toBeGreaterThan(0);
    expect(page1.body[0]._id).not.toBe(page2.body[0]._id);
  });
});

describe('GET /api/bugs/:id', () => {
  it('should return a bug by ID', async () => {
    const res = await request(app)
      .get(`/api/bugs/${bugId}`);

    expect(res.status).toBe(200);
    expect(res.body._id).toBe(bugId.toString());
    expect(res.body.title).toBe('Test Bug');
  });

  it('should return 404 for non-existent bug', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/bugs/${nonExistentId}`);

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/bugs/:id', () => {
  it('should update a bug when authenticated as author', async () => {
    const updates = {
      title: 'Updated Test Bug',
      content: 'This content has been updated'
    };

    const res = await request(app)
      .put(`/api/bugs/${bugId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updates);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe(updates.title);
    expect(res.body.content).toBe(updates.content);
  });

  it('should return 401 if not authenticated', async () => {
    const updates = {
      title: 'Unauthorized Update'
    };

    const res = await request(app)
      .put(`/api/bugs/${bugId}`)
      .send(updates);

    expect(res.status).toBe(401);
  });

  it('should return 403 if not the author', async () => {
    // Create another user
    const anotherUser = await User.create({
      username: 'anotheruser',
      email: `another-${Date.now()}@example.com`,
      password: 'password123'
    });
    const anotherToken = generateToken(anotherUser);

    const updates = {
      title: 'Forbidden Update'
    };

    const res = await request(app)
      .put(`/api/bugs/${bugId}`)
      .set('Authorization', `Bearer ${anotherToken}`)
      .send(updates);

    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/bugs/:id', () => {
  it('should delete a bug when authenticated as author', async () => {
    const res = await request(app)
      .delete(`/api/bugs/${bugId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);

    // Verify bug is deleted
    const deletedBug = await Bug.findById(bugId);
    expect(deletedBug).toBeNull();
  });

  it('should return 401 if not authenticated', async () => {
    const res = await request(app)
      .delete(`/api/bugs/${bugId}`);

    expect(res.status).toBe(401);
  });
});
