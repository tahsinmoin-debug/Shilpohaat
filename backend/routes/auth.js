const express = require('express');
const router = express.Router();
const { registerUser, getMe, searchUsers } = require('../controllers/authController.js');

// POST /api/auth/register
router.post('/register', registerUser);

// GET /api/auth/me
router.get('/me', getMe);

// GET /api/auth/search?name=...
router.get('/search', searchUsers);

module.exports = router;