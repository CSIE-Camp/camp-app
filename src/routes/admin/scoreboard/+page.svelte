<script lang="ts">
	import { hash } from "$lib/hash";
	import type { PageData } from "./$types";

	export let data: PageData;

	let selected: PageData["applications"][number] | null = null;
</script>

<svelte:head>
	<title>管理中心 | 師大資工營</title>
	<meta name="description" content="師大資工營報名系統管理中心" />
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="flex h-full w-full flex-col items-center overflow-auto p-4">
	<div class="flex min-h-full w-full flex-col items-center">
		<h1 class="mb-2 p-6 text-3xl">排行榜</h1>

		<div class="divider" />

		<h2>學員分數</h2>

		<table class="table-compact table w-full">
			<thead>
				<tr>
					<th>#</th>
					<th>性別</th>
					<th>姓名</th>
					<th>照片</th>
					<th>學校</th>
					<th>食物</th>
					<th>衣服</th>
					<th>分數</th>
					<th>狀態</th>
					<th>繳費</th>
					<th>同意書</th>
				</tr>
			</thead>
			<tbody>
				{#each data.applications as app, i}
					{#await hash(app.email) then bucket}
						<tr
							class="hover cursor-pointer"
							on:click={() => {
								selected = app;
							}}
						>
							<td class="transition-all">{i + 1}</td>
							<td class="transition-all" class:text-primary={app.gender === "女"}>
								{app.gender}
							</td>
							<td class="transition-all">{app.name}</td>
							<td class="transition-all">
								<img
									src="/admin/file/{bucket}/profile.jpg"
									class="max-h-40 max-w-sm rounded-md shadow-xl transition-all hover:max-h-80"
									loading="lazy"
									alt="Profile"
								/>
							</td>
							<td class="transition-all">{app.school}</td>
							<td class="transition-all">{app.food_type}</td>
							<td class="transition-all">{app.clothes_size}</td>
							<td class="transition-all">{app.score}</td>
							<td
								class="transition-all"
								class:text-error={!app.status}
								class:text-success={app.status?.includes("錄取")}
							>
								{app.status || "放棄 QQ"}
							</td>
							<td
								class="transition-all"
								class:text-success={app.account && app.pay_date}
							>
								{#if app.account && app.pay_date}
									{app.account} ({app.pay_date})
								{:else}
									無
								{/if}
							</td>
							<td class="transition-all" class:text-success={app.file}>
								{#if app.file}
									<a href="/admin/file/{bucket}/consent.pdf" target="_blank">
										{app.file}
									</a>
								{:else}
									無
								{/if}
							</td>
						</tr>
					{/await}
				{/each}
			</tbody>
		</table>

		<div class="divider" />

		<h2>管理員平均給分</h2>

		<table class="table-compact table w-full">
			<thead>
				<tr>
					<th>Email</th>
					<th>平均分數</th>
				</tr>
			</thead>
			<tbody>
				{#each data.admins as admin}
					<tr class="hover">
						<td class="transition-all">{admin.email}</td>
						<td class="transition-all">{admin.score}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

{#if selected}
	{#await hash(selected.email) then bucket}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center p-4 backdrop-blur"
			on:click={(evt) => {
				if (evt.target === evt.currentTarget) {
					selected = null;
				}
			}}
		>
			<div class="max-h-full overflow-auto rounded-lg bg-base-300 p-8">
				<div class="flex flex-col items-center">
					<h1 class="text-3xl">{selected.name}</h1>
					<a class="contents" href={selected.facebook} target="_blank">
						<img
							src="/admin/file/{bucket}/profile.jpg"
							class="max-h-48 max-w-sm rounded-md shadow-xl transition-all hover:max-h-96"
							loading="lazy"
							alt="Profile"
						/>
					</a>
				</div>

				<div class="divider" />

				<div class="prose">
					<h2>自我介紹</h2>
					<p>{selected.self_intro}</p>

					<h2>報名動機</h2>
					<p>{selected.motivation}</p>

					<h2>相關經驗</h2>
					<p>{selected.skill_experienced}</p>

					<h2>熟悉的相關技術</h2>
					<p>{selected.skill_mastered}</p>

					<h2>學校</h2>
					<p>{selected.school}</p>

					<h2>食物</h2>
					<p>{selected.food_type}</p>

					<h2>衣服</h2>
					<p>{selected.clothes_size}</p>

					<h2>分數</h2>
					<p>{selected.score}</p>
				</div>
			</div>
		</div>
	{/await}
{/if}
