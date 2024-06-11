const express = require('express');
const router = express.Router();
const uploadImage = require('../../services/uploadImage');
const authController = require('../controllers/authController');
const authenticateFirebaseToken = require('../middlewares/authMiddleware');

// Public routes
router.post('/login', authController.logInUser);

// Protected routes
router.use(authenticateFirebaseToken);

router.get('/profile', authController.getProfile);
router.put(
  '/profile',
  uploadImage.single('photo'),
  authController.updateProfile
);
router.post('/logout', authController.logOutUser);

module.exports = router;
