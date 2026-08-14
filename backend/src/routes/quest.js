const express = require('express');
const router = express.Router();
const questController = require('../controllers/questController');

// GET /api/quest/:hash — Public quest page (only if paid)
router.get('/:hash', questController.getQuest);

module.exports = router;
