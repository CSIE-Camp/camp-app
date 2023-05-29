import { D1 } from "$lib/server/db";
import { attachments } from "$lib/server/db/attachment";
import { check_control } from "$lib/server/db/control";
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, platform }) => {
	if (!platform || !locals.token) {
		throw redirect(302, "/login");
	}

	const db = new D1(platform);

	const [control, files, payment] = await Promise.all([
		check_control(platform, locals.token.email),
		attachments(platform, locals.token.email),
		db
			.selectFrom("Payment")
			.where("email", "=", locals.token.email)
			.selectAll()
			.executeTakeFirst(),
	]);

	return {
		control,
		files,
		payment: payment || {
			email: locals.token.email,
			account: "",
			time: "",
			updated: "",
		},
	};
};
