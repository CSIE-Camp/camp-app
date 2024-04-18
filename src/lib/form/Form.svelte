<script lang="ts">
	import { page } from "$app/stores";
	import type { Field } from "$lib/field";
	import { store, get } from "$lib/store";
	import { onMount } from "svelte";
	import Markdown from "svelte-markdown";
	import Link from "./Link.svelte";

	export let form: Record<string, Field>;
	export let cache: false | "cache-first" | "value-first" = "cache-first";

	const id = Math.random().toString(36).substring(2, 10);

	onMount(() => {
		for (const [key, value] of Object.entries(form)) {
			if (cache === "cache-first") {
				value.value = restore(key) ?? value.value;
			} else if (cache === "value-first") {
				value.value = (value.value ?? restore(key)) || "";
			}
		}
	});

	function save(key: string, val: string): void {
		if (!cache) {
			return;
		}

		const s = store<string>(`${$page.url.pathname}#${key}`, val);
		s.set(val);
	}

	function restore(key: string): string | undefined {
		if (!cache) {
			return "";
		}

		const val = get<string>(`${$page.url.pathname}#${key}`);
		return val;
	}
</script>

<div class="form-control w-full">
	{#each Object.entries(form) as [key, value] (key)}
		<label class="label" for="{id}-{key}" id="label-{value.display}">
			{value.display}
		</label>
		{#if value.markdown}
			<div class="prose mb-2">
				<Markdown source={value.markdown} renderers={{ link: Link }} />
			</div>
		{/if}
		{#if value.image}
			<a class="contents" href={value.image} target="_blank">
				<img class="mb-4 w-full max-w-md rounded-lg" src={value.image} alt={value.image} />
			</a>
		{/if}
		{#if value.type === "textarea"}
			<textarea
				id="{id}-{key}"
				class="textarea textarea-bordered w-full resize-y transition-all"
				class:textarea-error={!value.validate(value.value)}
				bind:value={value.value}
				placeholder={value.placeholder || ""}
				on:input={() => save(key, value.value)}
			/>
		{:else if value.type}
			<input
				id="{id}-{key}"
				class="input input-bordered w-full transition-all"
				class:input-error={!value.validate(value.value)}
				type={value.type}
				on:input={(evt) => {
					value.value = evt.currentTarget.value;
					save(key, value.value);
					form = form;
				}}
				value={value.value}
				placeholder={value.placeholder || ""}
			/>
		{:else if value.options}
			<select
				id="{id}-{key}"
				class="select select-bordered w-full transition-all"
				class:select-error={!value.validate(value.value)}
				bind:value={value.value}
				on:change={() => save(key, value.value)}
			>
				{#each value.options as item}
					<option value={item}>{item}</option>
				{/each}
			</select>
		{:else}
			<input
				id="{id}-{key}"
				class="input input-bordered w-full transition-all"
				class:input-error={!value.validate(value.value)}
				type="text"
				bind:value={value.value}
				placeholder={value.placeholder || ""}
				on:input={() => save(key, value.value)}
			/>
		{/if}
	{/each}
</div>
