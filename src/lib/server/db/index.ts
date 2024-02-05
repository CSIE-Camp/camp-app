import { env } from "$env/dynamic/private";
import { sql } from "kysely";
import { DB } from "sveltekit-db";
import SQL from "../../../../d1/schema.sql?raw";
import type { Database } from "./schema";

export const db = DB<Database>();

if (env.DB_COMPONENT === "sqlite") {
	const tables = await db.introspection.getTables();
	if (!tables.map((t) => t.name).includes("Application")) {
		const stmts = SQL.split(";")
			.map((s) => s.trim())
			.filter((s) => s.length > 0);
		for (const stmt of stmts) {
			console.log(stmt);
			// @ts-expect-error kysely version not matching
			await sql`${sql.raw(stmt)}`.execute(db);
		}

		await db
			.insertInto("UserControl")
			.values({
				email: "fallback",
				can_apply: 1,
				can_give_up: 1,
				can_update_additional_info: 1,
				can_update_profile: 1,
			})
			.execute();
	}
}
