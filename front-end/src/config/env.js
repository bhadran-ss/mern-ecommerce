const viteEnv = import.meta.env;
const configuredApiUrl = viteEnv.VITE_API_URL?.trim();
const apiUrl =
  configuredApiUrl ||
  (viteEnv.MODE === "development" ? "http://localhost:5000/api" : "/api");

if (/^https?:\/\//i.test(apiUrl)) {
  try {
    const parsedApiUrl = new URL(apiUrl);
    if (
      !["http:", "https:"].includes(parsedApiUrl.protocol) ||
      parsedApiUrl.username ||
      parsedApiUrl.password
    ) {
      throw new Error("invalid protocol or credentials");
    }
  } catch {
    throw new Error("VITE_API_URL must be a valid HTTP(S) URL or a same-origin path.");
  }
} else if (!apiUrl.startsWith("/")) {
  throw new Error("VITE_API_URL must be a valid HTTP(S) URL or a same-origin path.");
}

const stripePublishableKey = viteEnv.VITE_STRIPE_PUBLISHABLE_KEY?.trim();
if (
  stripePublishableKey &&
  !/^pk_test_[A-Za-z0-9_]+$/.test(stripePublishableKey)
) {
  throw new Error("VITE_STRIPE_PUBLISHABLE_KEY must be a Stripe test key beginning with pk_test_.");
}

export const appConfig = Object.freeze({
  apiUrl,
  stripePublishableKey,
});
