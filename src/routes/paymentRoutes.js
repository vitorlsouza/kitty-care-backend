const express = require('express');
const { validateCreateStripeSubscription } = require('../middlewares/validationMiddleware');
const authenticateToken = require('../middlewares/authMiddleware');
const paymentController = require('../controllers/paymentController');
const router = express.Router();

router.post('/stripe/subscription', authenticateToken, validateCreateStripeSubscription, paymentController.createStripeSubscription);
router.delete('/stripe/subscription/:id', authenticateToken, paymentController.cancelStripeSubscription);

router.get('/paypal/products', authenticateToken, paymentController.getPayPalListProducts);
router.post('/paypal/product', authenticateToken, paymentController.createPayPalProduct);
router.get('/paypal/plans', authenticateToken, paymentController.getPayPalListPlans);
router.post('/paypal/plan', authenticateToken, paymentController.createPayPalPlan);
router.post('/paypal/subscription', authenticateToken, paymentController.createPayPalSubscription);
router.post('/paypal/subscription/:id', paymentController.cancelPayPalSubscription);

module.exports = router; 