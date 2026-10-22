const express = require('express');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');

const auth = require('../controllers/authController');
const packages = require('../controllers/packageController');
const stats = require('../controllers/statsController');
const bookings = require('../controllers/bookingController');
const reviews = require('../controllers/reviewController');
const wishlist = require('../controllers/wishlistController');
const meta = require('../controllers/metaController');

const router = express.Router();

router.get('/health', (req, res) => res.json({ success: true, message: 'Wanderly API is running' }));

router.post('/auth/register', auth.registerValidators, validate, auth.register);
router.post('/auth/login', auth.loginValidators, validate, auth.login);
router.get('/auth/me', protect, auth.me);
router.patch('/auth/profile', protect, auth.updateProfileValidators, validate, auth.updateProfile);
router.patch('/auth/password', protect, auth.changePasswordValidators, validate, auth.changePassword);

router.get('/stats/public', stats.getPublicStats);
router.get('/stats/why-us', stats.getWhyChooseUs);

router.get('/packages', packages.listPackages);
router.get('/packages/featured', packages.getFeatured);
router.get('/packages/:id', packages.getPackageById);
router.get('/packages/:id/related', packages.getRelated);

router.get('/destinations', meta.listDestinations);
router.get('/categories', meta.listCategories);

router.get('/reviews/testimonials', reviews.featuredTestimonials);
router.get('/reviews/package/:packageId', reviews.listForPackage);
router.post('/reviews', protect, reviews.reviewValidators, validate, reviews.createReview);

router.get('/blog', meta.listBlog);
router.get('/blog/latest', meta.latestBlog);
router.get('/blog/:slug', meta.getBlogPost);

router.post('/contact', meta.contactValidators, validate, meta.submitContact);
router.post('/newsletter', meta.newsletterValidators, validate, meta.subscribeNewsletter);

router.post('/bookings/checkout', protect, bookings.bookingValidators, validate, bookings.createCheckoutSession);
router.get('/bookings/confirm', protect, bookings.confirmCheckout);
router.get('/bookings/me', protect, bookings.myBookings);
router.patch('/bookings/:id/cancel', protect, bookings.cancelBooking);
router.get('/bookings/overview', protect, bookings.userOverview);
router.get('/bookings/spending-chart', protect, bookings.userSpendingChart);

router.post('/wishlist/:packageId', protect, wishlist.toggleWishlist);
router.get('/wishlist', protect, wishlist.getWishlist);

router.get('/admin/overview', protect, restrictTo('admin'), stats.getAdminOverview);
router.get('/admin/charts', protect, restrictTo('admin'), stats.getAdminCharts);
router.get('/admin/reports', protect, restrictTo('admin'), bookings.reports);

router.get('/admin/packages', protect, restrictTo('admin'), packages.adminList);
router.post('/admin/packages', protect, restrictTo('admin'), packages.createPackage);
router.patch('/admin/packages/:id', protect, restrictTo('admin'), packages.updatePackage);
router.delete('/admin/packages/:id', protect, restrictTo('admin'), packages.deletePackage);

router.get('/admin/bookings', protect, restrictTo('admin'), bookings.adminListBookings);
router.patch('/admin/bookings/:id', protect, restrictTo('admin'), bookings.adminUpdateBooking);

router.get('/admin/users', protect, restrictTo('admin'), meta.adminUsers);
router.patch('/admin/users/:id', protect, restrictTo('admin'), meta.updateUserRole);
router.delete('/admin/users/:id', protect, restrictTo('admin'), meta.deleteUser);

router.get('/admin/destinations', protect, restrictTo('admin'), meta.adminDestinations);
router.post('/admin/destinations', protect, restrictTo('admin'), meta.adminDestinations);
router.patch('/admin/destinations/:id', protect, restrictTo('admin'), meta.updateDestination);
router.delete('/admin/destinations/:id', protect, restrictTo('admin'), meta.deleteDestination);

router.get('/admin/categories', protect, restrictTo('admin'), meta.listCategories);
router.post('/admin/categories', protect, restrictTo('admin'), meta.adminCategories);
router.patch('/admin/categories/:id', protect, restrictTo('admin'), meta.updateCategory);
router.delete('/admin/categories/:id', protect, restrictTo('admin'), meta.deleteCategory);

module.exports = router;
