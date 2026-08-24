import mongoose from 'mongoose';
import config from '../config/env.js';

const connectDB = () => mongoose.connect(config.MONGO_URI);

export default connectDB;
