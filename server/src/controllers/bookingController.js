const Stripe = require('stripe');
const { body } = require('express-validator');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Package = require('../models/Package');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const isStripeConfigured = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  return Boolean(key && key.startsWith('sk_') && !key.includes('...'));
};

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!isStripeConfigured()) throw new AppError('Payment system is not configured', 503);
  return new Stripe(key);
};

/** Stripe Checkout requires absolute HTTPS image URLs; omit local /public paths. */
const stripeProductImages = (images = []) => {
  const base = (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');
  return images
    .map((src) => {
      if (!src) return null;
      if (src.startsWith('http://') || src.startsWith('https://')) return src;
      if (src.startsWith('/')) return `${base}${src}`;
      return null;
    })
    .filter((url) => url && url.startsWith('https://'));
};

const bookingValidators = [
  body('packageId').notEmpty().withMessage('Package is required'),
  body('travelDate').isISO8601().withMessage('Valid travel date is required'),
  body('travelers').toInt().isInt({ min: 1, max: 20 }).withMessage('Travelers must be between 1 and 20'),
  body('contactName').trim().notEmpty().withMessage('Contact name is required'),
  body('contactEmail').isEmail().withMessage('Valid contact email is required'),
  body('contactPhone').optional().trim(),
];

const createCheckoutSession = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.body.packageId);
  if (!pkg || !pkg.isActive) throw new AppError('Package not found', 404);

  const travelers = Number(req.body.travelers);
  const totalAmount = pkg.price * travelers;

  const booking = await Booking.create({
    user: req.user._id,
    package: pkg._id,
    travelDate: new Date(req.body.travelDate),
    travelers,
    contactName: req.body.contactName,
    contactEmail: req.body.contactEmail,
    contactPhone: req.body.contactPhone || '',
    totalAmount,
    status: 'pending',
  });

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

  if (!isStripeConfigured()) {
    if (process.env.NODE_ENV === 'production') {
      throw new AppError('Payment system is not configured', 503);
    }
    booking.status = 'confirmed';
    booking.paidAt = new Date();
    booking.stripeSessionId = `dev_${booking._id}`;
    await booking.save();
    console.log(`[Wanderly] Dev booking confirmed (no Stripe): ${booking.contactEmail}`);
    return res.json({
      success: true,
      url: `${clientUrl}/booking/success?dev_booking=${booking._id}`,
      bookingId: booking._id,
    });
  }

  const stripe = getStripe();
  const images = stripeProductImages(pkg.images).slice(0, 1);
  const productData = {
    name: pkg.title,
    description: `${pkg.durationDays}-day tour · ${travelers} traveler(s)`,
  };
  if (images.length) productData.images = images;

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: productData,
            unit_amount: Math.round(pkg.price * 100),
          },
          quantity: travelers,
        },
      ],
      metadata: {
        bookingId: booking._id.toString(),
        userId: req.user._id.toString(),
      },
      success_url: `${clientUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/packages/${pkg.slug}?cancelled=1`,
    });
  } catch (err) {
    await Booking.findByIdAndDelete(booking._id);
    const message = err?.message || 'Could not start Stripe Checkout';
    throw new AppError(message, 502);
  }

  booking.stripeSessionId = session.id;
  await booking.save();

  res.json({ success: true, url: session.url, bookingId: booking._id });
});

const confirmCheckout = asyncHandler(async (req, res) => {
  const { session_id: sessionId, dev_booking: devBookingId } = req.query;

  if (devBookingId) {
    if (process.env.NODE_ENV === 'production') throw new AppError('Invalid confirmation link', 400);
    const booking = await Booking.findById(devBookingId).populate('package', 'title slug images');
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.user.toString() !== req.user._id.toString()) {
      throw new AppError('Not authorized for this booking', 403);
    }
    return res.json({ success: true, data: booking });
  }

  if (!sessionId) throw new AppError('Missing session id', 400);

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const booking = await Booking.findById(session.metadata?.bookingId).populate('package', 'title slug images');

  if (!booking) throw new AppError('Booking not found', 404);
  if (booking.user.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized for this booking', 403);
  }

  if (session.payment_status === 'paid' && booking.status === 'pending') {
    booking.status = 'confirmed';
    booking.paidAt = new Date();
    booking.stripePaymentIntentId = session.payment_intent || '';
    await booking.save();
    console.log(`[Wanderly] Booking confirmed: ${booking.contactEmail} — ${booking.package.title}`);
  }

  res.json({ success: true, data: booking });
});

const myBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('package', 'title slug images price durationDays location')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: bookings });
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
  if (!booking) throw new AppError('Booking not found', 404);
  if (booking.status === 'completed') throw new AppError('Completed trips cannot be cancelled', 400);
  booking.status = 'cancelled';
  await booking.save();
  res.json({ success: true, data: booking });
});

const adminListBookings = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [data, total] = await Promise.all([
    Booking.find(filter)
      .populate('user', 'name email')
      .populate('package', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(filter),
  ]);

  res.json({ success: true, data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

const adminUpdateBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new AppError('Booking not found', 404);
  if (req.body.status) booking.status = req.body.status;
  await booking.save();
  res.json({ success: true, data: booking });
});

const userSpendingChart = asyncHandler(async (req, res) => {
  const data = await Booking.aggregate([
    { $match: { user: req.user._id, status: { $in: ['confirmed', 'completed'] } } },
    {
      $group: {
        _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } },
        amount: { $sum: '$totalAmount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({
    success: true,
    data: data.map((d) => ({
      label: `${d._id.year}-${String(d._id.month).padStart(2, '0')}`,
      amount: d.amount,
    })),
  });
});

const userOverview = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const dbUser = await User.findById(userId).select('wishlist');
  const [totalBookings, upcoming, spentAgg] = await Promise.all([
    Booking.countDocuments({ user: userId }),
    Booking.countDocuments({
      user: userId,
      status: 'confirmed',
      travelDate: { $gte: new Date() },
    }),
    Booking.aggregate([
      { $match: { user: userId, status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
  ]);
  const wishlistCount = dbUser?.wishlist?.length || 0;

  res.json({
    success: true,
    data: {
      totalBookings,
      upcomingTrips: upcoming,
      totalSpent: spentAgg[0]?.total || 0,
      wishlistCount,
    },
  });
});

const reports = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ status: { $in: ['confirmed', 'completed'] } })
    .populate('user', 'email')
    .populate('package', 'title')
    .sort({ paidAt: -1 })
    .lean();

  res.json({
    success: true,
    data: bookings.map((b) => ({
      id: b._id,
      userEmail: b.user?.email,
      package: b.package?.title,
      amount: b.totalAmount,
      date: b.paidAt || b.createdAt,
      status: b.status,
    })),
  });
});

module.exports = {
  bookingValidators,
  createCheckoutSession,
  confirmCheckout,
  myBookings,
  cancelBooking,
  adminListBookings,
  adminUpdateBooking,
  userSpendingChart,
  userOverview,
  reports,
};
