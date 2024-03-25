import { env } from "$env/dynamic/private";
import { db } from "$lib/server/db";
import { json, redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const PATCH: RequestHandler = async ({ locals, request }) => {
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

    const { email, correctness }: { email: string; correctness: string } = await request.json();
    await db
        .updateTable("Payment")
        .set({ correct: correctness })
        .where("email", "=", email)
        .execute();
    console.log(`Payment correctness for ${email} is set to ${correctness}`);
    return json({ ok: true });
};
