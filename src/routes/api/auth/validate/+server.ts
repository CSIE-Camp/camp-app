import { env } from "$env/dynamic/private";
import { TokenSchema } from "$lib/schema";
import { error, json } from "@sveltejs/kit";
import jwt from "@tsndr/cloudflare-worker-jwt";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
	if (!env.APP_SECRET) {
		throw error(500, "APP_SECRET not set");
	}

	const { token } = await request.json<{ token: string }>();
	console.log(token);

	const ok = await jwt.verify(token, env.APP_SECRET);
	console.log({ ok });
	if (!ok) {
		throw error(401, "Invalid token");
	}

	try {
		const payload = TokenSchema.parse(jwt.decode(token).payload);
		// console.log(payload, agent);
		// if (payload.agent !== agent) {
		// 	throw error(401, "Invalid token");
		// }

		return json({ ok, payload });
	} catch {
		throw error(401, "Invalid token");
	}
};
