import { complete } from "$lib/server/task";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ locals, platform, request }) => {
	if (!locals.token) {
		throw error(401, "Unauthorized");
	}

	if (!platform?.env.D1) {
		throw error(500, "D1 not available");
	}

	if (!platform.env.GH_CLIENT_ID || !platform.env.GH_CLIENT_SECRET) {
		throw error(500, "GH_CLIENT_ID or GH_CLIENT_SECRET not available");
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
			client_id: platform.env.GH_CLIENT_ID,
			client_secret: platform.env.GH_CLIENT_SECRET,
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
