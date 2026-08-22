import mongoose from 'mongoose';

const connectDB = () => mongoose.connect(process.env.MONGO_URI);

export default connectDB;
