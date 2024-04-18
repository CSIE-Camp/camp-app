<script lang="ts">
	let email: string;
	let ok: boolean | null = null;
	let running = false;
	let open_month = "3";
	let open_day = "3";
	async function send() {
		if (running) {
			return;
		}
		running = true;

		try {
			ok = null;

			const res = await fetch("/api/auth", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email }),
			});

			ok = res.ok;
		} finally {
			running = false;
		}
	}
	function countDownDate(countDate: string = "2024-07-01T00:00:00") {
		let TargetDate = new Date(countDate).getTime();
		let now = new Date().getTime();
		let distance = TargetDate - now;
		return distance;
	}

	let sign_up_date =
		"2024-" +
		(open_month.length === 1 ? "0" + open_month : open_month) +
		"-" +
		(open_day.length === 1 ? "0" + open_day : open_day) +
		"T00:00:00";
	let time_to_sign_up = countDownDate(sign_up_date);
	let timer =
		Math.floor(time_to_sign_up / (1000 * 60 * 60 * 24)) +
		" 天 " +
		Math.floor((time_to_sign_up % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) +
		" 小時 " +
		Math.floor((time_to_sign_up % (1000 * 60 * 60)) / (1000 * 60)) +
		" 分 " +
		Math.floor((time_to_sign_up % (1000 * 60)) / 1000) +
		" 秒 ";
	setInterval(() => {
		time_to_sign_up = countDownDate(sign_up_date);
		timer =
			Math.floor(time_to_sign_up / (1000 * 60 * 60 * 24)) +
			" 天 " +
			Math.floor((time_to_sign_up % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) +
			" 小時 " +
			Math.floor((time_to_sign_up % (1000 * 60 * 60)) / (1000 * 60)) +
			" 分 " +
			Math.floor((time_to_sign_up % (1000 * 60)) / 1000) +
			" 秒 ";
	}, 1000);
</script>

<svelte:head>
	<title>報名登入 | 師大資工營</title>
	<meta
		name="description"
		content="快來報名 2024 師大資工營吧！有趣的課程、有趣的人、有趣的營隊！"
	/>
</svelte:head>

<div class="flex h-full w-full items-center justify-center">
	<div class="w-full max-w-lg p-4">
		{#if time_to_sign_up > 0}
			<div class="alert alert-warning">
				<div>
					<div class="mb-4">
						<h1 class="text-5xl font-bold">報名倒數計時</h1>
						<div class="text-2xl text-primary">
							2024 年 {open_month} 月 {open_day} 日
						</div>
						<div class="text-3xl">{timer}</div>
					</div>
					<div>報名尚未開放</div>
					<div class="divider divider-horizontal mx-0" />
					<div class="text-sm">
						報名將於 2024 年 {open_month} 月 {open_day} 日開放，請耐心等候。
					</div>
				</div>
			</div>
		{:else if ok}
			<h1 class="mb-2 text-3xl">登入連結已寄送</h1>
			<p>請至你的電子郵件收取登入連結！</p>
			<p class="italic text-primary">{email}</p>
		{:else}
			<h1 class="mb-2 text-3xl">登入資工營報名系統</h1>
			<label class="label" for="">
				<span class="label-text"> 輸入電子郵件，我們將會寄送專屬登入連結給你 </span>
			</label>
			<div class="form-control">
				<div class="join">
					<input
						class="input-bordered input-primary input flex-1 join-item"
						type="email"
						placeholder="電子郵件"
						bind:value={email}
						on:keydown={(e) => {
							if (e.key === "Enter") {
								send();
							}
						}}
						disabled={running}
					/>
					<button class="btn-primary btn join-item" disabled={running} on:click={send}
						>登入</button
					>
				</div>
			</div>
			{#if ok === false}
				<div class="alert alert-error mt-4">
					<div>
						<div>寄送失敗</div>
						<div class="divider divider-horizontal mx-0" />
						<div class="text-sm">
							請確認你的電子郵件是否正確，或稍後再試。
							<br />
							如果你仍然無法登入，請透過
							<a
								href="mailto:camp@csie.cool"
								target="_blank"
								class="link-primary link"
							>
								camp@csie.cool
							</a>
							聯絡我們。
						</div>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>
