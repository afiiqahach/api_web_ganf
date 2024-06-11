const express = require('express');
const router = express.Router();
const uploadImage = require('../../services/uploadImage');
const promotionController = require('../controllers/promotionController');
const authenticateFirebaseToken = require('../middlewares/authMiddleware');

// Public routes
router.get('/', promotionController.showPromotions);

// Protected routes
router.use(authenticateFirebaseToken);

router.get('/:promotionId', promotionController.showPromotionById);
router.post(
  '/',
  uploadImage.single('photo'),
  promotionController.createPromotion
);
router.put(
  '/:promotionId',
  uploadImage.single('photo'),
  promotionController.updatePromotion
);
router.delete('/:promotionId', promotionController.deletePromotion);

module.exports = router;
