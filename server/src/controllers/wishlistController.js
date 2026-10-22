const User = require('../models/User');
const Package = require('../models/Package');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const toggleWishlist = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.packageId);
  if (!pkg) throw new AppError('Package not found', 404);

  const user = await User.findById(req.user._id);
  const index = user.wishlist.findIndex((id) => id.toString() === pkg._id.toString());
  let added = false;
  if (index === -1) {
    user.wishlist.push(pkg._id);
    added = true;
  } else {
    user.wishlist.splice(index, 1);
  }
  await user.save();

  res.json({ success: true, added, wishlist: user.wishlist });
});

const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    populate: [{ path: 'destination' }, { path: 'category' }],
  });
  res.json({ success: true, data: user.wishlist });
});

module.exports = { toggleWishlist, getWishlist };
