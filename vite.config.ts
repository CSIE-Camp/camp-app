import { defineConfig } from "vitest/config";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { sveltekit } from "@sveltejs/kit/vite";

export default defineConfig({
	plugins: [
		sveltekit(),
		// Put the Sentry vite plugin after all other plugins
		sentryVitePlugin({
			org: "jacoblincool",
			project: "camp-app",

			// Auth tokens can be obtained from https://sentry.io/settings/account/api/auth-tokens/
			// and need `project:releases` and `org:read` scopes
			authToken: process.env.SENTRY_AUTH_TOKEN,

			sourcemaps: {
				// Specify the directory containing build artifacts
				assets: "./.svelte-kit/output/client/**",
			},
		}),
	],
	test: {
		include: ["src/**/*.{test,spec}.{js,ts}"],
	},
	server: {
		fs: {
			allow: ["./locales"],
		},
	},
	build: {
		sourcemap: true,
	},
});
