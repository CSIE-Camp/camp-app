<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";

	onMount(() => {
		goto("/login");
	});
</script>

<svelte:head>
	<title>師大資工營報名系統</title>
	<meta
		name="description"
		content="快來報名 2023 師大資工營吧！有趣的課程、有趣的人、有趣的營隊！"
	/>
</svelte:head>
