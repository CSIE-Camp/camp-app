import { browser } from "$app/environment";
import "$lib/i18n";
import { locale, waitLocale } from "svelte-i18n";
import * as Sentry from "@sentry/svelte";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ data }) => {
	if (browser) {
		Sentry.init({
			dsn: "https://8f5875b5c82a4dd885e2d93ac6691a43@o923427.ingest.sentry.io/4505063453753344",
			integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
			tracesSampleRate: 1.0,
			replaysSessionSampleRate: 0.5,
			replaysOnErrorSampleRate: 1.0,
		});

		locale.set(window.navigator.language);
	}
	await waitLocale();

	return data;
};
