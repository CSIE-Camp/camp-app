import { db } from "$lib/server/db";
import type { RequestHandler } from "./$types";
import { json, redirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";


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


    // get email and input_status from request body
    const { email, input_status }: { email: string, input_status: string } = await request.json();
    const now = new Date().toISOString();
    await db
        .updateTable("Application")
        .set({ status: input_status, updated: now })
        .where("email", "=", email)
        .execute();

    return json({ ok: true });
}