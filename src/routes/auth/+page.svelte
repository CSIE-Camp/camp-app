<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { token } from "$lib/auth";
	import { onMount } from "svelte";

	onMount(async () => {
		const t = new URLSearchParams($page.url.search).get("token");
		token.set(t);
		await goto("/dash");
	});
</script>

<svelte:head>
	<title>授權進行中 | 師大資工營</title>
	<meta
		name="description"
		content="快來報名 2024 師大資工營吧！有趣的課程、有趣的人、有趣的營隊！"
	/>
</svelte:head>

<div class="hero">
	<div class="hero-content">
		<h1>授權進行中 ...</h1>
	</div>
</div>
