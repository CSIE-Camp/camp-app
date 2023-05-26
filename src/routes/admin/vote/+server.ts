import { env } from "$env/dynamic/private";
import { D1 } from "$lib/server/db";
import { json, redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ locals, platform, request }) => {
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

	const { target, choice } = await request.json<{
		target: string;
		choice: number;
	}>();

	const db = new D1(platform);

	await db
		.insertInto("Voting")
		.values({
			email: locals.token.email,
			target,
			vote: choice,
		})
		.onConflict((oc) => oc.columns(["email", "target"]).doUpdateSet({ vote: choice }))
		.execute();

	return json({ status: "ok" });
};
