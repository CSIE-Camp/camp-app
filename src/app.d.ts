/// <reference types="@cloudflare/workers-types" />
import { TokenSchema } from "$lib/schema";
import type { z } from "zod";

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			token?: z.infer<typeof TokenSchema>;
		}
		// interface PageData {}
		interface Platform {
			env: {
				D1: D1Database;
				R2: R2Bucket;
				APP_SECRET: string;
				HERMES_TOKEN: string;
				GH_CLIENT_ID: string;
				GH_CLIENT_SECRET: string;
			};
		}
	}
}

export {};
