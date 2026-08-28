export class FrontendConfigurationError extends Error {
  constructor(issues) {
    super(`Invalid frontend environment configuration:\n- ${issues.join("\n- ")}`);
    this.name = "FrontendConfigurationError";
    this.issues = [...issues];
  }
}

export const validateFrontendEnvironment = (environment) => {
  const issues = [];

  const requiredString = (name) => {
    const value = environment[name];
    if (typeof value !== "string" || value.trim() === "") {
      issues.push(`${name} is required`);
      return "";
    }
    return value.trim();
  };

  const apiUrl = requiredString("VITE_API_URL");
  if (apiUrl && !apiUrl.startsWith("/")) {
    try {
      const parsed = new URL(apiUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        issues.push("VITE_API_URL must use HTTP or HTTPS");
      }
    } catch {
      issues.push("VITE_API_URL must be an absolute HTTP(S) URL or a root-relative path");
    }
  }

  const stripePublishableKey = requiredString("VITE_STRIPE_PUBLISHABLE_KEY");
  if (stripePublishableKey.startsWith("pk_live_")) {
    issues.push("VITE_STRIPE_PUBLISHABLE_KEY must not be a live-mode key");
  } else if (
    stripePublishableKey &&
    !/^pk_test_[A-Za-z0-9_]+$/.test(stripePublishableKey)
  ) {
    issues.push("VITE_STRIPE_PUBLISHABLE_KEY must be a Stripe test-mode publishable key");
  }

  if (issues.length > 0) {
    throw new FrontendConfigurationError(issues);
  }

  return Object.freeze({
    apiUrl: apiUrl === "/" ? apiUrl : apiUrl.replace(/\/+$/, ""),
    stripePublishableKey,
  });
};

let cachedConfig;

export const getFrontendConfig = () => {
  cachedConfig ??= validateFrontendEnvironment(import.meta.env ?? {});
  return cachedConfig;
};
