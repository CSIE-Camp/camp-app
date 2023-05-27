import { env } from "$env/dynamic/private";
import { error, redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals, params, platform, url }) => {
	if (!locals.token) {
		console.log("Someone is trying to access admin page without token");
		throw redirect(302, "/login");
	}

	if (!env.ADMIN_EMAIL_REGEX) {
		console.error("ADMIN_EMAIL_REGEX is not set");
		throw new Error("ADMIN_EMAIL_REGEX is not set");
	}

	const email_regex = new RegExp(env.ADMIN_EMAIL_REGEX);
	if (!email_regex.test(locals.token.email)) {
		console.log(
			`${locals.token.email} is trying to access admin page which does not match ${env.ADMIN_EMAIL_REGEX}`,
		);
		throw redirect(302, "/login");
	}

	if (!platform?.env.R2) {
		throw error(500, "R2 not available");
	}

	const bucket = params.hash;
	const file = params.file;

	const cache = await platform.caches.open("r2-cache");
	const cache_key = url.href + "?__cache__";
	console.log("cache key", cache_key);
	const cached = await cache.match(cache_key);
	if (cached) {
		console.log("cache hit", cache_key);
		return cached;
	}

	const object = await platform.env.R2.get(`users/${bucket}/${file}`);
	if (!object) {
		throw error(404, "Not found");
	}

	const headers = new Headers();
	object.writeHttpMetadata(headers);
	headers.set("etag", object.httpEtag);
	headers.set("cache-control", "s-maxage=14400");

	const res = new Response(object.body, { headers });

	platform.context.waitUntil(cache.put(cache_key, res.clone()));

	return res;
};
