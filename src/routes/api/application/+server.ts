import { db } from "$lib/server/db";
import { check_control } from "$lib/server/db/control";
import { status } from "$lib/server/task";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals, platform }) => {
	if (!locals.token) {
		throw error(401, "Unauthorized");
	}

	const { email } = locals.token;

	const record = await db
		.selectFrom("Application")
		.where("email", "=", email)
		.selectAll()
		.executeTakeFirst();

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

	if (!platform) {
		throw error(500, "Platform not available");
	}

	const control = await check_control(locals.token.email);
	if (!control.can_apply) {
		throw error(403, "Forbidden");
	}

	const { email } = locals.token;

	const tasks = await status(email, platform);

	const done = Object.values(tasks).every((task) => task);

	if (!done) {
		throw error(500, "Not all tasks are complete");
	}

	const date = new Date().toISOString();
	await db
		.insertInto("Application")
		.values({
			email,
			created: date,
			updated: date,
			status: "報名已受理",
		})
		.execute();

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

	const control = await check_control(locals.token.email);
	if (!control.can_give_up) {
		throw error(403, "Forbidden");
	}

	const { email } = locals.token;

	await db.deleteFrom("Application").where("email", "=", email).execute();

	return json({ ok: true });
};
