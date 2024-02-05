import { sentryVitePlugin } from "@sentry/vite-plugin";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";

const plugins = [sveltekit()];

if (process.env.SENTRY_AUTH_TOKEN) {
	plugins.push(
		sentryVitePlugin({
			org: process.env.SENTRY_ORG,
			project: process.env.SENTRY_PROJECT,

			// Auth tokens can be obtained from https://sentry.io/settings/account/api/auth-tokens/
			// and need `project:releases` and `org:read` scopes
			authToken: process.env.SENTRY_AUTH_TOKEN,

			sourcemaps: {
				// Specify the directory containing build artifacts
				assets: "./.svelte-kit/output/client/**",
			},
		}),
	);
}

export default defineConfig({
	plugins,
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
