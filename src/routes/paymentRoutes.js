const express = require('express');
const { validateCreateStripeSubscription } = require('../middlewares/validationMiddleware');
const authenticateToken = require('../middlewares/authMiddleware');
const paymentController = require('../controllers/paymentController');
const router = express.Router();

router.post('/stripe/subscription', authenticateToken, validateCreateStripeSubscription, paymentController.createStripeSubscription);

module.exports = router; 