import mongoose from "mongoose";

export const connectToDatabase = async (mongoUri) => {
  await mongoose.connect(mongoUri);
  return mongoose.connection;
};

export const disconnectFromDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

export const getDatabaseReadiness = () => ({
  ready: mongoose.connection.readyState === 1,
  status:
    ["disconnected", "connected", "connecting", "disconnecting"][
      mongoose.connection.readyState
    ] || "unknown",
});
