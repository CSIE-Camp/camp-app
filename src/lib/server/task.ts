import { db } from "./db";

// export const tasks = ["profile", "avatar", "quiz", "github"] as const;
export const tasks = ["profile", "avatar", "quiz"] as const;
export const selfchecks = ["quiz"];

export async function complete(
	task: (typeof tasks)[number],
	email: string,
	platform: Readonly<App.Platform>,
	value?: string,
) {
	try {
		if (!tasks.includes(task)) {
			throw new Error("Invalid task");
		}

		value = value ?? new Date().toJSON();

		// @ts-expect-error
		await db
			.insertInto("TaskProgress")
			.values({ email, [task]: value })
			.onConflict((oc) => oc.columns(["email"]).doUpdateSet({ [task]: value }))
			.execute();
	} catch (err) {
		console.error(err, email);
		throw err;
	}
}

export async function status(email: string, platform: Readonly<App.Platform>) {
	const task = await db
		.selectFrom("TaskProgress")
		.selectAll()
		.where("email", "=", email)
		.executeTakeFirst();

	if (!task) {
		return {
			email,
			...Object.fromEntries(tasks.map((task) => [task, null])),
		};
	}

	return task;
}
