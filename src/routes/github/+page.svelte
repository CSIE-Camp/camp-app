<script lang="ts">
	import { goto } from "$app/navigation";
	import { token } from "$lib/auth";
	import { onMount } from "svelte";

	let error = "";

	onMount(check);

	async function check() {
		const params = new URLSearchParams(window.location.search);
		const code = params.get("code");
		const state = params.get("state");

		if (state !== localStorage.getItem("github_state")) {
			error = "無效的授權，請重試。";
			return;
		}

		const res = await fetch("/api/github", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + $token,
			},
			body: JSON.stringify({ code }),
		});

		if (res.ok) {
			goto("/dash");
		} else {
			error = "無法連接到 GitHub，請稍後再試。";
		}
	}
</script>

<svelte:head>
	<title>連結 GitHub | 師大資工營</title>
</svelte:head>

<div class="flex h-full w-full items-center justify-center">
	<div class="w-full max-w-lg p-2">
		{#if error}
			<div class="alert alert-error mb-4">
				{error}
			</div>
			<a href="/dash" class="btn btn-primary">回到儀表板</a>
		{:else}
			<div class="alert alert-info">正在連接 GitHub 帳號...</div>
		{/if}
	</div>
</div>
