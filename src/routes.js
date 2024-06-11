const auth = require('./api/routes/auth');
const user = require('./api/routes/user');
const category = require('./api/routes/category');
const series = require('./api/routes/series');
const promotion = require('./api/routes/promotion');
const product = require('./api/routes/product');
const testimonial = require('./api/routes/testimonial');

const routes = [
  {
    path: '/api/auth',
    api: auth,
  },
  {
    path: '/api/users',
    api: user,
  },
  {
    path: '/api/categories',
    api: category,
  },
  {
    path: '/api/clothing-series',
    api: series,
  },
  {
    path: '/api/promotions',
    api: promotion,
  },
  {
    path: '/api/products',
    api: product,
  },
  {
    path: '/api/testimonials',
    api: testimonial,
  },
];

module.exports = routes;
