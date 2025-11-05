// server/src/app.js
const express = require('express');
const cors = require('cors');            // <- required
const app = express();
const devAutoAuth = require('./middleware/devAutoAuth');

// Parse JSON and enable CORS before other middleware
app.use(express.json());
app.use(cors());

// Register dev auto-auth after CORS and body parsing
// (it will attach req.user and inject a dev token in non-prod)
app.use(devAutoAuth);

// Routes
const bugsRouter = require('./routes/bugs');
app.use('/api/bugs', bugsRouter);

// Basic JSON error handler
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Server Error' });
});

module.exports = app;
