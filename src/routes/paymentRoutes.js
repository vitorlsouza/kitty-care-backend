const express = require('express');
const { validateCreateStripeSubscription } = require('../middlewares/validationMiddleware');
const authenticateToken = require('../middlewares/authMiddleware');
const paymentController = require('../controllers/paymentController');
const router = express.Router();

router.post('/stripe/subscription', authenticateToken, validateCreateStripeSubscription, paymentController.createStripeSubscription);
router.delete('/stripe/subscription/:subscriptionId', authenticateToken, paymentController.cancelStripeSubscription);

module.exports = router; 