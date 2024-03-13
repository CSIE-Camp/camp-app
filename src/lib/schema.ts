import { z } from "zod";
import { verify_pid, verify_fb, verify_birth } from "./verify";

export const AuthRequest = z.object({
	email: z.string().email().max(255),
});

export const TokenSchema = z.object({
	iat: z.number(),
	exp: z.number(),
	agent: z.string().max(255),
	email: z.string().email().max(255),
});

export const PhoneSchema = z.string().regex(/^\d{10}$/);

export const ProfileSchema = z.object({
	name: z.string().trim().min(1).max(255),
	gender: z.enum(["男", "女"]),
	school: z.string().trim().min(1).max(255),
	birth: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/)
		.refine((birth) => verify_birth(birth)),
	personal_id: z.string().refine((id) => verify_pid(id)),
	phone: PhoneSchema,
	blood_type: z.enum(["O", "A", "B", "AB", "不確定"]),
	facebook: z
		.string()
		.url()
		.max(255)
		.refine((fb) => verify_fb(fb)),
	parent_name: z.string().trim().min(1).max(255),
	parent_relation: z.string().trim().min(1).max(63),
	parent_phone: PhoneSchema,
	food_type: z.enum(["葷", "素"]),
	allergy_source: z.string().max(255),
	disease: z.string().max(255),
	clothes_size: z.enum(["SS", "S", "M", "L", "XL", "2L", "3L", "4L", "5L", "6L"]),
	self_intro: z.string().trim().min(1).max(4095),
	motivation: z.string().trim().min(1).max(4095),
	skill_experienced: z.string().trim().min(1).max(4095),
	skill_mastered: z.string().trim().min(1).max(4095),
});

export const TaskSchema = z.object({
	// task: z.enum(["profile", "avatar", "quiz", "github"]),
	task: z.enum(["profile", "avatar", "quiz"]),

});
