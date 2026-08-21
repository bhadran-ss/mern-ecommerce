import { v2 as cloudinary } from "cloudinary";

export const configureCloudinary = ({ cloudName, apiKey, apiSecret }) => {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  return cloudinary;
};

export const getCloudinaryClient = () => cloudinary;
