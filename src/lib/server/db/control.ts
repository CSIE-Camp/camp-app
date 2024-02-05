import { db } from "./index";

export async function check_control(email: string) {
	const control = await db
		.selectFrom("UserControl")
		.where(({ or, cmpr }) => or([cmpr("email", "=", email), cmpr("email", "=", "fallback")]))
		.selectAll()
		.execute();

	const fallback_control = control.find((c) => c.email === "fallback");
	const user_control = control.find((c) => c.email === email);

	if (!fallback_control) {
		throw new Error("No fallback control");
	}

	if (user_control) {
		return user_control;
	} else if (fallback_control) {
		return fallback_control;
	} else {
		throw new Error("No control policy");
	}
}
