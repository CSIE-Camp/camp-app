import { db } from "./index";

/**
 * mark the attachment as uploaded
 */
export async function uploaded(email: string, file: string) {
	const time = new Date().toString();

	return await db
		.insertInto("Attachment")
		.values({ email, file, time })
		.onConflict((oc) => oc.columns(["email", "file"]).doUpdateSet({ time }))
		.returningAll()
		.execute();
}

/**
 * mark the attachment as deleted
 */
export async function deleted(email: string, file: string) {
	return await db
		.deleteFrom("Attachment")
		.where("email", "=", email)
		.where("file", "=", file)
		.returningAll()
		.execute();
}

/**
 * get all attachments of the user
 */
export async function attachments(email: string) {
	return await db
		.selectFrom("Attachment")
		.where("email", "=", email)
		.orderBy("time", "desc")
		.select(["file", "time"])
		.execute();
}

/**
 * check if the attachment is uploaded
 */
export async function is_uploaded(email: string, file: string) {
	const result = await db
		.selectFrom("Attachment")
		.where("email", "=", email)
		.where("file", "=", file)
		.select(["file"])
		.execute();

	return result.length > 0;
}
