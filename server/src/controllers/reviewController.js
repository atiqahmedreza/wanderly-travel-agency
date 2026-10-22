const { body } = require('express-validator');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { refreshPackageRating } = require('../utils/packageStats');

const reviewValidators = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
  body('comment').trim().notEmpty().withMessage('Review comment is required').isLength({ max: 2000 }),
  body('bookingId').notEmpty().withMessage('Booking reference is required'),
];

const listForPackage = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ package: req.params.packageId })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });

  const breakdown = [1, 2, 3, 4, 5].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  res.json({ success: true, data: reviews, breakdown });
});

const createReview = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.body.bookingId);
  if (!booking || booking.user.toString() !== req.user._id.toString()) {
    throw new AppError('Invalid booking for review', 400);
  }
  if (booking.status !== 'completed') {
    throw new AppError('You can review after your trip is marked completed', 400);
  }

  const existing = await Review.findOne({ user: req.user._id, package: booking.package });
  if (existing) throw new AppError('You already reviewed this package', 400);

  const review = await Review.create({
    user: req.user._id,
    package: booking.package,
    booking: booking._id,
    rating: req.body.rating,
    comment: req.body.comment,
  });

  await refreshPackageRating(booking.package);
  const populated = await review.populate('user', 'name avatar');
  res.status(201).json({ success: true, data: populated });
});

const featuredTestimonials = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ rating: { $gte: 4 } })
    .populate('user', 'name avatar')
    .populate('package', 'title location')
    .sort({ createdAt: -1 })
    .limit(6);
  res.json({ success: true, data: reviews });
});

module.exports = { listForPackage, createReview, reviewValidators, featuredTestimonials };
