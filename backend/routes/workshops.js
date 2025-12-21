const express = require('express');
const router = express.Router();
const {
  createWorkshop,
  getAllWorkshops,
} = require('../controllers/workshopController.js');

// GET /api/workshops - Get all workshops
router.get('/', getAllWorkshops);

// POST /api/workshops - Create new workshop
router.post('/', createWorkshop);

module.exports = router;