const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/', categoryController.showCategories);
router.get('/group', categoryController.showCategoriesByType);

module.exports = router;
