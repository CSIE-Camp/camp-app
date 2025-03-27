import { dev } from "$app/environment";
import { env } from "$env/dynamic/private";
import { TOKEN_EXPIRY } from "$lib/config";
import { AuthRequest, TokenSchema } from "$lib/schema";
import { error, json } from "@sveltejs/kit";
import jwt from "@tsndr/cloudflare-worker-jwt";
import nodemailer from "nodemailer";
import EMAIL from "../../../../static/email-template.html?raw";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ url, request }) => {
	if (!env.APP_SECRET) {
		throw error(500, "APP_SECRET is not set");
	}
	if ((!env.SMTP_USER || !env.SMTP_PASS) && !dev) {
		throw error(500, "SMTP credentials are not set");
	}

	const { email } = AuthRequest.parse(await request.json());
	const agent = request.headers.get("user-agent");
	console.log(email, agent);

	// sign jwt
	const token = await jwt.sign(
		TokenSchema.parse({
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY,
			agent,
			email,
		}),
		env.APP_SECRET,
	);
	console.log(token);

	const origin = request.headers.has("origin")
		? new URL(request.headers.get("origin") || "").origin
		: url.origin;

	if (dev) {
		console.log("Use this URL to login:", `${origin}/auth?token=${encodeURIComponent(token)}`);
	} else {
		// send login email
		const content = EMAIL.replace(
			/{link_url}/g,
			`${origin}/auth?token=${encodeURIComponent(token)}`,
		);
		console.log(content);

		const transporter = nodemailer.createTransport({
			service: "gmail",
			host: "smtp.gmail.com",
			port: 587,
			secure: false,
			auth: {
				user: env.SMTP_USER,
				pass: env.SMTP_PASS,
			},
		});

		try {
			const info = await transporter.sendMail({
				from: env.SMTP_USER,
				to: email,
				subject: "師大資工營報名登入",
				html: content,
			});
			console.log("Email sent:", info);
		} catch (err) {
			throw error(500, "Failed to send login email");
		}
	}

	return json({ email });
};
