const express = require('express');
const { createBug, listBugs, getBug, updateBug, deleteBug } = require('../controllers/bugsController');
const { verifyToken } = require('../utils/auth');
const devAutoAuth = require('../middleware/devAutoAuth');

const router = express.Router();

router.post('/', devAutoAuth, verifyToken, createBug);
router.get('/', listBugs);
router.get('/:id', getBug);
router.put('/:id', devAutoAuth, verifyToken, updateBug);
router.delete('/:id', devAutoAuth, verifyToken, deleteBug);

module.exports = router;
