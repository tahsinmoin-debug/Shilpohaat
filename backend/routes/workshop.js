const express = require('express');
const router = express.Router();
const { createWorkshop, getAllWorkshops } = require('../controllers/workshopController');

router.get('/', getAllWorkshops);
router.post('/', createWorkshop);

module.exports = router;