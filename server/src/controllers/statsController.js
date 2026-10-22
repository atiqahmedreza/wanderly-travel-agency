const Package = require('../models/Package');
const Destination = require('../models/Destination');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Review = require('../models/Review');
const asyncHandler = require('../utils/asyncHandler');

const getPublicStats = asyncHandler(async (req, res) => {
  const [tripsBooked, destinations, travelers, ratingAgg, heroDestinations] = await Promise.all([
    Booking.countDocuments({ status: { $in: ['confirmed', 'completed'] } }),
    Destination.countDocuments(),
    User.countDocuments({ role: 'user' }),
    Review.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
    Destination.find().sort({ packageCount: -1 }).limit(6).lean(),
  ]);

  const averageRating = ratingAgg[0]?.avg ? Math.round(ratingAgg[0].avg * 10) / 10 : 0;

  res.json({
    success: true,
    data: {
      tripsBooked,
      destinations,
      happyTravelers: travelers,
      averageRating,
      heroDestinations,
    },
  });
});

const getWhyChooseUs = asyncHandler(async (req, res) => {
  const [packages, confirmedBookings, reviews, yearsActive] = await Promise.all([
    Package.countDocuments({ isActive: true }),
    Booking.countDocuments({ status: { $in: ['confirmed', 'completed'] } }),
    Review.countDocuments(),
    Promise.resolve(8),
  ]);

  res.json({
    success: true,
    data: [
      { label: 'Curated packages', value: packages, suffix: '+' },
      { label: 'Successful departures', value: confirmedBookings, suffix: '+' },
      { label: 'Verified reviews', value: reviews, suffix: '+' },
      { label: 'Years crafting journeys', value: yearsActive, suffix: '' },
    ],
  });
});

const getAdminOverview = asyncHandler(async (req, res) => {
  const [users, packages, bookings, revenueAgg] = await Promise.all([
    User.countDocuments(),
    Package.countDocuments(),
    Booking.countDocuments({ status: { $in: ['confirmed', 'completed'] } }),
    Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] }, totalAmount: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      totalUsers: users,
      totalPackages: packages,
      totalBookings: bookings,
      totalRevenue: revenueAgg[0]?.total || 0,
    },
  });
});

const getAdminCharts = asyncHandler(async (req, res) => {
  const bookingsByDestination = await Booking.aggregate([
    { $match: { status: { $in: ['confirmed', 'completed'] } } },
    {
      $lookup: {
        from: 'packages',
        localField: 'package',
        foreignField: '_id',
        as: 'pkg',
      },
    },
    { $unwind: '$pkg' },
    {
      $lookup: {
        from: 'destinations',
        localField: 'pkg.destination',
        foreignField: '_id',
        as: 'dest',
      },
    },
    { $unwind: '$dest' },
    { $group: { _id: '$dest.name', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 },
  ]);

  const monthlyRevenue = await Booking.aggregate([
    { $match: { status: { $in: ['confirmed', 'completed'] }, paidAt: { $exists: true } } },
    {
      $group: {
        _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } },
        revenue: { $sum: '$totalAmount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 },
  ]);

  const byCategory = await Booking.aggregate([
    { $match: { status: { $in: ['confirmed', 'completed'] } } },
    {
      $lookup: { from: 'packages', localField: 'package', foreignField: '_id', as: 'pkg' },
    },
    { $unwind: '$pkg' },
    {
      $lookup: { from: 'categories', localField: 'pkg.category', foreignField: '_id', as: 'cat' },
    },
    { $unwind: '$cat' },
    { $group: { _id: '$cat.name', value: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    data: {
      bookingsByDestination: bookingsByDestination.map((d) => ({ name: d._id, count: d.count })),
      monthlyRevenue: monthlyRevenue.map((m) => ({
        label: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
        revenue: m.revenue,
      })),
      byCategory: byCategory.map((c) => ({ name: c._id, value: c.value })),
    },
  });
});

module.exports = { getPublicStats, getWhyChooseUs, getAdminOverview, getAdminCharts };
