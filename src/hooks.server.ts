import { building, dev } from "$app/environment";
import { TokenSchema } from "$lib/schema";
import { locale, waitLocale } from "svelte-i18n";
import { ZodError } from "zod";
import { error, type Handle } from "@sveltejs/kit";
import jwt from "@tsndr/cloudflare-worker-jwt";

export const handle: Handle = async ({ event, resolve }) => {
	const lang = event.request.headers.get("accept-language")?.split(",")[0] || "zh-TW";
	locale.set(lang);
	await waitLocale();

	if (
		!dev &&
		!building &&
		event.url.pathname.includes("/api") &&
		(!event.request.headers.get("user-agent") ||
			event.request.headers.get("cf-ipcountry") !== "TW")
	) {
		console.log(Object.fromEntries(event.request.headers.entries()));
		throw error(400, "Bad Request");
	}

	if (event.request.method === "OPTIONS") {
		return new Response(null, {
			status: 200,
			headers: {
				"Access-Control-Allow-Origin": event.request.headers.get("origin") || "",
				"Access-Control-Allow-Credentials": "true",
				"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type, Authorization",
			},
		});
	}

	const authorization = event.request.headers.get("authorization");
	if (authorization) {
		const [type, token] = authorization.split(" ");
		if (type === "Bearer") {
			event.locals.token = TokenSchema.parse(jwt.decode(token).payload);
		}
	}

	try {
		const result = await resolve(event);

		const list = new Set([
			"https://camp.csie.cool",
			"https://camp-dev.csie.cool",
			"http://localhost:3000",
		]);

		if (list.has(event.request.headers.get("origin") || "")) {
			result.headers.set(
				"Access-Control-Allow-Origin",
				event.request.headers.get("origin") || "",
			);
			result.headers.set("Access-Control-Allow-Credentials", "true");
			result.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
			result.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
		}

		return result;
	} catch (err) {
		if (err instanceof ZodError) {
			throw error(400, err.message);
		}
		throw err;
	}
};
