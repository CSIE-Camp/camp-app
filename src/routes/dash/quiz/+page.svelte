<script lang="ts">
	import { goto } from "$app/navigation";
	import { token } from "$lib/auth";
	import type { Field } from "$lib/field";
	import Form from "$lib/form/Form.svelte";

	let questions: Record<string, Field> = {
		q1: {
			display: "營隊舉辦的日期是哪時候呢？（請參閱報名資訊）",
			value: "",
			validate: () => true,
			options: ["7/3 ~ 7/6", "7/3 ~ 7/7", "7/4 ~ 7/7"],
		},
		q2: {
			display: "報名費用為多少新台幣呢？（請參閱報名資訊）",
			value: "",
			validate: () => true,
			options: ["7600", "8700", "9800"],
		},
		q3: {
			display: "下列哪項「不是」你在營隊會學到的東西？（請參閱營隊介紹）",
			value: "",
			validate: () => true,
			options: ["製作網頁", "資訊安全與密碼學", "製作 Discord Bot", "製作虛擬實境遊戲"],
		},
	};

	const ans: Record<string, string> = {
		q1: "7/3 ~ 7/7",
		q2: "8700",
		q3: "製作虛擬實境遊戲",
	};

	async function check() {
		let wrongs = [];

		const qs = Object.entries(questions);
		for (let i = 0; i < qs.length; i++) {
			if (questions[qs[i][0]].value !== ans[qs[i][0]]) {
				wrongs.push(i + 1);
			}
		}

		if (wrongs.length === 0) {
			const res = fetch("/api/task", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${$token}`,
				},
				body: JSON.stringify({ task: "quiz" }),
			});
			alert("恭喜你答對了！");

			if ((await res).ok) {
				await goto("/dash");
			}
		} else {
			alert("第 " + wrongs.join(", ") + " 題答錯了！請再試一次！");
		}
	}
</script>

<svelte:head>
	<title>報名測驗 | 師大資工營</title>
	<meta
		name="description"
		content="快來報名 2023 師大資工營吧！有趣的課程、有趣的人、有趣的營隊！"
	/>
</svelte:head>

<div class="h-full w-full overflow-auto px-4">
	<div class="mx-auto my-8 flex max-w-xl flex-col items-center">
		<div class="mb-8 text-center">
			<h1 class="text-3xl font-bold">報‍名測‍驗</h1>
			<a href="/dash" class="btn-link btn no-underline">返回儀表板</a>
		</div>

		<Form bind:form={questions} />

		<div class="divider" />

		<button class="btn-primary btn" on:click={check}>對答案</button>
	</div>
</div>
