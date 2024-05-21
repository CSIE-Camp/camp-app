<script lang="ts">
	import { hash } from "$lib/hash";
	// import { spacing } from "pangu";
	import pkg from "pangu";
	const spacing = pkg.spacing.bind(pkg);
	import Icon from "@iconify/svelte";
	import type { PageData } from "./$types";

	export let data: PageData;
	$: apps = data.applications;
	$: groups = data.applications.reduce(
		(acc, cur) => {
			if (acc[cur.status]) {
				acc[cur.status].push(cur);
			} else {
				acc[cur.status] = [cur];
			}
			return acc;
		},
		{} as Record<string, typeof apps>,
	);

	$: group = Object.keys(groups || [])[0];

	let voting = false;
	async function vote(target: string, choice: number) {
		if (voting) {
			return;
		}
		voting = true;

		try {
			const res = await fetch("/admin/vote", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ target, choice }),
			});

			if (!res.ok) {
				alert("投票失敗");
				console.error("投票失敗", await res.text());
			}
			console.log("投票成功", target, choice);
			data.applications.map((app) => {
				if (app.email === target) {
					app.vote = choice;
				}
				return app;
			});
		} finally {
			voting = false;
		}
	}
</script>

<svelte:head>
	<title>管理中心 | 師大資工營</title>
	<meta name="description" content="師大資工營報名系統管理中心" />
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="flex h-full w-full flex-col items-center overflow-auto p-4">
	<div class="flex min-h-full w-full flex-col items-center">
		<h1 class="mb-2 p-6 text-3xl">管理中心</h1>

		<div class="stats h-40 shadow">
			<div class="stat place-items-end">
				<div class="stat-title">報名人數</div>
				<div class="stat-value text-primary">{apps.length}</div>
			</div>

			<div class="stat place-items-end">
				<div class="stat-title">男生</div>
				<div class="stat-value">{apps.filter((x) => x.gender === "男").length}</div>
			</div>

			<div class="stat place-items-end">
				<div class="stat-title">女生</div>
				<div class="stat-value">{apps.filter((x) => x.gender === "女").length}</div>
			</div>
		</div>

		<div class="divider" />

		<select class="select select-bordered select-primary mb-4" bind:value={group}>
			{#each Object.keys(groups || []) as status}
				<option value={status}>{status}</option>
			{/each}
		</select>

		{#if groups[group]}
			<div class="carousel w-full p-4">
				{#each groups[group] as app (`${app.email}-${app.vote}`)}
					{#await hash(app.email) then bucket}
						<div class="carousel-item w-full">
							<div class="hero">
								<div class="hero-content flex-col lg:flex-row">
									<img
										src="/admin/file/{bucket}/profile.jpg"
										class="max-w-sm rounded-lg shadow-2xl"
										loading="lazy"
										alt="Profile"
									/>
									<div>
										<h1 class="text-5xl font-bold">
											{app.name}
											<span class="text-base text-secondary">
												{app.gender}生，來自 {app.school}
											</span>
										</h1>
										<p class="py-6">
											自我介紹：
											{spacing(app.self_intro)}
										</p>
										<p class="py-6">
											動機：
											{spacing(app.motivation)}
										</p>
										<p class="py-6">
											報名時間：
											{spacing(app.created).split("T")[0] +
												" " +
												spacing(app.created).split("T")[1].split(".")[0]}
										</p>
										<div class="rounded-lg border border-primary p-4">
											{app.status}
										</div>
										<div class="flex gap-2 p-4">
											<button
												class="btn btn-square"
												class:btn-outline={app.vote !== 1}
												class:btn-primary={app.vote === 1}
												on:click={() => vote(app.email, 1)}
												disabled={voting}
											>
												<Icon icon="mdi:thumb-up" />
											</button>
											<button
												class="btn btn-square btn-outline"
												class:btn-outline={app.vote !== 0}
												class:btn-primary={app.vote === 0}
												on:click={() => vote(app.email, 0)}
												disabled={voting}
											>
												<Icon icon="mdi:circle-outline" />
											</button>
											<button
												class="btn btn-square btn-outline"
												class:btn-outline={app.vote !== -1}
												class:btn-primary={app.vote === -1}
												on:click={() => vote(app.email, -1)}
												disabled={voting}
											>
												<Icon icon="mdi:thumb-down" />
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					{/await}
				{/each}
			</div>
		{/if}
	</div>
</div>
