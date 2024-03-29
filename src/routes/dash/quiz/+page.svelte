<script lang="ts">
	import { goto } from "$app/navigation";
	import { token } from "$lib/auth";
	import type { Field } from "$lib/field";
	import Form from "$lib/form/Form.svelte";

	let questions: Record<string, Field> = {
		q1: {
			display: "營隊舉辦的日期是哪時候呢？",
			markdown: "（請參閱[報名資訊](https://camp.csie.cool/info)）",
			value: "",
			validate: () => true,
			options: ["7/3 ~ 7/6", "7/3 ~ 7/7", "7/4 ~ 7/7"],
		},
		q2: {
			display: "報名費用原價為多少新台幣呢？",
			markdown: "（請參閱[報名資訊](https://camp.csie.cool/info)）",
			value: "",
			validate: () => true,
			options: ["7900", "8900", "9900", "18900"],
		},
		q3: {
			display: "下列哪項「不是」你在營隊會學到的東西？",
			markdown: "（請參閱[營隊介紹](https://camp.csie.cool/about)）",
			value: "",
			validate: () => true,
			options: ["製作網頁", "資訊安全與密碼學", "製作 Discord Bot", "製作虛擬實境遊戲"],
		},
		q4: {
			display: "營隊的住宿地點（旅居文旅-台北松山機場館）每房「沒有」什麼設施呢？",
			markdown: "（請參閱[報名資訊](https://camp.csie.cool/info)）",
			value: "",
			validate: () => true,
			options: [
				"高速網路連線",
				"乾溼分離式衛浴 / 浴缸式衛浴",
				"Panasonic 免治馬桶",
				"快煮壺",
				"吸收式無聲冰箱",
				"電子式保險箱",
				"液晶電視",
				"戶外游泳池",
			],
		},
		q5: {
			display: "請問以下程式碼中 d 的值為何？",
			markdown:
				"（參考 [let](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Statements/let)、[jsconsole](https://jsconsole.com/)、[JavaScript 初探](https://developer.mozilla.org/zh-TW/docs/Learn/JavaScript/First_steps)）",
			image: "https://i.imgur.com/TJv69iQ.png",
			value: "",
			validate: () => true,
			options: ["0", "10", "20", "30", "40", "50"],
		},
	};

	const ans: Record<string, string> = {
		q1: "7/3 ~ 7/7",
		q2: "8900",
		q3: "製作虛擬實境遊戲",
		q4: "戶外游泳池",
		q5: "40",
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
			<a href="/dash" class="btn-link btn no-underline">返回儀表板</a>
		</div>

		<Form bind:form={questions} cache={false} />

		<div class="divider" />

		<button class="btn-primary btn" on:click={check}>對答案</button>
	</div>
</div>
