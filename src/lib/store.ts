import { browser } from "$app/environment";
import debug from "debug";
import { writable } from "svelte/store";
import type { Writable } from "svelte/store";

const log = debug("app:store");

const cached = new Map<string, Writable<unknown>>();

export function store<T>(key: string, init: T): Writable<T> {
	// if mem cached, return cached
	if (cached.has(key)) {
		return cached.get(key) as Writable<T>;
	}

	if (browser) {
		// if localstorage has, retrieve from localstorage
		const json = localStorage.getItem(`store::${key}`);
		try {
			if (json) {
				const store = writable(JSON.parse(json));
				store.subscribe((value) => {
					log("store::%s: %o", key, value);
					localStorage.setItem(`store::${key}`, JSON.stringify(value));
				});
				cached.set(key, store);
				return store;
			}
		} catch {
			// ignore
		}
	}

	// if not, return a new store
	const store = writable(init);
	store.subscribe((value) => {
		if (browser) {
			log("store::%s: %o", key, value);
			localStorage.setItem(`store::${key}`, JSON.stringify(value));
		}
	});
	cached.set(key, store);
	return store;
}

export function get<T>(key: string): T | undefined {
	const item = localStorage.getItem(`store::${key}`);
	if (item) {
		return JSON.parse(item);
	}

	return undefined;
}
