import { dev } from "$app/environment";
import { env } from "$env/dynamic/private";
import { TOKEN_EXPIRY } from "$lib/config";
import { AuthRequest, TokenSchema } from "$lib/schema";
import { error, json } from "@sveltejs/kit";
import jwt from "@tsndr/cloudflare-worker-jwt";
import { create } from "hermes-mail";
import EMAIL from "../../../../static/email-template.html?raw";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ url, request }) => {
	if (!env.APP_SECRET || (!env.HERMES_TOKEN && !dev)) {
		throw error(500, "APP_SECRET or HERMES_TOKEN not set");
	}

	const { email } = AuthRequest.parse(await request.json());
	const agent = request.headers.get("user-agent");
	console.log(email, agent);

	// sign jwt
	const token = await jwt.sign(
		TokenSchema.parse({
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY,
			agent,
			email,
		}),
		env.APP_SECRET,
	);
	console.log(token);

	const origin = request.headers.has("origin")
		? new URL(request.headers.get("origin") || "").origin
		: url.origin;

	if (dev) {
		console.log("Use this URL to login:", `${origin}/auth?token=${encodeURIComponent(token)}`);
	} else {
		// send login email
		const client = create({ baseUrl: "https://hermes.csie.cool" });
		const content = EMAIL.replace(
			/{link_url}/g,
			`${origin}/auth?token=${encodeURIComponent(token)}`,
		);
		const { response } = await client.POST("/api/send", {
			headers: {
				Authorization: `Bearer ${env.HERMES_TOKEN}`,
			},
			body: {
				from: {
					email: "camp@csie.cool",
					name: "師大資工營",
				},
				subject: "師大資工營報名登入",
				content: [
					{
						type: "text/html",
						value: content,
					},
				],
				personalizations: [
					{
						to: [
							{
								email,
							},
						],
					},
				],
			},
		});

		if (!response.ok) {
			throw error(500, "Failed to send login email");
		}
	}

	return json({ email });
};
