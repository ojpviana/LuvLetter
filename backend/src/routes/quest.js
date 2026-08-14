const express = require('express');
const router = express.Router();
const questController = require('../controllers/questController');

router.get('/:hash', questController.getQuest);

module.exports = router;
