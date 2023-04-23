import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ request }) => {
	console.log(request.headers);
	const headers = Object.fromEntries(request.headers.entries());
	return json({ headers });
};
