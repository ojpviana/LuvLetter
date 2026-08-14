const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');

// POST /api/checkout — Create payment link/Pix
router.post('/checkout', checkoutController.createCheckout);

// POST /api/webhook — Payment webhook
router.post('/webhook', checkoutController.handleWebhook);

module.exports = router;
