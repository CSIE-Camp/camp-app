export function verify_pid(id: string): boolean {
	if (!id.match(/^[A-Z][12]\d{8}$/)) {
		return false;
	}

	const weights = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1];
	const nums = String(10 + id.charCodeAt(0) - 65) + id.substring(1);

	let sum = 0;
	for (let i = 0; i < nums.length; i++) {
		sum += parseInt(nums[i]) * weights[i];
	}

	return sum % 10 === 0;
}

export function verify_fb(fb: string): boolean {
	// reference: https://regexr.com/3ehqh
	return (
		fb.match(
			/^(?:https?:\/\/)?(?:www\.)?(mbasic.facebook|m\.facebook|facebook|fb)\.(com|me)\/(?:(?:\w\.)*#!\/)?(?:[\w.-]*\/)*([\w.-]*)/,
		) !== null
	);
}

export function verify_birth(birth: string): boolean {
	const date = new Date(birth);
	if (isNaN(date.getTime())) {
		return false;
	}

	if (date > new Date(Date.now() - 12 * 365 * 24 * 60 * 60 * 1000)) {
		return false;
	}

	if (date < new Date(Date.now() - 22 * 365 * 24 * 60 * 60 * 1000)) {
		return false;
	}

	return true;
}
