<script lang="ts">
	import { goto } from "$app/navigation";
	import { token } from "$lib/auth";
	import type { Field } from "$lib/field";
	import Form from "$lib/form/Form.svelte";

	let questions: Record<string, Field> = {
		q1: {
			display: "營隊舉辦的日期是哪時候呢？",
			markdown: "（請參閱[報名資訊](https://camp.csie.cool/#info)）",
			value: "",
			validate: () => true,
			options: ["7/1 ~ 7/5", "7/3 ~ 7/7", "7/2~ 7/5"],
		},
		q2: {
			display: "報名費用原價為多少新臺幣呢？",
			markdown: "（請參閱[報名資訊](https://camp.csie.cool/#info)）",
			value: "",
			validate: () => true,
			options: ["8600", "9500", "9527", "免費"],
		},
		q3: {
			display: "下列哪項「不是」你在營隊會學到的東西？",
			markdown: "（請參閱[營隊介紹](https://camp.csie.cool/#about)）",
			value: "",
			validate: () => true,
			options: ["Python", "Pygame", "Papaya"],
		},
		// q4: {
		// 	display: "營隊的住宿地點（旅居文旅-台北松山機場館）每房「沒有」什麼設施呢？",
		// 	markdown: "（請參閱[報名資訊](https://camp.csie.cool/#info)）",
		// 	value: "",
		// 	validate: () => true,
		// 	options: [
		// 		"高速網路連線",
		// 		"乾溼分離式衛浴 / 浴缸式衛浴",
		// 		"Panasonic 免治馬桶",
		// 		"快煮壺",
		// 		"吸收式無聲冰箱",
		// 		"電子式保險箱",
		// 		"液晶電視",
		// 		"戶外游泳池",
		// 	],
		// },
		q4: {
			display: "請問以下程式碼中 d 的值為何？",
			markdown:
				"```python= \na = 0 \nb = a + 10 \nc = b + 30 \na = a + 4 \nd = a + b * c \n``` \n \
（參考 [The Python Tutorial](https://docs.python.org/zh-tw/3/tutorial/introduction.html#using-python-as-a-calculator)）",
			value: "",
			validate: () => true,
			options: ["400", "404", "420", "560", "等式不成立"],
		},
	};

	const ans: Record<string, string> = {
		q1: "7/1 ~ 7/5",
		q2: "9500",
		q3: "Papaya",
		// q4: "戶外游泳池",
		q4: "404",
	};

	async function check() {
		const wrongs = [];

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
		content="快來報名 2024 師大資工營吧！有趣的課程、有趣的人、有趣的營隊！"
	/>
</svelte:head>

<div class="h-full w-full overflow-auto px-4">
	<div class="mx-auto my-8 flex max-w-xl flex-col items-center">
		<div class="mb-8 text-center">
			<h1 class="text-3xl font-bold">報‍名測‍驗</h1>
			<a href="/dash" class="btn btn-link no-underline">返回儀表板</a>
		</div>

		<Form bind:form={questions} cache={false} />

		<div class="divider" />

		<button class="btn btn-primary" on:click={check}>對答案</button>
	</div>
</div>
