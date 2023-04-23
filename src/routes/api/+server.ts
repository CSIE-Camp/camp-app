import { env } from "$env/dynamic/private";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
	const keys = Object.keys(env);
	const set = new Set(keys);

	let ok = true;
	for (const key of ["APP_SECRET", "HERMES_TOKEN", "D1", "R2"]) {
		if (!set.has(key)) {
			ok = false;
			break;
		}
	}

	return json({ ok, keys });
};
