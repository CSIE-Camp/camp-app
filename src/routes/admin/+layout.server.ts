import { env } from "$env/dynamic/private";
import { db } from "$lib/server/db";
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, platform }) => {
	if (!locals.token) {
		console.log("Someone is trying to access admin page without token");
		throw redirect(302, "/login");
	}

	if (!env.ADMIN_EMAIL_REGEX) {
		console.error("ADMIN_EMAIL_REGEX is not set");
		throw new Error("ADMIN_EMAIL_REGEX is not set");
	}

	const email_regex = new RegExp(env.ADMIN_EMAIL_REGEX);
	if (!email_regex.test(locals.token.email)) {
		console.log(
			`${locals.token.email} is trying to access admin page which does not match ${env.ADMIN_EMAIL_REGEX}`,
		);
		throw redirect(302, "/login");
	}

	const applications = await db
		.selectFrom("Application")
		.innerJoin("Profile", "Application.email", "Profile.email")
		.leftJoin(
			db
				.selectFrom("Voting")
				.where("email", "=", locals.token.email)
				.select(["Voting.target", "Voting.vote"])
				.as("V"),
			"Application.email",
			"V.target",
		)
		.orderBy("Application.created", "desc")
		.selectAll()
		.execute();

	return { applications };
};
