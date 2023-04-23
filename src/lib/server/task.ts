export const tasks = ["profile", "avatar", "quiz", "github"];
export const selfchecks = ["quiz"];

export async function complete(
	task: string,
	email: string,
	platform: Readonly<App.Platform>,
	value?: string,
) {
	try {
		if (!tasks.includes(task)) {
			throw new Error("Invalid task");
		}

		value = value ?? new Date().toJSON();

		await platform.env.D1.prepare(
			`INSERT INTO TaskProgress ( email, ${task} ) VALUES ( ?, ? ) ON CONFLICT (email) DO UPDATE SET ${task} = ?`,
		)
			.bind(email, value, value)
			.run();
	} catch (err) {
		console.error(err, email);
		throw err;
	}
}

export async function status(email: string, platform: Readonly<App.Platform>) {
	const task = await platform.env.D1.prepare("SELECT * FROM TaskProgress WHERE email = ?")
		.bind(email)
		.first();

	if (!task) {
		return {
			email,
			...Object.fromEntries(tasks.map((task) => [task, null])),
		};
	}

	return task;
}
