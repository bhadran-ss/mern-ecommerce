import { getRedisClient } from "../lib/Redis.js";

const sessionKey = (userId) => `auth:refresh:${userId}`;

export const createAuthSessionStore = ({
  getClient = getRedisClient,
} = {}) => ({
  create: async ({ userId, refreshToken, expiresInSeconds }) => {
    await getClient().set(
      sessionKey(userId),
      refreshToken,
      "EX",
      expiresInSeconds,
    );
  },
  get: async (userId) => getClient().get(sessionKey(userId)),
  remove: async (userId) => getClient().del(sessionKey(userId)),
});

export const authSessionStore = createAuthSessionStore();

