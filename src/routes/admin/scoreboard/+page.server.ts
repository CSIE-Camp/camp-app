import { env } from "$env/dynamic/private";
import { db } from "$lib/server/db";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, platform }) => {
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

	const q1 = db
		.selectFrom("Voting")
		.innerJoin("Profile", "Profile.email", "Voting.target")
		.leftJoin("Application", "Profile.email", "Application.email")
		.leftJoin("Payment", "Profile.email", "Payment.email")
		.leftJoin("Attachment", "Profile.email", "Attachment.email")
		.groupBy(["Voting.target"])
		.select([
			"Profile.name",
			"Profile.school",
			"Profile.gender",
			"Profile.email",
			"Profile.facebook",
			"Profile.food_type",
			"Profile.disease",
			"Profile.clothes_size",
			"Profile.motivation",
			"Profile.self_intro",
			"Profile.skill_experienced",
			"Profile.skill_mastered",
			(b) => b.fn.sum("vote").as("score"),
			"Application.status",
			"Application.created",
			"Payment.account",
			"Payment.time as pay_date",
			"Payment.correct",
			"Attachment.file",
		])
		.orderBy("score", "desc");

	const applications = await q1.execute();

	const q2 = db
		.selectFrom("Voting")
		.groupBy("email")
		.select(["email", (b) => b.fn.avg("vote").as("score")])
		.orderBy("score", "desc");

	const admins = await q2.execute();

	return { applications, admins };
};
