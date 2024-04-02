<script lang="ts">
	import { hash } from "$lib/hash";
	import type { PageData } from "./$types";
	let camp_admit_number: number = 80;
	let camp_candidate_number: number = 1000;
	export let data: PageData;
	async function order(tp: string) {
		data.applications.sort((a, b) => {
			if (tp !== "score" && tp !== "status") {
				if (a.status === "錄取" && b.status !== "錄取") return -1;
				else if (a.status !== "錄取" && b.status === "錄取") return 1;
				else if (a.status?.includes("備取") && !b.status?.includes("備取")) return -1;
				else if (!a.status?.includes("備取") && b.status?.includes("備取")) return 1;
				else if (tp === "gender") {
					let A = a.gender;
					let B = b.gender;
					if (A < B) return -1;
					else return 1;
				} else if (tp === "name") {
					let A = a.name;
					let B = b.name;
					if (A < B) return -1;
					else return 1;
				} else if (tp === "school") {
					let A = a.school;
					let B = b.school;
					if (A < B) return -1;
					else return 1;
				} else if (tp === "food") {
					let A = a.food_type;
					let B = b.food_type;
					if (A < B) return -1;
					else return 1;
				} else if (tp === "clothes") {
					let A: number = 0;
					let B: number = 0;
					if (a.clothes_size === "SS") A = 1;
					else if (a.clothes_size === "S") A = 2;
					else if (a.clothes_size === "M") A = 3;
					else if (a.clothes_size === "L") A = 4;
					else if (a.clothes_size === "XL") A = 5;
					else if (a.clothes_size === "2L") A = 6;
					else if (a.clothes_size === "3L") A = 7;
					else if (a.clothes_size === "4L") A = 8;
					else if (a.clothes_size === "5L") A = 9;
					else if (a.clothes_size === "6L") A = 10;
					if (b.clothes_size === "SS") B = 1;
					else if (b.clothes_size === "S") B = 2;
					else if (b.clothes_size === "M") B = 3;
					else if (b.clothes_size === "L") B = 4;
					else if (b.clothes_size === "XL") B = 5;
					else if (b.clothes_size === "2L") B = 6;
					else if (b.clothes_size === "3L") B = 7;
					else if (b.clothes_size === "4L") B = 8;
					else if (b.clothes_size === "5L") B = 9;
					else if (b.clothes_size === "6L") B = 10;
					if (A < B) return -1;
					else return 1;
				} else if (tp === "created") {
					let A = a.created;
					let B = b.created;
					if (A && !B) return -1;
					else if (!A && B) return 1;
					else if (A && B) return A < B ? -1 : 1;
					else return 1;
				} else if (tp === "account") {
					let A = a.pay_date;
					let B = b.pay_date;
					if (A && !B) return -1;
					else if (!A && B) return 1;
					else if (A && B && A !== B) return A < B ? -1 : 1;
					else if (a.account && b.account) return a.account < b.account ? -1 : 1;
					else return 1;
				} else if (tp === "file") {
					let A = a.file;
					let B = b.file;
					if (A && !B) return -1;
					else return 1;
				} else {
					let A = a.score;
					let B = b.score;
					if (A > B) return -1;
					else return 1;
				}
			} else if (tp === "score") {
				let A = a.score;
				let B = b.score;
				if (A > B) return -1;
				else return 1;
			} else if (tp === "status") {
				let A = a.status;
				let B = b.status;
				if (A === "錄取" && B !== "錄取") return -1;
				else if (A !== "錄取" && B === "錄取") return 1;
				else if (A === "錄取" && B === "錄取") return 0;
				else if (A?.includes("備取") && !B?.includes("備取")) return -1;
				else if (!A?.includes("備取") && B?.includes("備取")) return 1;
				else if (
					A?.includes("備取") &&
					B?.includes("備取") &&
					a.status !== null &&
					b.status !== null
				)
					return a.status.split(" #")[1] < b.status.split(" #")[1] ? -1 : 1;
				else if (A === "報名已受理" && B !== "報名已受理") return -1;
				else return 1;
			} else {
				let A = a.score;
				let B = b.score;
				if (A > B) return -1;
				else return 1;
			}
		});
		data.applications = data.applications;
	}
	let selected: PageData["applications"][number] | null = null;

	async function admit(app_email: string) {
		const res = await fetch("/admin/api/admit", {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email: app_email,
				input_status: "錄取",
			}),
		});
		data.applications = data.applications.map((app) => {
			if (app.email === app_email) {
				app.status = "錄取";
			}
			return app;
		});
		return res;
	}

	async function cancelAdmit(app_email: string) {
		const res = await fetch("/admin/api/admit", {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email: app_email,
				input_status: "報名已受理",
			}),
		});
		data.applications = data.applications.map((app) => {
			if (app.email === app_email) {
				app.status = "報名已受理";
			}
			return app;
		});
		return res;
	}
	async function candidate(app_email: string, candidate_number: number, app_gender: string) {
		try {
			const res = await fetch("/admin/api/admit", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: app_email,
					input_status: app_gender + "生備取 #" + candidate_number,
				}),
			});
			data.applications = data.applications.map((app) => {
				if (app.email === app_email) {
					app.status = app_gender + "生備取 #" + candidate_number;
				}
				return app;
			});
			return res;
		} finally {
			return 0;
		}
	}
	async function payment_correct(app_email: string, correctness: string) {
		console.log(correctness);
		const res = await fetch("/admin/api/payment", {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email: app_email,
				correctness: correctness,
			}),
		});

		data.applications = data.applications.map((app) => {
			if (app.email === app_email) {
				app.correct = correctness;
			}
			return app;
		});
		return res;
	}
	function countAdmit(): [number, number, number, number] {
		let admit_number: number = 0;
		let candidate_number: number = 0;
		let M_candidate_number = 0;
		let F_candidate_number = 0;
		for (const app of data.applications) {
			if (app.status?.includes("錄取")) admit_number++;
			if (app.status?.includes("備取")) candidate_number++;
			if (app.status?.includes("男生備取")) M_candidate_number++;
			if (app.status?.includes("女生備取")) F_candidate_number++;
		}

		return [admit_number, candidate_number, M_candidate_number, F_candidate_number];
	}
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
					<th>
						<button
							class="btn btn-sm"
							on:click={() => {
								order("gender");
							}}
						>
							性別
						</button>
					</th>
					<th>
						<button
							class="btn btn-sm"
							on:click={() => {
								order("name");
							}}
						>
							姓名
						</button>
					</th>
					<th>照片</th>
					<th>
						<button
							class="btn btn-sm"
							on:click={() => {
								order("school");
							}}
						>
							學校
						</button>
					</th>
					<th>
						<button
							class="btn btn-sm"
							on:click={() => {
								order("food");
							}}
						>
							食物
						</button>
					</th>
					<th>
						<button
							class="btn btn-sm"
							on:click={() => {
								order("clothes");
							}}
						>
							衣服
						</button>
					</th>
					<th>
						<button
							class="btn btn-sm"
							on:click={() => {
								order("score");
							}}
						>
							分數
						</button>
					</th><th>
						<button
							class="btn btn-sm"
							on:click={() => {
								order("status");
							}}
						>
							狀態
						</button>
					</th><th>
						<button
							class="btn btn-sm"
							on:click={() => {
								order("created");
							}}
						>
							報名
						</button>
					</th><th>
						<button
							class="btn btn-sm"
							on:click={() => {
								order("account");
							}}
						>
							繳費
						</button>
					</th><th>
						<button
							class="btn btn-sm"
							on:click={() => {
								order("file");
							}}
						>
							同意書</button
						></th
					>
					<th>操作</th>
				</tr>
			</thead>
			<tbody>
				{#each data.applications as app, i}
					{#await hash(app.email) then bucket}
						<tr class="hover cursor-pointer">
							<td class="transition-all">{i + 1}</td>
							<td
								class="transition-all"
								class:text-primary={app.gender === "女"}
								on:click={() => {
									selected = app;
								}}
							>
								{app.gender}
							</td>
							<td
								class="transition-all"
								on:click={() => {
									selected = app;
								}}>{app.name}</td
							>
							<td
								class="transition-all"
								on:click={() => {
									selected = app;
								}}
							>
								<img
									src="/admin/file/{bucket}/profile.jpg"
									class="max-h-40 max-w-sm rounded-md shadow-xl transition-all hover:max-h-80"
									loading="lazy"
									alt="Profile"
								/>
							</td>
							<td
								class="transition-all"
								on:click={() => {
									selected = app;
								}}>{app.school}</td
							>
							<td
								class="transition-all"
								on:click={() => {
									selected = app;
								}}>{app.food_type}</td
							>
							<td
								class="transition-all"
								on:click={() => {
									selected = app;
								}}>{app.clothes_size}</td
							>
							<td
								class="transition-all"
								on:click={() => {
									selected = app;
								}}>{app.score}</td
							>
							<td
								class="transition-all"
								class:text-error={!app.status}
								class:text-success={app.status?.includes("錄取")}
								class:text-warning={app.status?.includes("備取")}
								on:click={() => {
									selected = app;
								}}
							>
								{app.status || "放棄 QQ"}
							</td>
							<td
								class="transition-all"
								on:click={() => {
									selected = app;
								}}
							>
								{app.created == undefined
									? "未報名"
									: app.created?.split("T")[0]}</td
							>
							<td
								class="transition-all"
								class:text-success={app.correct === "正確"}
								class:text-warning={app.correct === "待確認" || !app.correct}
								class:text-error={app.correct === "錯誤"}
								on:click={() => {
									if (app.account && app.pay_date) {
										if (!app.correct || app.correct === "待確認") {
											payment_correct(app.email, "正確");
										} else if (app.correct === "正確") {
											payment_correct(app.email, "錯誤");
										} else if (app.correct === "錯誤") {
											payment_correct(app.email, "待確認");
										}
									}
								}}
							>
								{#if app.account && app.pay_date}
									{app.account} ({app.pay_date}) {app.correct}
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
							<td>
								<button
									class="btn btn-sm"
									class:btn-success={app.status?.includes("已受理") &&
										countAdmit()[0] < camp_admit_number}
									class:btn-error={app.status?.includes("錄取") ||
										app.status?.includes("備取")}
									class:btn-warning={app.status?.includes("已受理") &&
										countAdmit()[0] >= camp_admit_number &&
										countAdmit()[1] < camp_candidate_number}
									class:disabled={!app.status ||
										(countAdmit()[0] >= camp_admit_number &&
											countAdmit()[1] >= camp_candidate_number)}
									on:click={() => {
										if (
											app.status?.includes("已受理") &&
											countAdmit()[0] < camp_admit_number
										) {
											admit(app.email);
										} else if (
											app.status?.includes("已受理") &&
											countAdmit()[0] >= camp_admit_number &&
											countAdmit()[1] < camp_candidate_number
										) {
											candidate(
												app.email,
												countAdmit()[app.gender === "男" ? 2 : 3] + 1,
												app.gender,
											);
										} else if (
											app.status?.includes("錄取") ||
											app.status?.includes("備取")
										) {
											cancelAdmit(app.email);
										}
									}}
									>{app.status?.includes("已受理")
										? countAdmit()[0] < camp_admit_number
											? "錄取"
											: "備取"
										: !app.status
											? "未報名"
											: "取消"}
								</button></td
							>
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
