<script lang="ts">
	import { goto, invalidateAll } from "$app/navigation";
	import { token, email, task, application } from "$lib/auth";
	import { onMount } from "svelte";
	// @ts-expect-error
	import { Confetti } from "svelte-confetti";
	import { fade } from "svelte/transition";
	import Icon from "@iconify/svelte";
	import type { PageData } from "./$types";

	export let data: PageData;
	const has_payment = !!data.payment.account;

	$: tasks = [
		{
			title: "填‍寫‍個‍人資‍料",
			description:
				"你來自哪裡？為什麼想來師大資工營？最有興趣的課程是什麼？\n填寫個人資料，讓我們更了解你！",
			action: () => goto("/dash/profile"),
			redo: () => goto("/dash/profile"),
			done: !!$task.profile && !!$task.avatar,
		},
		{
			title: "完‍成‍報‍名測‍驗",
			description:
				"透過這個不限嘗試次數的小測驗，你可以更加了解我們的營隊。\n如果你沒有基礎，也不用擔心，我們會提供相關的教學資源。",
			action: () => goto("/dash/quiz"),
			done: !!$task.quiz,
		},
		{
			title: "連結 GitHub 帳號",
			description:
				"我們在營隊期間會透過 GitHub 提供相關的教學資源。\n你也可以藉這個機會稍微認識 GitHub。",
			action: open_github,
			redo: open_github,
			done: !!$task.github,
		},
	];

	onMount(async () => {
		fetch("/api/task").then(async (res) => {
			if (res.ok) {
				const json = await res.json<any>();
				task.set(json.task);
			}

			return res;
		});

		fetch("/api/application").then(async (res) => {
			if (res.ok) {
				const json = await res.json<any>();
				$application = json || { created: null, updated: null, status: null };
			}

			return res;
		});
	});

	async function open_github() {
		const state = crypto.getRandomValues(new Uint32Array(1))[0].toString(16);
		localStorage.setItem("github_state", state);
		const url = new URL("https://github.com/login/oauth/authorize");
		url.searchParams.set("client_id", "95dd30f912dfbdf9c3fa");
		url.searchParams.set("state", state);
		const win = window.open(url.toString(), "_blank");
		if (!win) {
			return;
		}
		console.log("opened GitHub auth");
	}

	async function apply() {
		const res = await fetch("/api/application", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + $token,
			},
		});

		if (res.ok) {
			const json = await res.json<any>();
			$application = json || { created: null, updated: null, status: null };
		}

		return res;
	}

	async function cancel() {
		if (!$application.status?.includes("已受理")) {
			const confirmed = confirm("確定要放棄錄取嗎？這個動作無法復原喔！");
			if (!confirmed) {
				return;
			}
		}
		const res = await fetch("/api/application", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + $token,
			},
		});

		await invalidateAll();

		return res;
	}

	let uploading = false;
	let upload_status = "";
	async function upload(file: File) {
		if (uploading) {
			return;
		}
		uploading = true;
		upload_status = "上傳中";
		try {
			const res = await fetch("/api/object/consent.pdf", {
				method: "PUT",
				body: file,
			});

			if (res.ok) {
				upload_status = "上傳成功";
				await invalidateAll();
			} else {
				upload_status = "上傳失敗";
			}
		} finally {
			uploading = false;
		}
	}

	async function update_payment() {
		if (uploading) {
			return;
		}
		uploading = true;

		try {
			const res = await fetch("/api/payment", {
				method: "PUT",
				body: JSON.stringify({
					account: data.payment.account,
				}),
			});

			if (res.ok) {
				await invalidateAll();
			}
		} finally {
			uploading = false;
		}
	}
</script>

<svelte:head>
	<title>報名儀表板 | 師大資工營</title>
	<meta
		name="description"
		content="快來報名 2023 師大資工營吧！有趣的課程、有趣的人、有趣的營隊！"
	/>
</svelte:head>

{#if $application.status?.includes("錄取")}
	<div class="pointer-events-none fixed -top-12 left-0 z-10 flex h-full w-full justify-center">
		<Confetti
			x={[-5, 5]}
			y={[0, 0.1]}
			delay={[0, 6500]}
			duration="5000"
			amount="800"
			fallDistance="100vh"
		/>
	</div>
{/if}

{#if $email}
	<div class="h-full w-full overflow-auto px-4" in:fade={{ duration: 300 }}>
		<div class="mx-auto my-8 flex max-w-xl flex-col items-center">
			<h1 class="text-xl md:text-3xl">帳號：{$email}</h1>

			{#if $task.profile && $task.avatar && $task.quiz && $task.github}
				<div class="divider" />
				<h2 class="text-lg md:text-xl">報名申請狀態</h2>
				<p class="text-sm opacity-60">報名資格審查進行中</p>

				{#if $application.status}
					<div
						class="text-3xl"
						class:text-info={$application.status?.includes("已受理")}
						class:text-success={$application.status?.includes("錄取")}
						class:text-warning={$application.status?.includes("備取")}
					>
						{$application.status}
					</div>
				{/if}

				{#if $application.status ? data.control.can_give_up : data.control.can_apply}
					<button
						class="btn-outline btn mt-2 w-full"
						class:btn-success={!$application.status}
						class:btn-error={$application.status}
						on:click={!$application.status ? apply : cancel}
					>
						{!$application.status
							? "申請報名"
							: $application.status?.includes("已受理")
							? "取消報名"
							: "放棄錄取"}
					</button>
				{/if}
			{/if}

			{#if data.control.can_update_additional_info}
				<div class="divider" />
				<h2 class="text-lg md:text-xl">繳費資料與家長同意書</h2>
				<p class="text-sm opacity-60">
					請在完成繳費後輸入你的「匯款帳號」與上傳「家長同意書」
				</p>

				<div class="form-control w-full">
					<label class="label" for="">
						<span class="label-text">匯款帳號後五碼</span>
						{#if has_payment}
							<span class="label-text text-success">
								<Icon icon="carbon:checkmark" class="mr-1 inline-block" />
								已填寫
							</span>
						{/if}
					</label>
					<label class="input-group">
						<input
							type="text"
							placeholder="12345"
							class="input-bordered input w-full"
							bind:value={data.payment.account}
						/>
						<button
							class="btn-primary btn"
							on:click={update_payment}
							disabled={uploading || data.payment.account.length !== 5}
						>
							儲存
						</button>
					</label>
				</div>

				<div class="form-control w-full">
					<label class="label" for="">
						<span class="label-text">家長同意書</span>
						{#if data.files.find((f) => f.file === "consent.pdf")}
							<span class="label-text text-success">
								<a
									href="/api/object/consent.pdf?n={Date.now()
										.toString(36)
										.substring(2)}"
									title="下載"
									target="_blank"
								>
									<Icon icon="carbon:download" class="mr-2 inline-block" />
								</a>
								<Icon icon="carbon:checkmark" class="mr-1 inline-block" />
								已上傳
							</span>
						{/if}
					</label>
					<label class="input-group">
						<input
							type="file"
							class="file-input-bordered file-input-primary file-input w-full rounded-l-lg"
							accept="application/pdf"
							on:change={(evt) => {
								// @ts-expect-error svelte missing type
								upload(evt.target.files[0]);
							}}
							disabled={uploading}
						/>
					</label>
					{#if upload_status}
						<label class="label" for="">
							<span class="label-text">{upload_status}</span>
						</label>
					{/if}
				</div>
			{/if}

			<div class="divider" />
			<h2 class="text-lg md:text-xl">你的報名資格</h2>
			<p class="text-sm opacity-60">完成三項小任務即可取得報名資格！</p>
			<div class="mt-4 flex w-full flex-col gap-4">
				{#each tasks as task}
					<div>
						<div class="flex justify-between">
							<h3 class="text-base md:text-lg">{task.title}</h3>
							<p
								class="flex items-center text-sm"
								class:text-warning={!task.done}
								class:text-success={task.done}
							>
								<Icon
									icon={task.done ? "carbon:checkmark" : "carbon:dot-mark"}
									class="mr-1 inline-block"
								/>
								{task.done ? "已完成" : "待完成"}
							</p>
						</div>
						<p class="whitespace-pre-line text-sm opacity-60">{task.description}</p>
						<button
							class="btn-outline btn mt-2 w-full p-2"
							class:hidden={!(task.done ? task.redo : task.action)}
							on:click={task.done ? task.redo : task.action}
							disabled={!data.control?.can_update_profile}
						>
							{task.done ? "編輯" : "立即完成"}
						</button>
					</div>
				{/each}
			</div>

			<div class="divider" />
			<h2 class="mb-2 text-lg md:text-xl">聯絡我們</h2>
			<p class="mb-2 text-sm">
				你可以在
				<a
					href="https://camp.csie.cool"
					class="text-primary hover:underline"
					target="_blank"
					rel="noopener noreferrer"
				>
					師大資工營官方網站
				</a>
				上找到更多營隊資訊！
			</p>
			<p class="text-sm">
				如果你有任何問題，歡迎來信至
				<a
					href="mailto:camp@csie.cool"
					class="text-primary hover:underline"
					target="_blank"
					rel="noopener noreferrer"
				>
					camp@csie.cool
				</a>
				！
			</p>
		</div>
	</div>
{/if}
