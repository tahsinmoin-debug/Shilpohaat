const express = require('express');
const router = express.Router();
const { getArtistAnalytics } = require('../controllers/analyticsController');

router.get('/artist-stats', getArtistAnalytics);

module.exports = router;