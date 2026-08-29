import mongoose from "mongoose";

export const connectDatabase = async (mongoUri) => {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10_000 });
  return mongoose.connection;
};

export const disconnectDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

export const isDatabaseReady = () => mongoose.connection.readyState === 1;
