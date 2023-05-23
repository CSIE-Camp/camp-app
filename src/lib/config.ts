import { env } from "$env/dynamic/private";

export const TOKEN_EXPIRY = parseInt(env.TOKEN_EXPIRY || "") || 60 * 60 * 12;
export const ALLOWED_ORIGINS = env.ALLOWED_ORIGINS
	? (env.ALLOWED_ORIGINS || "").split(",").map((x) => x.trim())
	: ["https://camp.csie.cool", "https://camp-dev.csie.cool", "http://localhost:3000"];
export const ALLOWED_COUNTRIES = env.ALLOWED_COUNTRIES
	? (env.ALLOWED_COUNTRIES || "").split(",").map((x) => x.trim().toUpperCase())
	: ["TW"];
