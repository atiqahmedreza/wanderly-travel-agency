const mongoose = require('mongoose');
const Package = require('../models/Package');
const Destination = require('../models/Destination');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { uploadToImgBB } = require('../utils/imgbb');

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const buildPackageQuery = (query) => {
  const filter = { isActive: true };
  const { search, destination, category, minPrice, maxPrice, minDuration, maxDuration, minRating, travelDate } =
    query;

  if (search) {
    const pattern = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { title: { $regex: pattern, $options: 'i' } },
      { location: { $regex: pattern, $options: 'i' } },
      { shortDescription: { $regex: pattern, $options: 'i' } },
    ];
  }
  if (destination && mongoose.Types.ObjectId.isValid(destination)) {
    filter.destination = destination;
  }
  if (category && mongoose.Types.ObjectId.isValid(category)) {
    filter.category = category;
  }
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (minDuration || maxDuration) {
    filter.durationDays = {};
    if (minDuration) filter.durationDays.$gte = Number(minDuration);
    if (maxDuration) filter.durationDays.$lte = Number(maxDuration);
  }
  if (minRating) {
    filter.averageRating = { $gte: Number(minRating) };
  }
  if (travelDate) {
    const d = new Date(travelDate);
    if (!Number.isNaN(d.getTime())) {
      filter.createdAt = { $lte: d };
    }
  }

  let sort = { createdAt: -1 };
  switch (query.sort) {
    case 'price_asc':
      sort = { price: 1 };
      break;
    case 'price_desc':
      sort = { price: -1 };
      break;
    case 'rating':
      sort = { averageRating: -1, reviewCount: -1 };
      break;
    default:
      sort = { createdAt: -1 };
  }

  return { filter, sort };
};

const listPackages = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(12, Math.max(8, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  const { filter, sort } = buildPackageQuery(req.query);

  const [items, total] = await Promise.all([
    Package.find(filter)
      .populate('destination', 'name slug country region')
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Package.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
});

const getFeatured = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 8;
  const items = await Package.find({ isActive: true, featured: true })
    .sort({ averageRating: -1, createdAt: -1 })
    .limit(limit)
    .populate('destination', 'name slug')
    .populate('category', 'name slug')
    .lean();

  if (items.length < limit) {
    const extra = await Package.find({ isActive: true, _id: { $nin: items.map((p) => p._id) } })
      .sort({ createdAt: -1 })
      .limit(limit - items.length)
      .populate('destination', 'name slug')
      .populate('category', 'name slug')
      .lean();
    items.push(...extra);
  }

  res.json({ success: true, data: items });
});

const getPackageById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };
  const pkg = await Package.findOne({ ...query, isActive: true })
    .populate('destination')
    .populate('category');
  if (!pkg) throw new AppError('Package not found', 404);
  res.json({ success: true, data: pkg });
});

const getRelated = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  if (!pkg) throw new AppError('Package not found', 404);
  const related = await Package.find({
    _id: { $ne: pkg._id },
    isActive: true,
    $or: [{ destination: pkg.destination }, { category: pkg.category }],
  })
    .limit(4)
    .populate('destination', 'name slug')
    .populate('category', 'name slug');
  res.json({ success: true, data: related });
});

const adminList = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const filter = {};
  if (req.query.search) {
    filter.title = { $regex: req.query.search, $options: 'i' };
  }
  const [data, total] = await Promise.all([
    Package.find(filter).populate('destination category').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Package.countDocuments(filter),
  ]);
  res.json({ success: true, data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

const uploadImages = async (imagesBase64 = []) => {
  const urls = [];
  for (const img of imagesBase64) {
    urls.push(await uploadToImgBB(img));
  }
  return urls;
};

const createPackage = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  body.slug = slugify(body.title);
  if (body.imagesBase64?.length) {
    body.images = await uploadImages(body.imagesBase64);
    delete body.imagesBase64;
  }
  if (!body.images?.length) throw new AppError('At least one package image is required', 400);

  const pkg = await Package.create(body);
  await Destination.findByIdAndUpdate(pkg.destination, { $inc: { packageCount: 1 } });
  res.status(201).json({ success: true, data: pkg });
});

const updatePackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  if (!pkg) throw new AppError('Package not found', 404);

  const body = { ...req.body };
  if (body.title) body.slug = slugify(body.title);
  if (body.imagesBase64?.length) {
    const uploaded = await uploadImages(body.imagesBase64);
    body.images = [...(body.images || pkg.images), ...uploaded];
    delete body.imagesBase64;
  }

  Object.assign(pkg, body);
  await pkg.save();
  res.json({ success: true, data: pkg });
});

const deletePackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findByIdAndDelete(req.params.id);
  if (!pkg) throw new AppError('Package not found', 404);
  await Destination.findByIdAndUpdate(pkg.destination, { $inc: { packageCount: -1 } });
  res.json({ success: true, message: 'Package deleted' });
});

module.exports = {
  listPackages,
  getFeatured,
  getPackageById,
  getRelated,
  adminList,
  createPackage,
  updatePackage,
  deletePackage,
};
