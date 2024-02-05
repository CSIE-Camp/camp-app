import { env } from "$env/dynamic/private";
import { check_control } from "$lib/server/db/control";
import { complete } from "$lib/server/task";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ locals, platform, request }) => {
	if (!locals.token) {
		throw error(401, "Unauthorized");
	}

	if (!platform) {
		throw error(500, "Platform not available");
	}

	if (!env.GH_CLIENT_ID || !env.GH_CLIENT_SECRET) {
		throw error(500, "GH_CLIENT_ID or GH_CLIENT_SECRET not available");
	}

	const control = await check_control(locals.token.email);
	if (!control.can_update_profile) {
		throw error(403, "Forbidden");
	}

	const { email } = locals.token;

	const { code } = await request.json<Record<string, string>>();

	const auth_res = await fetch("https://github.com/login/oauth/access_token", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify({
			client_id: env.GH_CLIENT_ID,
			client_secret: env.GH_CLIENT_SECRET,
			code,
		}),
	});

	if (!auth_res.ok) {
		throw error(500, "Failed to authenticate with GitHub");
	}

	const { access_token } = JSON.parse(await auth_res.text());

	if (!access_token) {
		throw error(500, "Failed to authenticate with GitHub");
	}

	await complete("github", email, platform, access_token);
	return json({ token: access_token });
};
