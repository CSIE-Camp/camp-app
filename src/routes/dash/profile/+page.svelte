<script lang="ts">
	import { goto } from "$app/navigation";
	import { token } from "$lib/auth";
	import type { Field } from "$lib/field";
	import Form from "$lib/form/Form.svelte";
	import { ProfileSchema } from "$lib/schema";
	import { onMount } from "svelte";

	let basics: Record<string, Field> = {
		name: {
			display: "姓名",
			value: "",
			validate: (value) => ProfileSchema.shape.name.safeParse(value).success,
		},
		gender: {
			display: "性別",
			value: "男",
			validate: (value) => ProfileSchema.shape.gender.safeParse(value).success,
			options: ["男", "女"],
		},
		school: {
			display: "學校",
			value: "",
			validate: (value) => ProfileSchema.shape.school.safeParse(value).success,
		},
		birth: {
			display: "出生日期",
			value: "",
			validate: (value) => ProfileSchema.shape.birth.safeParse(value).success,
			type: "date",
		},
		personal_id: {
			display: "身分證字號",
			value: "",
			validate: (value) => ProfileSchema.shape.personal_id.safeParse(value).success,
		},
		phone: {
			display: "手機號碼",
			value: "",
			validate: (value) => ProfileSchema.shape.phone.safeParse(value).success,
			type: "tel",
			placeholder: "09 ...",
		},
		blood_type: {
			display: "血型",
			value: "不確定",
			validate: (value) => ProfileSchema.shape.blood_type.safeParse(value).success,
			options: ["O", "A", "B", "AB", "不確定"],
		},
		facebook: {
			display: "Facebook 連結",
			value: "",
			validate: (value) => ProfileSchema.shape.facebook.safeParse(value).success,
			type: "url",
			placeholder: "https://www.facebook.com/username",
		},
	};

	let emergency: Record<string, Field> = {
		parent_name: {
			display: "緊急連絡人姓名",
			value: "",
			validate: (value) => ProfileSchema.shape.parent_name.safeParse(value).success,
		},
		parent_relation: {
			display: "與緊急連絡人關係",
			value: "",
			validate: (value) => ProfileSchema.shape.parent_relation.safeParse(value).success,
			placeholder: "父親、母親、兄弟、姊妹、...",
		},
		parent_phone: {
			display: "緊急行動人行動電話",
			value: "",
			validate: (value) => ProfileSchema.shape.parent_phone.safeParse(value).success,
			type: "tel",
			placeholder: "09 ...",
		},
	};

	let travel: Record<string, Field> = {
		travel_history: {
			display: "過去 14 天是否曾出國至其他境外地區？",
			value: "否",
			validate: (value) => ProfileSchema.shape.travel_history.safeParse(value).success,
			options: ["否", "是"],
		},
	};

	let others: Record<string, Field> = {
		food_type: {
			display: "飲食習慣",
			value: "葷",
			validate: (value) => ProfileSchema.shape.food_type.safeParse(value).success,
			options: ["葷", "素"],
		},
		allergy_source: {
			display: "過敏源（如果沒有則不用填）",
			value: "",
			validate: (value) => ProfileSchema.shape.allergy_source.safeParse(value).success,
		},
		disease: {
			display: "特殊疾病（如果沒有則不用填）",
			value: "",
			validate: (value) => ProfileSchema.shape.disease.safeParse(value).success,
		},
		clothes_size: {
			display: "衣服尺寸",
			value: "M",
			validate: (value) => ProfileSchema.shape.clothes_size.safeParse(value).success,
			options: ["XS", "S", "M", "L", "XL"],
		},
	};

	let about: Record<string, Field> = {
		self_intro: {
			display: "自我介紹",
			value: "",
			validate: (value) => ProfileSchema.shape.self_intro.safeParse(value).success,
			type: "textarea",
			placeholder:
				"我是一個熱愛學習的人，我喜歡研究如何將新的技術應用在實際的情境中，並且 ...",
		},
		motivation: {
			display: "報名動機、有興趣的課程及期待收穫",
			value: "",
			validate: (value) => ProfileSchema.shape.motivation.safeParse(value).success,
			type: "textarea",
			placeholder:
				"想學習網頁開發來製作個人網站，最有興趣的課程是 AI Discord Bot，因為看起來很酷，而且 ...",
		},
		skill_experienced: {
			display: "接觸過哪些程式語言或相關技能",
			value: "",
			validate: (value) => ProfileSchema.shape.skill_experienced.safeParse(value).success,
			type: "textarea",
			placeholder: "HTML, JavaScript, Python, C++, TypeScript, Rust, Docker, ...",
		},
		skill_mastered: {
			display: "論語法而言，「自認為」學過最「進階」的是？",
			value: "",
			validate: (value) => ProfileSchema.shape.skill_mastered.safeParse(value).success,
			type: "textarea",
			placeholder: "if-else 判斷式, for 迴圈, function 函式, ...",
		},
	};

	let canvas: HTMLCanvasElement;
	let files: FileList;
	let remote_image = false;
	$: upload(files?.[0]);

	async function upload(file?: File) {
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				const img = new Image();
				img.onload = () => {
					canvas.width = img.width;
					canvas.height = img.height;
					const ctx = canvas.getContext("2d");
					ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

					canvas.toBlob(
						(blob) => {
							if (blob) {
								const file = new File([blob], "profile.jpg", {
									type: "image/jpeg",
									lastModified: Date.now(),
								});

								fetch("/api/object/profile.jpg", {
									method: "PUT",
									headers: {
										Authorization: `Bearer ${$token}`,
									},
									body: file,
								}).then((res) => {
									if (res.ok) {
										console.log("success");
									} else {
										console.log("fail");
									}
								});
							}
						},
						"image/jpeg",
						0.9,
					);
				};
				img.src = reader.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	async function save() {
		const data = Object.entries({
			...basics,
			...travel,
			...emergency,
			...others,
			...about,
		}).reduce((acc, [key, value]) => {
			acc[key] = value.value;
			return acc;
		}, {} as Record<string, string>);

		const profile = ProfileSchema.parse(data);

		const res = await fetch("/api/profile", {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${$token}`,
			},
			body: JSON.stringify(profile),
		});

		if (res.ok) {
			alert("儲存成功");
			await goto("/dash");
		} else {
			alert("儲存失敗");
		}
	}

	onMount(async () => {
		try {
			const res = await fetch("/api/profile", {
				headers: {
					Authorization: `Bearer ${$token}`,
				},
			});

			const json = ProfileSchema.parse((await res.json<{ profile: unknown }>())?.profile);

			Object.entries(json).forEach(([key, value]) => {
				if (basics[key]) {
					basics[key].value = value;
				} else if (travel[key]) {
					travel[key].value = value;
				} else if (emergency[key]) {
					emergency[key].value = value;
				} else if (others[key]) {
					others[key].value = value;
				} else if (about[key]) {
					about[key].value = value;
				}
			});
		} catch (err) {
			console.error(err);
		}

		const res = await fetch("/api/object/profile.jpg", {
			headers: {
				Authorization: `Bearer ${$token}`,
			},
		});

		if (res.ok) {
			remote_image = true;
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const img = new Image();
			img.onload = () => {
				canvas.width = img.width;
				canvas.height = img.height;
				const ctx = canvas.getContext("2d");
				ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
			};
			img.src = url;
		}
	});
</script>

<svelte:head>
	<title>填寫個人資料 | 師大資工營</title>
	<meta
		name="description"
		content="快來報名 2023 師大資工營吧！有趣的課程、有趣的人、有趣的營隊！"
	/>
</svelte:head>

<div class="h-full w-full overflow-auto px-4">
	<div class="mx-auto my-8 flex max-w-xl flex-col items-center">
		<div class="mb-8 text-center">
			<h1 class="text-3xl font-bold">填‍寫‍個‍人資‍料</h1>
			<a href="/dash" class="btn-link btn no-underline">返回儀表板</a>
		</div>

		<h2 class="text-2xl font-bold">基本資料</h2>
		<Form bind:form={basics} />
		<div class="divider" />

		<h2 class="text-2xl font-bold">本人照片</h2>
		<p>（正臉清晰可辨的單人生活照）</p>
		<input class="file-input-bordered file-input m-4" type="file" accept="image/*" bind:files />
		{#if files?.[0] || remote_image}
			<canvas bind:this={canvas} class="m-4 h-40" />
		{/if}
		<div class="divider" />

		<h2 class="text-2xl font-bold">緊急聯絡人</h2>
		<Form bind:form={emergency} />
		<div class="divider" />

		<h2 class="text-2xl font-bold">防疫旅遊史</h2>
		<Form bind:form={travel} />
		<div class="divider" />

		<h2 class="text-2xl font-bold">其他</h2>
		<Form bind:form={others} />
		<div class="divider" />

		<h2 class="text-2xl font-bold">讓我們稍微認識你</h2>
		<Form bind:form={about} />
		<div class="divider" />

		<button class="btn-primary btn" on:click={save}>儲存</button>
	</div>
</div>
