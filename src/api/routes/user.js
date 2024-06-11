const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateFirebaseToken = require('../middlewares/authMiddleware');

router.use(authenticateFirebaseToken);
router.get('/', userController.showUsers);
router.get('/:userId', userController.showUserById);

module.exports = router;
