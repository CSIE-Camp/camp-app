import { env } from "$env/dynamic/private";
import { TOKEN_EXPIRY } from "$lib/constants";
import { AuthRequest, TokenSchema } from "$lib/schema";
import { error, json } from "@sveltejs/kit";
import jwt from "@tsndr/cloudflare-worker-jwt";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ url, request }) => {
	if (!env.APP_SECRET || !env.HERMES_TOKEN) {
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

	// send login email
	const res = await fetch("https://hermes.csie.cool/api/send", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${env.HERMES_TOKEN}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			from: {
				email: "camp@csie.cool",
				name: "師大資工營",
			},
			to: [email],
			subject: "師大資工營報名登入",
			content: {
				template: "simple",
				params: {
					icon: "https://camp-storage.csie.cool/camp-icon.jpg",
					greeting: "",
					main: "師大資工營報名登入",
					body: "請使用下方專屬魔法連結登入報名系統（此連結僅授權在相同裝置及瀏覽器上登入）",
					link: `登入,${origin}/auth?token=${encodeURIComponent(token)}`,
					footer: "網站,https://camp.csie.cool;Discord,https://discord.gg/X5afNNcm",
				},
			},
		}),
	});

	if (!res.ok) {
		throw error(500, "Failed to send login email");
	}

	return json({ email });
};
