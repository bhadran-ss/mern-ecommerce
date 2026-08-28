import { v2 as cloudinary } from "cloudinary";
import { getConfig } from "./env.js";

const config = getConfig().cloudinary;

cloudinary.config({
  cloud_name: config.cloudName,
  api_key: config.apiKey,
  api_secret: config.apiSecret,
});

export default cloudinary;
