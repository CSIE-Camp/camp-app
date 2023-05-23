import { building, dev } from "$app/environment";
import { ALLOWED_COUNTRIES } from "$lib/config";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";

/**
 * Checks if the request should be allowed based on the user-agent and country headers.
 * Throws an error if the request should be blocked.
 */
export function check_access(
	event: RequestEvent<Partial<Record<string, string>>, string | null>,
	bypass = dev || building,
) {
	if (bypass) {
		return;
	}

	if (!event.url.pathname.startsWith("/api")) {
		return;
	}

	const agent = event.request.headers.get("user-agent");
	if (!agent) {
		console.log("Blocked because of no user-agent");
		throw error(400, "Bad Request");
	}

	const country = event.request.headers.get("cf-ipcountry")?.toUpperCase();
	if (!country || !ALLOWED_COUNTRIES.includes(country)) {
		console.log("Blocked because of unexpected country", country);
		throw error(400, "Bad Request");
	}
}
