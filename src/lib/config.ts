import { env } from "$env/dynamic/private";

export const TOKEN_EXPIRY = parseInt(env.TOKEN_EXPIRY || "") || 60 * 60 * 12;
export const ALLOWED_ORIGINS = env.ALLOWED_ORIGINS
	? (env.ALLOWED_ORIGINS || "").split(",").map((x) => x.trim())
	: ["https://camp.csie.cool", "https://camp-dev.csie.cool", "http://localhost:3000"];
export const ALLOWED_COUNTRIES = env.ALLOWED_COUNTRIES
	? (env.ALLOWED_COUNTRIES || "").split(",").map((x) => x.trim().toUpperCase())
	: ["TW"];
export const APPLY_BEFORE = new Date(env.APPLY_BEFORE || "2099-12-31T23:59:59.999Z");
export const APPLY_AFTER = new Date(env.APPLY_AFTER || "1970-01-01T00:00:00.000Z");
