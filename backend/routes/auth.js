const express = require('express');
const router = express.Router();
const { registerUser, getMe } = require('../controllers/authController.js');

// POST /api/auth/register
router.post('/register', registerUser);

// GET /api/auth/me?firebaseUID=...
router.get('/me', getMe);

module.exports = router;
