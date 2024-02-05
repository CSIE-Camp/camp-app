import { ProfileSchema } from "$lib/schema";
import { db } from "$lib/server/db";
import { check_control } from "$lib/server/db/control";
import { complete } from "$lib/server/task";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals, platform }) => {
	if (!locals.token) {
		throw error(401, "Unauthorized");
	}

	const { email } = locals.token;

	const profile = await db
		.selectFrom("Profile")
		.where("email", "=", email)
		.selectAll()
		.executeTakeFirst();

	if (profile === null) {
		throw error(404, "Profile not found");
	}

	return json({ profile });
};

export const PUT: RequestHandler = async ({ locals, request, platform }) => {
	if (!locals.token) {
		throw error(401, "Unauthorized");
	}

	if (!platform) {
		throw error(500, "Platform not available");
	}

	const control = await check_control(locals.token.email);
	if (!control.can_update_profile) {
		throw error(403, "Forbidden");
	}

	const body = await request.json();
	const profile = ProfileSchema.parse(body);

	const { email } = locals.token;

	try {
		await db
			.insertInto("Profile")
			.values({
				email,
				name: profile.name,
				gender: profile.gender,
				school: profile.school,
				birth: profile.birth,
				personal_id: profile.personal_id,
				phone: profile.phone,
				blood_type: profile.blood_type,
				facebook: profile.facebook,
				parent_name: profile.parent_name,
				parent_relation: profile.parent_relation,
				parent_phone: profile.parent_phone,
				food_type: profile.food_type,
				allergy_source: profile.allergy_source,
				disease: profile.disease,
				clothes_size: profile.clothes_size,
				self_intro: profile.self_intro,
				motivation: profile.motivation,
				skill_experienced: profile.skill_experienced,
				skill_mastered: profile.skill_mastered,
			})
			.onConflict((oc) =>
				oc.columns(["email"]).doUpdateSet({
					name: profile.name,
					gender: profile.gender,
					school: profile.school,
					birth: profile.birth,
					personal_id: profile.personal_id,
					phone: profile.phone,
					blood_type: profile.blood_type,
					facebook: profile.facebook,
					parent_name: profile.parent_name,
					parent_relation: profile.parent_relation,
					parent_phone: profile.parent_phone,
					food_type: profile.food_type,
					allergy_source: profile.allergy_source,
					disease: profile.disease,
					clothes_size: profile.clothes_size,
					self_intro: profile.self_intro,
					motivation: profile.motivation,
					skill_experienced: profile.skill_experienced,
					skill_mastered: profile.skill_mastered,
				}),
			)
			.execute();

		await complete("profile", email, platform);
		return json({ ok: true });
	} catch (err) {
		console.error(err, profile, email);
		throw err;
	}
};
