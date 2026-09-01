import mongoose from "mongoose";
import config from "../config/env.js";

export const connectDB = async () => {
  await mongoose.connect(config.MONGO_URI);
  return mongoose.connection;
};

export const disconnectDB = () => mongoose.disconnect();
export const isDatabaseReady = async () => {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    return false;
  }
  try {
    await mongoose.connection.db.admin().ping();
    return true;
  } catch {
    return false;
  }
};
