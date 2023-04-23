import type { HTMLInputTypeAttribute } from "svelte/elements";

export type Field = {
	display: string;
	value: string;
	validate: (value: string) => boolean;
	options?: string[];
	type?: HTMLInputTypeAttribute | "textarea";
	placeholder?: string;
	image?: string;
};
