const mongoose = require('mongoose');

let memoryServer;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not defined');

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
    return;
  } catch (err) {
    if (process.env.NODE_ENV === 'production') throw err;
    console.warn(`MongoDB at ${uri} unavailable (${err.message}). Using in-memory database.`);
  }

  const { MongoMemoryServer } = require('mongodb-memory-server');
  memoryServer = await MongoMemoryServer.create();
  const memoryUri = memoryServer.getUri('wanderly');
  await mongoose.connect(memoryUri);
  console.log('In-memory MongoDB connected (development)');
};

module.exports = connectDB;
