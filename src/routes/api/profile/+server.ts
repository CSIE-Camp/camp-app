import { ProfileSchema } from "$lib/schema";
import { complete } from "$lib/server/task";
import { is_allowed_time } from "$lib/time-check";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals, platform }) => {
	if (!locals.token) {
		throw error(401, "Unauthorized");
	}

	if (!platform?.env.D1) {
		throw error(500, "D1 not available");
	}

	const { email } = locals.token;

	const profile = await platform.env.D1.prepare("SELECT * FROM Profile WHERE email = ?")
		.bind(email)
		.first();

	if (profile === null) {
		throw error(404, "Profile not found");
	}

	return json({ profile });
};

export const PUT: RequestHandler = async ({ locals, request, platform }) => {
	if (!locals.token) {
		throw error(401, "Unauthorized");
	}

	if (!platform?.env.D1) {
		throw error(500, "D1 not available");
	}

	if (!is_allowed_time()) {
		throw error(403, "Forbidden");
	}

	const body = await request.json();
	const profile = ProfileSchema.parse(body);

	const { email } = locals.token;

	try {
		await platform.env.D1.prepare(
			"INSERT OR REPLACE INTO Profile VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )",
		)
			.bind(
				email,
				profile.name,
				profile.gender,
				profile.school,
				profile.birth,
				profile.personal_id,
				profile.phone,
				profile.blood_type,
				profile.facebook,
				profile.parent_name,
				profile.parent_relation,
				profile.parent_phone,
				profile.food_type,
				profile.allergy_source,
				profile.disease,
				profile.clothes_size,
				profile.self_intro,
				profile.motivation,
				profile.skill_experienced,
				profile.skill_mastered,
			)
			.run();

		await complete("profile", email, platform);
		return json({ ok: true });
	} catch (err) {
		console.error(err, profile, email);
		throw err;
	}
};
