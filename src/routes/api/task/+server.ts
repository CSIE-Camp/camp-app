import { TaskSchema } from "$lib/schema";
import { complete, status, selfchecks } from "$lib/server/task";
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

	const task = await status(email, platform);

	return json({ task });
};

export const PUT: RequestHandler = async ({ locals, request, platform }) => {
	if (!locals.token) {
		throw error(401, "Unauthorized");
	}

	if (!platform?.env.D1) {
		throw error(500, "D1 not available");
	}

	const body = TaskSchema.parse(await request.json());
	const { task } = body;

	const { email } = locals.token;

	if (!selfchecks.includes(task)) {
		throw error(400, "Invalid task");
	}

	await complete(task, email, platform);
	return json({ ok: true });
};
