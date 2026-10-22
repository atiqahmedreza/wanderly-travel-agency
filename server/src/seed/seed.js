require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Destination = require('../models/Destination');
const Package = require('../models/Package');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const BlogPost = require('../models/BlogPost');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const { categories, destinations, packages, blogPosts } = require('./seedData');

const seedDatabase = async ({ closeConnection = false } = {}) => {
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Destination.deleteMany({}),
    Package.deleteMany({}),
    Review.deleteMany({}),
    Booking.deleteMany({}),
    BlogPost.deleteMany({}),
    NewsletterSubscriber.deleteMany({}),
  ]);

  const admin = await User.create({
    name: 'Wanderly Admin',
    email: 'admin@wanderly.com',
    password: 'Admin@123',
    role: 'admin',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
  });

  const travelers = await User.create([
    {
      name: 'Maya Rahman',
      email: 'maya.rahman@email.com',
      password: 'Travel@123',
      role: 'user',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
    },
    {
      name: 'Rafi Islam',
      email: 'rafi.islam@email.com',
      password: 'Travel@123',
      role: 'user',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200',
    },
    {
      name: 'Priya Das',
      email: 'priya.das@email.com',
      password: 'Travel@123',
      role: 'user',
    },
  ]);

  const cats = await Category.insertMany(categories);
  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c._id]));

  const destDocs = await Destination.insertMany(destinations);
  const destMap = Object.fromEntries(destDocs.map((d) => [d.slug, d._id]));

  const pkgDocs = [];
  for (const p of packages) {
    const { destSlug, catSlug, ...rest } = p;
    const doc = await Package.create({
      ...rest,
      destination: destMap[destSlug],
      category: catMap[catSlug],
    });
    pkgDocs.push(doc);
  }

  for (const dest of destDocs) {
    const count = pkgDocs.filter((p) => p.destination.toString() === dest._id.toString()).length;
    dest.packageCount = count;
    await dest.save();
  }

  await BlogPost.insertMany(blogPosts);

  const maya = travelers[0];
  maya.wishlist = [pkgDocs[0]._id, pkgDocs[4]._id, pkgDocs[6]._id];
  await maya.save();

  const completedBooking = await Booking.create({
    user: maya._id,
    package: pkgDocs[0]._id,
    travelDate: new Date('2025-11-12'),
    travelers: 2,
    contactName: maya.name,
    contactEmail: maya.email,
    contactPhone: '+8801711000001',
    totalAmount: pkgDocs[0].price * 2,
    status: 'completed',
    paidAt: new Date('2025-08-01'),
    stripeSessionId: 'seed_session_1',
  });

  await Review.create({
    user: maya._id,
    package: pkgDocs[0]._id,
    booking: completedBooking._id,
    rating: 5,
    comment:
      "Sunrise on the beach was unforgettable. Our guide knew every fisherman by name and the seafood dinner was the best meal of our year.",
  });

  await Review.create({
    user: travelers[1]._id,
    package: pkgDocs[4]._id,
    booking: (
      await Booking.create({
        user: travelers[1]._id,
        package: pkgDocs[4]._id,
        travelDate: new Date('2025-09-20'),
        travelers: 2,
        contactName: travelers[1].name,
        contactEmail: travelers[1].email,
        totalAmount: pkgDocs[4].price * 2,
        status: 'completed',
        paidAt: new Date('2025-07-15'),
      })
    )._id,
    rating: 5,
    comment: 'Kuakata sunsets were magical — our guide knew every fishing family along the shore.',
  });

  await Review.create({
    user: travelers[2]._id,
    package: pkgDocs[7]._id,
    booking: (
      await Booking.create({
        user: travelers[2]._id,
        package: pkgDocs[7]._id,
        travelDate: new Date('2025-10-05'),
        travelers: 1,
        contactName: travelers[2].name,
        contactEmail: travelers[2].email,
        totalAmount: pkgDocs[7].price,
        status: 'completed',
        paidAt: new Date('2025-06-20'),
      })
    )._id,
    rating: 4,
    comment: 'Jaflong and the tea hills were stunning. Would have loved one more free afternoon in Sylhet.',
  });

  await Booking.create([
    {
      user: maya._id,
      package: pkgDocs[2]._id,
      travelDate: new Date('2026-01-18'),
      travelers: 3,
      contactName: maya.name,
      contactEmail: maya.email,
      totalAmount: pkgDocs[2].price * 3,
      status: 'confirmed',
      paidAt: new Date(),
    },
    {
      user: travelers[1]._id,
      package: pkgDocs[6]._id,
      travelDate: new Date('2026-02-10'),
      travelers: 2,
      contactName: travelers[1].name,
      contactEmail: travelers[1].email,
      totalAmount: pkgDocs[6].price * 2,
      status: 'confirmed',
      paidAt: new Date(),
    },
  ]);

  for (const pkg of pkgDocs) {
    const stats = await Review.aggregate([
      { $match: { package: pkg._id } },
      { $group: { _id: '$package', averageRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
    ]);
    if (stats[0]) {
      pkg.averageRating = Math.round(stats[0].averageRating * 10) / 10;
      pkg.reviewCount = stats[0].reviewCount;
      await pkg.save();
    }
  }

  await NewsletterSubscriber.create({ email: 'newsletter@wanderly.com' });

  console.log('Seed complete.');
  console.log(`Admin: admin@wanderly.com / Admin@123`);
  console.log(`Demo user: maya.rahman@email.com / Travel@123`);
  console.log(`Packages: ${pkgDocs.length}`);
  if (closeConnection) await mongoose.connection.close();
  return pkgDocs.length;
};

/** Insert blog posts when the DB has tours but no articles (common after partial seeds). */
const ensureBlogPosts = async () => {
  const count = await BlogPost.countDocuments();
  if (count > 0) return count;
  await BlogPost.insertMany(blogPosts);
  console.log(`Seeded ${blogPosts.length} blog posts`);
  return blogPosts.length;
};

module.exports = { seedDatabase, ensureBlogPosts };

if (require.main === module) {
  connectDB()
    .then(() => seedDatabase({ closeConnection: true }))
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
