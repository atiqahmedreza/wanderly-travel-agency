const mongoose = require('mongoose');
const Destination = require('../models/Destination');
const Category = require('../models/Category');
const BlogPost = require('../models/BlogPost');
const ContactMessage = require('../models/ContactMessage');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const User = require('../models/User');
const { body } = require('express-validator');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const listDestinations = asyncHandler(async (req, res) => {
  const data = await Destination.find().sort({ packageCount: -1 });
  res.json({ success: true, data });
});

const adminDestinations = asyncHandler(async (req, res) => {
  if (req.method === 'GET') {
    const data = await Destination.find().sort({ name: 1 });
    return res.json({ success: true, data });
  }
  const dest = await Destination.create(req.body);
  res.status(201).json({ success: true, data: dest });
});

const updateDestination = asyncHandler(async (req, res) => {
  const dest = await Destination.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!dest) throw new AppError('Destination not found', 404);
  res.json({ success: true, data: dest });
});

const deleteDestination = asyncHandler(async (req, res) => {
  const dest = await Destination.findByIdAndDelete(req.params.id);
  if (!dest) throw new AppError('Destination not found', 404);
  res.json({ success: true, message: 'Destination removed' });
});

const listCategories = asyncHandler(async (req, res) => {
  const data = await Category.find().sort({ name: 1 });
  res.json({ success: true, data });
});

const adminCategories = asyncHandler(async (req, res) => {
  const cat = await Category.create(req.body);
  res.status(201).json({ success: true, data: cat });
});

const updateCategory = asyncHandler(async (req, res) => {
  const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!cat) throw new AppError('Category not found', 404);
  res.json({ success: true, data: cat });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const cat = await Category.findByIdAndDelete(req.params.id);
  if (!cat) throw new AppError('Category not found', 404);
  res.json({ success: true, message: 'Category removed' });
});

const listBlog = asyncHandler(async (req, res) => {
  const posts = await BlogPost.find().sort({ createdAt: -1 }).select('-content');
  res.json({ success: true, data: posts });
});

const getBlogPost = asyncHandler(async (req, res) => {
  const slug = decodeURIComponent(req.params.slug).toLowerCase();
  const filter = mongoose.isValidObjectId(slug)
    ? { $or: [{ slug }, { _id: slug }] }
    : { slug };
  const post = await BlogPost.findOne(filter);
  if (!post) throw new AppError('Article not found', 404);
  res.json({ success: true, data: post });
});

const latestBlog = asyncHandler(async (req, res) => {
  const posts = await BlogPost.find().sort({ createdAt: -1 }).limit(3).select('-content');
  res.json({ success: true, data: posts });
});

const contactValidators = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
];

const submitContact = asyncHandler(async (req, res) => {
  const message = await ContactMessage.create(req.body);
  res.status(201).json({ success: true, data: message, message: 'Message sent successfully' });
});

const newsletterValidators = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
];

const subscribeNewsletter = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const exists = await NewsletterSubscriber.findOne({ email });
  if (exists) throw new AppError('This email is already subscribed', 400);
  await NewsletterSubscriber.create({ email });
  res.status(201).json({ success: true, message: 'Welcome aboard! Check your inbox for travel inspiration.' });
});

const adminUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    User.find().select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(),
  ]);
  res.json({ success: true, data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  if (user.email === 'admin@wanderly.com') throw new AppError('Cannot change primary admin role', 400);
  if (req.body.role) user.role = req.body.role;
  await user.save();
  res.json({ success: true, data: user });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  if (user.email === 'admin@wanderly.com') throw new AppError('Cannot delete primary admin', 400);
  await user.deleteOne();
  res.json({ success: true, message: 'User deleted' });
});

module.exports = {
  listDestinations,
  adminDestinations,
  updateDestination,
  deleteDestination,
  listCategories,
  adminCategories,
  updateCategory,
  deleteCategory,
  listBlog,
  getBlogPost,
  latestBlog,
  contactValidators,
  submitContact,
  newsletterValidators,
  subscribeNewsletter,
  adminUsers,
  updateUserRole,
  deleteUser,
};
