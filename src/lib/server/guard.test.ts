import { check_access } from "$lib/server/guard";
import { describe, it, expect } from "vitest";

describe("check_access", () => {
	// Tests that access is allowed when event has valid headers.
	it("test_access_allowed_with_valid_headers", () => {
		const event: any = {
			url: { pathname: "/api/test" },
			request: {
				headers: new Headers({
					"user-agent": "test-agent",
					"cf-ipcountry": "TW",
				}),
			},
		};
		expect(() => check_access(event, false)).not.toThrow();
	});

	// Tests that access is blocked when event has invalid country code.
	it("test_access_blocked_invalid_country", () => {
		const event: any = {
			url: { pathname: "/api/test" },
			request: {
				headers: new Headers({
					"user-agent": "test-agent",
					"cf-ipcountry": "XX",
				}),
			},
		};
		expect(() => check_access(event, false)).toThrow();
	});

	// Tests that access is blocked when event is missing user-agent header.
	it("test_access_blocked_missing_user_agent", () => {
		const event: any = {
			url: { pathname: "/api/test" },
			request: {
				headers: new Headers({
					"cf-ipcountry": "TW",
				}),
			},
		};
		expect(() => check_access(event, false)).toThrow();
	});

	// Tests that access is allowed for non-api paths.
	it("test_access_allowed_for_non_api_paths", () => {
		const event: any = {
			url: { pathname: "/test" },
			request: {
				headers: new Headers({
					"user-agent": "test-agent",
					"cf-ipcountry": "TW",
				}),
			},
		};
		expect(() => check_access(event, false)).not.toThrow();
	});
});
