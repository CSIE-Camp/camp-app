import type { z } from "zod";
import type { TaskSchema } from "./schema";
import { store } from "./store";

export const token = store<string | null>("token", null);
export const email = store<string | null>("email", null);
export const task = store<Record<z.infer<typeof TaskSchema>["task"], string | null>>("task", {
	profile: null,
	avatar: null,
	quiz: null,
	github: null,
});

token.subscribe((jwt) => {
	if (jwt) {
		const payload = JSON.parse(atob(jwt.split(".")[1]));
		email.set(payload.email);
	}
});
