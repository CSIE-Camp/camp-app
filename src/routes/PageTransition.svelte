<script lang="ts">
	import { afterNavigate, beforeNavigate } from "$app/navigation";
	import { page } from "$app/stores";
	import { fade } from "svelte/transition";
	import { browser } from "$app/environment";

	let show_content = true;
	beforeNavigate(() => (show_content = false));
	afterNavigate(() => (show_content = true));

	let pathname = "";
	if (browser) {
		page.subscribe((value) => {
			pathname = value.url.pathname;
		});
	}
</script>

{#key pathname}
	{#if show_content}
		<div
			class="h-full w-full"
			in:fade={{ duration: 100, delay: 100 }}
			out:fade={{ duration: 100 }}
		>
			<slot />
		</div>
	{/if}
{/key}
