const Review = require('../models/Review');
const Package = require('../models/Package');

const refreshPackageRating = async (packageId) => {
  const stats = await Review.aggregate([
    { $match: { package: packageId } },
    {
      $group: {
        _id: '$package',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (stats.length === 0) {
    await Package.findByIdAndUpdate(packageId, { averageRating: 0, reviewCount: 0 });
    return;
  }

  await Package.findByIdAndUpdate(packageId, {
    averageRating: Math.round(stats[0].averageRating * 10) / 10,
    reviewCount: stats[0].reviewCount,
  });
};

module.exports = { refreshPackageRating };
