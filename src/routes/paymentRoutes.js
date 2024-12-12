const express = require('express');
const { validateCreateStripeSubscription } = require('../middlewares/validationMiddleware');
const authenticateToken = require('../middlewares/authMiddleware');
const paymentController = require('../controllers/paymentController');
const router = express.Router();

router.post('/stripe/subscription', authenticateToken, validateCreateStripeSubscription, paymentController.createStripeSubscription);
router.delete('/stripe/subscription/:id', authenticateToken, paymentController.cancelStripeSubscription);

router.post('/paypal/subscription', authenticateToken, paymentController.cancelPayPalSubscription);
router.post('/paypal/subscription/:id', authenticateToken, paymentController.cancelPayPalSubscription);

module.exports = router; 