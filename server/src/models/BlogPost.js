const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    excerpt: { type: String, required: true, maxlength: 300 },
    content: { type: String, required: true },
    coverImage: { type: String, required: true },
    author: { type: String, required: true },
    readMinutes: { type: Number, default: 5 },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('BlogPost', blogPostSchema);
