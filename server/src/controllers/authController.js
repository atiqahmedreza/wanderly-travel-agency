const { body } = require('express-validator');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { signToken } = require('../utils/jwt');
const asyncHandler = require('../utils/asyncHandler');
const { uploadToImgBB } = require('../utils/imgbb');

const passwordRules = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters')
  .matches(/[a-z]/)
  .withMessage('Password must include a lowercase letter')
  .matches(/[A-Z]/)
  .withMessage('Password must include an uppercase letter')
  .matches(/\d/)
  .withMessage('Password must include a number')
  .matches(/[^A-Za-z0-9]/)
  .withMessage('Password must include a special character');

const registerValidators = [
  body('name').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  passwordRules,
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match');
    return true;
  }),
];

const loginValidators = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const sendUser = (user, res, status = 200) => {
  const token = signToken(user._id, user.role);
  res.status(status).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      bio: user.bio,
    },
  });
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) throw new AppError('An account with this email already exists', 400);

  const user = await User.create({ name, email, password });
  sendUser(user, res, 201);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  user.password = undefined;
  sendUser(user, res);
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'title slug images price averageRating');
  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      bio: user.bio,
      wishlist: user.wishlist,
    },
  });
});

const updateProfileValidators = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim(),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio is too long'),
];

const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, bio } = req.body;
  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (bio !== undefined) user.bio = bio;

  if (req.body.avatarBase64) {
    user.avatar = await uploadToImgBB(req.body.avatarBase64);
  }

  await user.save();
  res.json({ success: true, user });
});

const changePasswordValidators = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  passwordRules,
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match');
    return true;
  }),
];

const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  const match = await user.comparePassword(req.body.currentPassword);
  if (!match) throw new AppError('Current password is incorrect', 400);
  user.password = req.body.password;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
});

module.exports = {
  register,
  login,
  me,
  updateProfile,
  changePassword,
  registerValidators,
  loginValidators,
  updateProfileValidators,
  changePasswordValidators,
};
