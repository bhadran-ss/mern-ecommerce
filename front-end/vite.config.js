import { defineConfig, loadEnv } from "vite";
import process from "node:process";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { validateStripePublishableKey } from "./stripe-key-validation.js";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	const environment = loadEnv(mode, process.cwd(), "");
	validateStripePublishableKey(environment.VITE_STRIPE_PUBLISHABLE_KEY, {
		allowMissing: true,
	});

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
