import { D1 } from "$lib/server/db";
import { check_control } from "$lib/server/db/control";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const PUT: RequestHandler = async ({ locals, request, platform }) => {
	if (!locals.token) {
		throw error(401, "Unauthorized");
	}

	if (!platform?.env.D1) {
		throw error(500, "D1 not available");
	}

	const control = await check_control(platform, locals.token.email);
	if (!control.can_update_additional_info) {
		throw error(403, "Forbidden");
	}

	const body = await request.json();
	const { account } = body as { account: string };

	if (typeof account !== "string" || account.length !== 5) {
		throw error(400, "Bad Request");
	}

	const time = new Date().toISOString();

	const db = new D1(platform);

	await db
		.insertInto("Payment")
		.values({
			email: locals.token.email,
			account,
			time,
		})
		.onConflict((oc) => oc.columns(["email"]).doUpdateSet({ account, time }))
		.execute();

	return json({ ok: true });
};
