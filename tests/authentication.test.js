import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";

Object.assign(process.env, {
  NODE_ENV: "test",
  PORT: "5001",
  CLIENT_URL: "http://localhost:5173",
  MONGO_URI: "mongodb://127.0.0.1:27017/mern_ecommerce_test",
  UPSTASH_REDIS_URL: "redis://127.0.0.1:6379",
  JWE_SECRET: "test-access-secret-with-at-least-32-characters",
  JWE_REFRESH_SECRET: "different-test-refresh-secret-with-32-characters",
  JWE_ACCESS_EXPIRATION: "15m",
  JWE_REFRESH_EXPIRATION: "7d",
  CLOUDINARY_CLOUD_NAME: "test-cloud",
  CLOUDINARY_API_KEY: "test-api-key",
  CLOUDINARY_API_SECRET: "test-api-secret",
  STRIPE_SECRET_KEY: "sk_test_safe_fixture_only",
  STRIPE_WEBHOOK_SECRET: "whsec_safe_fixture_only",
});

const [
  { createApp },
  { createAuthController },
  { createAuthRateLimit },
  { createAuthRouter },
  { createLogger },
  { default: User },
  { createAuthSessionStore },
  { createSessionCookieService },
  { hashPassword, PASSWORD_HASH_ROUNDS, verifyPassword },
] = await Promise.all([
  import("../back-end/app.js"),
  import("../back-end/controllers/auth.controller.js"),
  import("../back-end/middleware/auth-rate-limit.js"),
  import("../back-end/route/auth.router.js"),
  import("../back-end/lib/logger.js"),
  import("../back-end/models/user.model.js"),
  import("../back-end/utils/auth-session.service.js"),
  import("../back-end/utils/session.service.js"),
  import("../back-end/utils/password.service.js"),
]);

const strongPassword = "StrongPassword1!";
const refreshExpirationSeconds = 7 * 24 * 60 * 60;

const createResponse = () => ({
  statusCode: 200,
  body: undefined,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

const invoke = async (handler, request) => {
  const response = createResponse();
  let nextError;
  await handler(request, response, (error) => {
    nextError = error;
  });
  return { response, nextError };
};

const createControllerFixture = ({ existingUser = null, verifier = true } = {}) => {
  const calls = {
    createdUser: undefined,
    lookup: [],
    session: undefined,
    cookies: undefined,
    passwordVerification: undefined,
  };
  const users = {
    findByEmail: async (email, options) => {
      calls.lookup.push({ email, options });
      return existingUser;
    },
    create: async (attributes) => {
      calls.createdUser = attributes;
      return {
        _id: "user-123",
        ...attributes,
        password: "stored-password-value",
      };
    },
  };
  const sessions = {
    create: async (session) => {
      calls.session = session;
    },
    get: async () => null,
    remove: async () => {},
  };
  const tokens = {
    createAccessToken: async () => "access-token-fixture",
    createRefreshToken: async () => "refresh-token-fixture",
    decryptRefreshToken: async () => ({}),
  };
  const cookies = {
    setSessionCookies: (_response, accessToken, refreshToken) => {
      calls.cookies = { accessToken, refreshToken };
    },
    setAccessCookie: () => {},
    clearSessionCookies: () => {},
  };
  const passwordVerifier = async (password, hash) => {
    calls.passwordVerification = { password, hash };
    return verifier;
  };

  return {
    calls,
    controller: createAuthController({
      users,
      sessions,
      tokens,
      cookies,
      passwordVerifier,
      refreshExpirationSeconds,
    }),
  };
};

test("registration normalizes input and always creates an active customer", async () => {
  const { controller, calls } = createControllerFixture();
  const { response, nextError } = await invoke(controller.signup, {
    body: {
      name: "  Sample Customer  ",
      email: "  CUSTOMER@Example.COM ",
      password: strongPassword,
    },
  });

  assert.equal(nextError, undefined);
  assert.equal(response.statusCode, 201);
  assert.deepEqual(calls.createdUser, {
    name: "Sample Customer",
    email: "customer@example.com",
    password: strongPassword,
    role: "customer",
    accountStatus: "active",
  });
  assert.deepEqual(calls.session, {
    userId: "user-123",
    refreshToken: "refresh-token-fixture",
    expiresInSeconds: refreshExpirationSeconds,
  });
  assert.deepEqual(calls.cookies, {
    accessToken: "access-token-fixture",
    refreshToken: "refresh-token-fixture",
  });
  assert.equal(response.body.user.email, "customer@example.com");
  assert.equal(response.body.user.role, "customer");
  assert.equal("password" in response.body.user, false);
});

test("public registration rejects administrator and seller roles", async () => {
  for (const role of ["admin", "seller"]) {
    const { controller, calls } = createControllerFixture();
    const { nextError } = await invoke(controller.signup, {
      body: {
        name: "Sample Customer",
        email: "customer@example.com",
        password: strongPassword,
        role,
      },
    });

    assert.equal(nextError.status, 400);
    assert.equal(nextError.code, "VALIDATION_ERROR");
    assert.match(nextError.details.fields.role, /customer accounts only/);
    assert.equal(calls.createdUser, undefined);
  }
});

test("registration rejects weak passwords without echoing submitted values", async () => {
  const weakPassword = "weak-password";
  const { controller } = createControllerFixture();
  const { nextError } = await invoke(controller.signup, {
    body: {
      name: "Sample Customer",
      email: "customer@example.com",
      password: weakPassword,
    },
  });

  assert.equal(nextError.status, 400);
  assert.equal(nextError.code, "VALIDATION_ERROR");
  assert.match(nextError.details.fields.password, /uppercase/);
  assert.doesNotMatch(JSON.stringify(nextError.details), new RegExp(weakPassword));
});

test("duplicate registration returns conflict without creating another user", async () => {
  const { controller, calls } = createControllerFixture({
    existingUser: { _id: "existing-user" },
  });
  const { nextError } = await invoke(controller.signup, {
    body: {
      name: "Sample Customer",
      email: "customer@example.com",
      password: strongPassword,
    },
  });

  assert.equal(nextError.status, 409);
  assert.equal(nextError.code, "EMAIL_UNAVAILABLE");
  assert.equal(calls.createdUser, undefined);
});

test("login validates malformed input before querying user records", async () => {
  const { controller, calls } = createControllerFixture();
  const { nextError } = await invoke(controller.login, {
    body: { email: "not-an-email", password: "" },
  });

  assert.equal(nextError.status, 400);
  assert.equal(nextError.code, "VALIDATION_ERROR");
  assert.deepEqual(Object.keys(nextError.details.fields).sort(), [
    "email",
    "password",
  ]);
  assert.deepEqual(calls.lookup, []);
  assert.equal(calls.passwordVerification, undefined);
});

test("valid login creates a session and returns a password-free user", async () => {
  const storedUser = {
    _id: "user-456",
    name: "Existing Customer",
    email: "customer@example.com",
    password: "stored-password-hash",
    role: "customer",
    accountStatus: "active",
  };
  const { controller, calls } = createControllerFixture({
    existingUser: storedUser,
    verifier: true,
  });
  const { response, nextError } = await invoke(controller.login, {
    body: {
      email: " CUSTOMER@EXAMPLE.COM ",
      password: strongPassword,
    },
  });

  assert.equal(nextError, undefined);
  assert.equal(response.statusCode, 200);
  assert.deepEqual(calls.lookup, [
    {
      email: "customer@example.com",
      options: { includePassword: true },
    },
  ]);
  assert.deepEqual(calls.passwordVerification, {
    password: strongPassword,
    hash: "stored-password-hash",
  });
  assert.equal(calls.session.userId, "user-456");
  assert.equal("password" in response.body.user, false);
});

test("unknown, incorrect, and suspended logins use the same credential error", async () => {
  const scenarios = [
    { existingUser: null, verifier: false },
    {
      existingUser: {
        _id: "user-1",
        password: "stored-password-hash",
        accountStatus: "active",
      },
      verifier: false,
    },
    {
      existingUser: {
        _id: "user-2",
        password: "stored-password-hash",
        accountStatus: "suspended",
      },
      verifier: true,
    },
  ];

  for (const scenario of scenarios) {
    const { controller, calls } = createControllerFixture(scenario);
    const { nextError } = await invoke(controller.login, {
      body: { email: "customer@example.com", password: strongPassword },
    });

    assert.equal(nextError.status, 401);
    assert.equal(nextError.code, "INVALID_CREDENTIALS");
    assert.equal(nextError.message, "Invalid email or password");
    assert.equal(calls.session, undefined);
    assert.ok(calls.passwordVerification);
  }
});

test("password service uses bcrypt with the configured work factor", async () => {
  const hash = await hashPassword(strongPassword);

  assert.notEqual(hash, strongPassword);
  assert.match(hash, new RegExp(`^\\$2[aby]\\$${PASSWORD_HASH_ROUNDS}\\$`));
  assert.equal(await verifyPassword(strongPassword, hash), true);
  assert.equal(await verifyPassword("WrongPassword1!", hash), false);
});

test("user model hides passwords and defines account controls", () => {
  assert.equal(User.schema.path("password").options.select, false);
  assert.deepEqual(User.schema.path("role").options.enum, [
    "customer",
    "seller",
    "admin",
  ]);
  assert.deepEqual(User.schema.path("accountStatus").options.enum, [
    "active",
    "suspended",
    "disabled",
  ]);

  const serialized = new User({
    name: "Sample Customer",
    email: "customer@example.com",
    password: strongPassword,
  }).toJSON();
  assert.equal("password" in serialized, false);
});

test("session cookies are HttpOnly and become Secure in production", () => {
  const createConfig = (nodeEnv) => ({
    nodeEnv,
    jwe: {
      accessExpirationSeconds: 15 * 60,
      refreshExpirationSeconds,
    },
  });
  const cookieCalls = [];
  const response = {
    cookie: (name, value, options) =>
      cookieCalls.push({ operation: "set", name, value, options }),
    clearCookie: (name, options) =>
      cookieCalls.push({ operation: "clear", name, options }),
  };

  const productionCookies = createSessionCookieService(
    createConfig("production"),
  );
  productionCookies.setSessionCookies(
    response,
    "access-token-fixture",
    "refresh-token-fixture",
  );
  productionCookies.clearSessionCookies(response);

  const accessCookie = cookieCalls.find(
    (call) => call.operation === "set" && call.name === "accessToken",
  );
  const refreshCookie = cookieCalls.find(
    (call) => call.operation === "set" && call.name === "refreshToken",
  );
  assert.equal(accessCookie.options.httpOnly, true);
  assert.equal(accessCookie.options.secure, true);
  assert.equal(accessCookie.options.sameSite, "lax");
  assert.equal(accessCookie.options.path, "/");
  assert.equal(refreshCookie.options.httpOnly, true);
  assert.equal(refreshCookie.options.secure, true);
  assert.equal(refreshCookie.options.path, "/api/auth");

  const developmentCalls = [];
  createSessionCookieService(createConfig("development")).setAccessCookie(
    { cookie: (...args) => developmentCalls.push(args) },
    "access-token-fixture",
  );
  assert.equal(developmentCalls[0][2].secure, false);
});

test("refresh-token sessions are stored with a bounded Redis lifetime", async () => {
  const commands = [];
  const store = createAuthSessionStore({
    getClient: () => ({
      set: async (...args) => commands.push(["set", ...args]),
      get: async (...args) => commands.push(["get", ...args]),
      del: async (...args) => commands.push(["del", ...args]),
    }),
  });

  await store.create({
    userId: "user-789",
    refreshToken: "refresh-token-fixture",
    expiresInSeconds: refreshExpirationSeconds,
  });
  await store.get("user-789");
  await store.remove("user-789");

  assert.deepEqual(commands, [
    [
      "set",
      "auth:refresh:user-789",
      "refresh-token-fixture",
      "EX",
      refreshExpirationSeconds,
    ],
    ["get", "auth:refresh:user-789"],
    ["del", "auth:refresh:user-789"],
  ]);
});

const withServer = async (app, run) => {
  const server = createServer(app);
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const { port } = server.address();

  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
};

test("registration and login routes have independent rate limits", async () => {
  const registrationLimiter = createAuthRateLimit({
    windowMs: 60_000,
    limit: 1,
    code: "REGISTRATION_RATE_LIMITED",
    message: "Registration rate limited",
  });
  const loginLimiter = createAuthRateLimit({
    windowMs: 60_000,
    limit: 1,
    code: "LOGIN_RATE_LIMITED",
    message: "Login rate limited",
  });
  const controller = {
    signup: (_req, res) => res.status(400).json({ message: "Rejected" }),
    login: (_req, res) => res.status(401).json({ message: "Rejected" }),
    logout: () => {},
    refreshAccessToken: () => {},
    profile: () => {},
  };
  const router = createAuthRouter({
    controller,
    registrationLimiter,
    loginLimiter,
  });
  const logger = createLogger({ sink: () => {} });
  const app = createApp({
    config: { nodeEnv: "test", clientUrl: "http://localhost:5173" },
    logger,
    getDependencyStatus: () => ({ mongodb: true, redis: true }),
    registerApiRoutes: (application) => {
      application.use("/api/auth", router);
    },
  });

  await withServer(app, async (baseUrl) => {
    const request = (path) =>
      fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });

    assert.equal((await request("/api/auth/signup")).status, 400);
    const blockedRegistration = await request("/api/auth/signup");
    assert.equal(blockedRegistration.status, 429);
    assert.equal(
      (await blockedRegistration.json()).error.code,
      "REGISTRATION_RATE_LIMITED",
    );

    assert.equal((await request("/api/auth/login")).status, 401);
    const blockedLogin = await request("/api/auth/login");
    assert.equal(blockedLogin.status, 429);
    assert.equal(
      (await blockedLogin.json()).error.code,
      "LOGIN_RATE_LIMITED",
    );
  });
});
