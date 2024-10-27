const express = require('express');
const supabaseController = require('../controllers/supabaseController');
const { validateSignup, validateSignin, validateCreateSubscription, validateUpdateSubscription, validateCreateCat, validateUpdateCat, validateChatMessage, validateUpdateConversation } = require('../middlewares/validationMiddleware');
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/signup', validateSignup, supabaseController.signup);
router.post('/signin', validateSignin, supabaseController.signin);

router.get('/subscriptions', authenticateToken, supabaseController.getSubscription);
router.post('/subscriptions', authenticateToken, validateCreateSubscription, supabaseController.createSubscription);
router.put('/subscriptions/:id', authenticateToken, validateUpdateSubscription, supabaseController.updateSubscription);
router.delete('/subscriptions/:id', authenticateToken, supabaseController.deleteSubscription);

router.get('/cats', authenticateToken, supabaseController.getCats);
router.post('/cats', authenticateToken, validateCreateCat, supabaseController.createCat);
router.put('/cats/:id', authenticateToken, validateUpdateCat, supabaseController.updateCat);
router.delete('/cats/:id', authenticateToken, supabaseController.deleteCat);

router.post('/chat', authenticateToken, validateChatMessage, supabaseController.postChatMessage);

router.get('/conversations', authenticateToken, supabaseController.getConversations);
router.post('/conversations', authenticateToken, supabaseController.createConversation);
router.put('/conversations/:id', authenticateToken, validateUpdateConversation, supabaseController.updateConversation);
router.delete('/conversations/:id', authenticateToken, supabaseController.deleteConversation);

module.exports = router;
