const mongoose = require('mongoose');

const itineraryDaySchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false }
);

const packageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    shortDescription: { type: String, required: true, maxlength: 220 },
    description: { type: String, required: true },
    images: [{ type: String, required: true }],
    price: { type: Number, required: true, min: 0 },
    durationDays: { type: Number, required: true, min: 1 },
    location: { type: String, required: true },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    groupSize: { type: String, default: '2–12 travelers' },
    difficulty: { type: String, enum: ['Easy', 'Moderate', 'Challenging'], default: 'Easy' },
    departureCity: { type: String, default: 'Dhaka' },
    languages: [{ type: String }],
    inclusions: [{ type: String }],
    exclusions: [{ type: String }],
    itinerary: [itineraryDaySchema],
    mapEmbedUrl: { type: String, default: '' },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

packageSchema.index({ title: 'text', location: 'text', shortDescription: 'text' });

module.exports = mongoose.model('Package', packageSchema);
