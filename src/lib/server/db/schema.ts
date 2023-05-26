export interface Application {
	email: string;
	created: string;
	updated: string;
	status: string;
}

export interface Profile {
	email: string;
	name: string;
	gender: string;
	school: string;
	birth: string;
	personal_id: string;
	phone: string;
	blood_type: string;
	facebook: string;
	parent_name: string;
	parent_relation: string;
	parent_phone: string;
	food_type: string;
	allergy_source: string;
	disease: string;
	clothes_size: string;
	self_intro: string;
	motivation: string;
	skill_experienced: string;
	skill_mastered: string;
}

export interface TaskProgress {
	email: string;
	profile: string;
	avatar: string;
	quiz: string;
	github: string;
}

export interface Voting {
	email: string;
	target: string;
	vote: number;
}

export interface Database {
	Application: Application;
	Profile: Profile;
	TaskProgress: TaskProgress;
	Voting: Voting;
}
