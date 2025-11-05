// server/src/controllers/bugsController.js
const mongoose = require('mongoose');
const Bug = require('../models/Bug');

const createBug = async (req, res, next) => {
  try {
    const { title, content, tags, status } = req.body;
    const authorId = req.user && req.user._id;
    if (!authorId) return res.status(401).json({ error: 'Not authenticated' });
    if (!title || !content) return res.status(400).json({ error: 'Title and content required' });

    const bug = await Bug.create({
      title,
      content,
      author: authorId,
      tags: Array.isArray(tags) ? tags : undefined,
      status: status || undefined
    });
    return res.status(201).json(bug);
  } catch (err) {
    return next(err);
  }
};

const listBugs = async (req, res, next) => {
  try {
    const bugs = await Bug.find({}).sort({ createdAt: -1 });
    return res.status(200).json(bugs);
  } catch (err) {
    return next(err);
  }
};

const getBug = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bug = await Bug.findById(id);
    if (!bug) return res.status(404).json({ error: 'Bug not found' });
    return res.status(200).json(bug);
  } catch (err) {
    return next(err);
  }
};

const updateBug = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const bug = await Bug.findById(id);
    if (!bug) return res.status(404).json({ error: 'Bug not found' });

    if (!req.user || bug.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (updates.title) bug.title = updates.title;
    if (updates.content) bug.content = updates.content;
    if (updates.status && ['open', 'in-progress', 'resolved'].includes(updates.status)) bug.status = updates.status;
    if (updates.tags) bug.tags = updates.tags;

    await bug.save();
    return res.status(200).json(bug);
  } catch (err) {
    return next(err);
  }
};

const deleteBug = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bug = await Bug.findById(id);
    if (!bug) return res.status(404).json({ error: 'Bug not found' });

    if (!req.user || bug.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await Bug.deleteOne({ _id: id });
    return res.status(200).json({ message: 'Bug deleted' });
  } catch (err) {
    return next(err);
  }
};

module.exports = { createBug, listBugs, getBug, updateBug, deleteBug };
