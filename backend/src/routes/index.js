const express = require('express');
const router = express.Router();

const giftRoutes = require('./gifts');
const checkoutRoutes = require('./checkout');
const questRoutes = require('./quest');
const couponRoutes = require('./coupons');

router.use('/gifts', giftRoutes);
router.use('/', checkoutRoutes);
router.use('/quest', questRoutes);
router.use('/coupons', couponRoutes);

module.exports = router;
