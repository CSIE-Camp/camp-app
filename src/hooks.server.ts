import { dev } from "$app/environment";
import { env } from "$env/dynamic/private";
import { ALLOWED_ORIGINS } from "$lib/config";
import { TokenSchema } from "$lib/schema";
import { check_access } from "$lib/server/guard";
import { error, type Handle, type RequestEvent } from "@sveltejs/kit";
import jwt from "@tsndr/cloudflare-worker-jwt";
import { locale } from "svelte-i18n";
import { ZodError } from "zod";

export const handle: Handle = async ({ event, resolve }) => {
	const lang = event.request.headers.get("accept-language")?.split(",")[0] || "zh-TW";
	await locale.set(lang);

	if (dev) {
		const { R2Bucket } = await import("@miniflare/r2");
		const { Cache } = await import("@miniflare/cache");
		const { FileStorage } = await import("@miniflare/storage-file");
		const cache = new Cache(new FileStorage(".mf/cache"));
		event.platform = {
			env: {
				// @ts-expect-error
				R2: new R2Bucket(new FileStorage(".mf/r2")),
			},
			caches: {
				// @ts-expect-error
				async open() {
					return cache;
				},
			},
		};
	}

	await set_token(event);
	check_access(event);

	if (event.request.method === "OPTIONS") {
		return handle_options(event);
	}

	try {
		const result = await resolve(event);

		add_cors_headers(result, event.request.headers.get("origin") || "*");

		return result;
	} catch (err) {
		if (err instanceof ZodError) {
			throw error(400, err.message);
		}
		throw err;
	}
};

function handle_options(event: RequestEvent) {
	const res = new Response(null);
	add_cors_headers(res, event.request.headers.get("origin") || "*");
	return res;
}

function add_cors_headers(response: Response, origin: string) {
	const list = new Set(ALLOWED_ORIGINS);
	if (list.has(origin)) {
		response.headers.set("Access-Control-Allow-Origin", origin);
		response.headers.set("Access-Control-Allow-Credentials", "true");
		response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
		response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
	}
}

async function set_token(event: RequestEvent) {
	const authorization = event.request.headers.get("authorization");
	const cookie = event.cookies.get("token");

	if (authorization) {
		console.log("Found token in authorization header");
		const [type, token] = authorization.split(" ");
		if (type === "Bearer") {
			const ok = await jwt.verify(token, env.APP_SECRET);
			if (ok) {
				event.locals.token = TokenSchema.parse(jwt.decode(token).payload);
			}
		}
	} else if (cookie) {
		console.log("Found token in cookie");
		const ok = await jwt.verify(cookie, env.APP_SECRET);
		if (ok) {
			event.locals.token = TokenSchema.parse(jwt.decode(cookie).payload);
		}
	} else {
		console.log("No token found");
	}
}
