<script lang="ts">
	import type { Field } from "$lib/field";

	export let form: Record<string, Field>;

	const id = Math.random().toString(36).substring(2, 10);
</script>

<div class="form-control w-full">
	{#each Object.entries(form) as [key, value] (key)}
		<label class="label" for="{id}-{key}">
			{value.display}
		</label>
		{#if value.type === "textarea"}
			<textarea
				id="{id}-{key}"
				class="textarea-bordered textarea w-full resize-y transition-all"
				class:textarea-error={!value.validate(value.value)}
				bind:value={value.value}
				placeholder={value.placeholder || ""}
			/>
		{:else if value.type}
			<input
				id="{id}-{key}"
				class="input-bordered input w-full transition-all"
				class:input-error={!value.validate(value.value)}
				type={value.type}
				on:input={(evt) => {
					value.value = evt.currentTarget.value;
					form = form;
				}}
				value={value.value}
				placeholder={value.placeholder || ""}
			/>
		{:else if value.options}
			<select
				id="{id}-{key}"
				class="select-bordered select w-full transition-all"
				bind:value={value.value}
			>
				{#each value.options as item}
					<option value={item}>{item}</option>
				{/each}
			</select>
		{:else}
			<input
				id="{id}-{key}"
				class="input-bordered input w-full transition-all"
				class:input-error={!value.validate(value.value)}
				type="text"
				bind:value={value.value}
				placeholder={value.placeholder || ""}
			/>
		{/if}
	{/each}
</div>
