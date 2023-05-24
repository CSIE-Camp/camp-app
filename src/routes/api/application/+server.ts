import { status } from "$lib/server/task";
import { is_allowed_time } from "$lib/time-check";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals, platform }) => {
	if (!locals.token) {
		throw error(401, "Unauthorized");
	}

	if (!platform?.env.D1) {
		throw error(500, "D1 not available");
	}

	const { email } = locals.token;

	const record: Record<string, string> = await platform.env.D1.prepare(
		"SELECT * FROM Application WHERE email = ?",
	)
		.bind(email)
		.first();

	if (!record) {
		throw error(404, "Not found");
	}

	return json({
		created: record.created,
		updated: record.updated,
		status: record.status,
	});
};

export const POST: RequestHandler = async ({ locals, platform }) => {
	if (!locals.token) {
		throw error(401, "Unauthorized");
	}

	if (!platform?.env.D1) {
		throw error(500, "D1 not available");
	}

	if (!is_allowed_time()) {
		throw error(403, "Forbidden");
	}

	const { email } = locals.token;

	const tasks = await status(email, platform);

	const done = Object.values(tasks).every((task) => task);

	if (!done) {
		throw error(500, "Not all tasks are complete");
	}

	const date = new Date().toISOString();
	await platform.env.D1.prepare(
		"INSERT INTO Application (email, created, updated, status) VALUES (?, ?, ?, ?)",
	)
		.bind(email, date, date, "報名已受理")
		.run();

	return json({
		created: date,
		updated: date,
		status: "報名已受理",
	});
};

export const DELETE: RequestHandler = async ({ locals, platform }) => {
	if (!locals.token) {
		throw error(401, "Unauthorized");
	}

	if (!platform?.env.D1) {
		throw error(500, "D1 not available");
	}

	const { email } = locals.token;

	await platform.env.D1.prepare("DELETE FROM Application WHERE email = ?").bind(email).run();

	return json({ ok: true });
};
