import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

const frontendRoot = fileURLToPath(new URL(".", import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, frontendRoot, "VITE_");
  const stripePublishableKey = env.VITE_STRIPE_PUBLISHABLE_KEY?.trim();
  if (
    stripePublishableKey &&
    !/^pk_test_[A-Za-z0-9_]+$/.test(stripePublishableKey)
  ) {
    throw new Error(
      "VITE_STRIPE_PUBLISHABLE_KEY must be a Stripe test key beginning with pk_test_.",
    );
  }

  const apiUrl = env.VITE_API_URL?.trim();
  if (apiUrl && !apiUrl.startsWith("/")) {
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
      throw new Error(
        "VITE_API_URL must be a valid HTTP(S) URL or a same-origin path.",
      );
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:5000",
        },
      },
    },
  };
});
