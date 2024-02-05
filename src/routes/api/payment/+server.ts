import { db } from "$lib/server/db";
import { check_control } from "$lib/server/db/control";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const PUT: RequestHandler = async ({ locals, request }) => {
	if (!locals.token) {
		throw error(401, "Unauthorized");
	}

	const control = await check_control(locals.token.email);
	if (!control.can_update_additional_info) {
		throw error(403, "Forbidden");
	}

	const body = await request.json();
	const { account, time } = body as { account: string; time: string };

	if (typeof account !== "string" || account.length !== 5) {
		throw error(400, "Bad Request");
	}

	if (typeof time !== "string" || time.length > 100) {
		throw error(400, "Bad Request");
	}

	const updated = new Date().toISOString();

	await db
		.insertInto("Payment")
		.values({
			email: locals.token.email,
			account,
			time,
			updated,
		})
		.onConflict((oc) => oc.columns(["email"]).doUpdateSet({ account, time, updated }))
		.execute();

	return json({ ok: true });
};
