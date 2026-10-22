const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    country: { type: String, required: true },
    region: { type: String, enum: ['domestic', 'international'], required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    packageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Destination', destinationSchema);
