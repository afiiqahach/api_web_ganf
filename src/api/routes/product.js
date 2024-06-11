const express = require('express');
const router = express.Router();
const uploadImage = require('../../services/uploadImage');
const productController = require('../controllers/productController');
const authenticateFirebaseToken = require('../middlewares/authMiddleware');

// Public routes
router.get('/', productController.showProducts);
router.get('/:productId', productController.showProductById);

// Protected routes
router.use(authenticateFirebaseToken);
router.post('/', uploadImage.single('photo'), productController.createProduct);
router.put(
  '/:productId',
  uploadImage.single('photo'),
  productController.updateProduct
);
router.delete('/:productId', productController.deleteProduct);

module.exports = router;
