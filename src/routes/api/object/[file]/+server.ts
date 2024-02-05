import { hash } from "$lib/hash";
import { deleted, uploaded } from "$lib/server/db/attachment";
import { check_control } from "$lib/server/db/control";
import { complete } from "$lib/server/task";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

const allowed = new Set(["profile.jpg", "consent.pdf"]);

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
	headers.set("cache-control", "private");

	return new Response(object.body, { headers });
};

export const PUT: RequestHandler = async ({ locals, params, request, platform }) => {
	if (!locals.token) {
		throw error(401, "Unauthorized");
	}

	if (!platform?.env.R2) {
		throw error(500, "R2 not available");
	}

	const control = await check_control(locals.token.email);

	const bucket = await hash(locals.token.email);
	const file = params.file;

	if (!allowed.has(file)) {
		throw error(403, "Forbidden");
	}

	if (file === "profile.jpg" && !control.can_update_profile) {
		throw error(403, "Forbidden");
	}

	if (file === "consent.pdf" && !control.can_update_additional_info) {
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
	} else {
		await uploaded(locals.token.email, file);
	}

	return json({ ok: true });
};

export const DELETE: RequestHandler = async ({ locals, params, platform }) => {
	if (!locals.token) {
		throw error(401, "Unauthorized");
	}

	if (!platform?.env.R2) {
		throw error(500, "R2 not available");
	}

	const control = await check_control(locals.token.email);

	const bucket = await hash(locals.token.email);
	const file = params.file;

	if (!allowed.has(file)) {
		throw error(403, "Forbidden");
	}

	if (file === "profile.jpg" && !control.can_update_profile) {
		throw error(403, "Forbidden");
	}

	if (file === "consent.pdf" && !control.can_update_additional_info) {
		throw error(403, "Forbidden");
	}

	await platform.env.R2.delete(`users/${bucket}/${file}`);

	await deleted(locals.token.email, file);

	return json({ ok: true });
};
