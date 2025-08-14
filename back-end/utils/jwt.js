import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import redis from "../lib/Redis.js";

dotenv.config({ quiet: true });

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsecret";
const JWT_ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION || "15m";
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || "7d";

const createAcessToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRATION,
  });
};

const createRefreshToken = (userId) => {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRATION,
  });
};

const SendTokenWithCookie = async (res, user, message) => {
  const accessToken = createAcessToken(user._id);
  const refreshToken = createRefreshToken(user._id);

  await redis.set(`refresh_token:${user._id}`, refreshToken, 'EX', 7 * 24 * 60 * 60); // 7 days

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res
    .status(200)
    .cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 }) // 15 min
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json({
      success: true,
      message,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
};

export { SendTokenWithCookie };
