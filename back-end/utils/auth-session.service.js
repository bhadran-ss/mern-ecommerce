import { createHash } from "node:crypto";

import { getRedisClient } from "../lib/Redis.js";

const sessionKey = (sessionId) => `auth:session:${sessionId}`;
const userSessionsKey = (userId) => `auth:user-sessions:${userId}`;

const CREATE_SESSION_SCRIPT = `
redis.call("HSET", KEYS[1], "userId", ARGV[1], "familyId", ARGV[2], "tokenHash", ARGV[3])
redis.call("EXPIRE", KEYS[1], ARGV[4])
redis.call("SADD", KEYS[2], ARGV[5])
redis.call("EXPIRE", KEYS[2], ARGV[4])
return "created"
`;

const ROTATE_SESSION_SCRIPT = `
if redis.call("EXISTS", KEYS[1]) == 0 then
  return "missing"
end
local userId = redis.call("HGET", KEYS[1], "userId")
local familyId = redis.call("HGET", KEYS[1], "familyId")
local tokenHash = redis.call("HGET", KEYS[1], "tokenHash")
if userId ~= ARGV[1] or familyId ~= ARGV[2] then
  return "invalid"
end
if tokenHash ~= ARGV[3] then
  redis.call("DEL", KEYS[1])
  redis.call("SREM", KEYS[2], ARGV[6])
  return "reused"
end
redis.call("HSET", KEYS[1], "tokenHash", ARGV[4])
redis.call("EXPIRE", KEYS[1], ARGV[5])
redis.call("EXPIRE", KEYS[2], ARGV[5])
return "rotated"
`;

const REVOKE_SESSION_SCRIPT = `
if redis.call("EXISTS", KEYS[1]) == 0 then
  return 0
end
local userId = redis.call("HGET", KEYS[1], "userId")
local familyId = redis.call("HGET", KEYS[1], "familyId")
if userId ~= ARGV[1] or familyId ~= ARGV[2] then
  return 0
end
redis.call("DEL", KEYS[1])
redis.call("SREM", KEYS[2], ARGV[3])
return 1
`;

const REVOKE_ALL_SCRIPT = `
local sessions = redis.call("SMEMBERS", KEYS[1])
for _, sessionId in ipairs(sessions) do
  redis.call("DEL", "auth:session:" .. sessionId)
end
redis.call("DEL", KEYS[1])
return #sessions
`;

export const hashRefreshToken = (refreshToken) =>
  createHash("sha256").update(refreshToken).digest("hex");

export const createAuthSessionStore = ({
  getClient = getRedisClient,
} = {}) => ({
  create: async ({
    userId,
    sessionId,
    familyId,
    refreshToken,
    expiresInSeconds,
  }) =>
    getClient().eval(
      CREATE_SESSION_SCRIPT,
      2,
      sessionKey(sessionId),
      userSessionsKey(userId),
      userId,
      familyId,
      hashRefreshToken(refreshToken),
      expiresInSeconds,
      sessionId,
    ),

  rotate: async ({
    userId,
    sessionId,
    familyId,
    currentRefreshToken,
    nextRefreshToken,
    expiresInSeconds,
  }) =>
    getClient().eval(
      ROTATE_SESSION_SCRIPT,
      2,
      sessionKey(sessionId),
      userSessionsKey(userId),
      userId,
      familyId,
      hashRefreshToken(currentRefreshToken),
      hashRefreshToken(nextRefreshToken),
      expiresInSeconds,
      sessionId,
    ),

  revoke: async ({ userId, sessionId, familyId }) =>
    getClient().eval(
      REVOKE_SESSION_SCRIPT,
      2,
      sessionKey(sessionId),
      userSessionsKey(userId),
      userId,
      familyId,
      sessionId,
    ),

  revokeAll: async (userId) =>
    getClient().eval(REVOKE_ALL_SCRIPT, 1, userSessionsKey(userId)),
});

export const authSessionStore = createAuthSessionStore();
