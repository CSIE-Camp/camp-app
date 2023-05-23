import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, cookies }) => {
	const token = url.searchParams.get("token");
	if (token) {
		cookies.set("token", token, {
			path: "/",
			secure: true,
			sameSite: "lax",
			expires: new Date(Date.now() + 1000 * 60 * 60 * 12),
		});
	}
};
