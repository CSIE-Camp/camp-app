<script lang="ts">
	let email: string;
	let ok: boolean | null = null;

	let running = false;
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
</script>

<svelte:head>
	<title>報名登入 | 師大資工營</title>
	<meta
		name="description"
		content="快來報名 2023 師大資工營吧！有趣的課程、有趣的人、有趣的營隊！"
	/>
</svelte:head>

<div class="flex h-full w-full items-center justify-center">
	<div class="w-full max-w-lg p-2">
		{#if ok}
			<h1 class="mb-2 text-3xl">登入連結已寄送</h1>
			<p>請至你的電子郵件收取登入連結！</p>
			<p class="italic text-primary">{email}</p>
		{:else}
			<h1 class="mb-2 text-3xl">登入資工營報名系統</h1>
			<label class="label" for="">
				<span class="label-text"> 輸入電子郵件，我們將會寄送專屬登入連結給你 </span>
			</label>
			<div class="form-control">
				<div class="input-group">
					<input
						class="input-bordered input-primary input flex-1"
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
					<button class="btn-primary btn" disabled={running} on:click={send}>登入</button>
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
