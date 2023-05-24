import { APPLY_AFTER, APPLY_BEFORE } from "./config";

export function is_allowed_time(): boolean {
	const now = new Date();
	return now >= APPLY_AFTER && now <= APPLY_BEFORE;
}
