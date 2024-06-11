const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');

router.get('/', testimonialController.showTestimonials);
router.get('/:testimonialId', testimonialController.showTestimonialById);
router.post('/', testimonialController.createTestimonial);

module.exports = router;
