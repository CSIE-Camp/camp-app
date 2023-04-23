import { hash } from "$lib/hash";
import { complete } from "$lib/server/task";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

const allowed = new Set(["profile.jpg"]);

export const GET: RequestHandler = async ({ locals, params, platform }) => {
	if (!locals.token) {
		throw error(401, "Unauthorized");
	}

	if (!platform?.env.R2) {
		throw error(500, "R2 not available");
	}

	const bucket = await hash(locals.token.email);
	const file = params.file;

	if (!allowed.has(file)) {
		throw error(403, "Forbidden");
	}

	const object = await platform.env.R2.get(`users/${bucket}/${file}`);
	if (!object) {
		throw error(404, "Not found");
	}

	const headers = new Headers();
	object.writeHttpMetadata(headers);
	headers.set("etag", object.httpEtag);

	return new Response(object.body, { headers });
};

export const PUT: RequestHandler = async ({ locals, params, request, platform, fetch }) => {
	if (!locals.token) {
		throw error(401, "Unauthorized");
	}

	if (!platform?.env.R2) {
		throw error(500, "R2 not available");
	}

	const bucket = await hash(locals.token.email);
	const file = params.file;

	if (!allowed.has(file)) {
		throw error(403, "Forbidden");
	}

	if (parseFloat(request.headers.get("content-length") || "1e10") > 10 * 1024 * 1024) {
		throw error(413, "Payload too large");
	}

	const object = await platform.env.R2.put(`users/${bucket}/${file}`, request.body);
	if (!object) {
		throw error(500, "Failed to upload");
	}

	if (file === "profile.jpg") {
		await complete("avatar", locals.token.email, platform);
	}

	return json({ ok: true });
};
