const mongoose = require('mongoose');

const BugSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['open', 'in-progress', 'resolved'], default: 'open' },
  tags: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Bug', BugSchema);
