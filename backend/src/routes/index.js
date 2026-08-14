const express = require('express');
const router = express.Router();

const giftRoutes = require('./gifts');
const checkoutRoutes = require('./checkout');
const questRoutes = require('./quest');

router.use('/gifts', giftRoutes);
router.use('/', checkoutRoutes);
router.use('/quest', questRoutes);

module.exports = router;
