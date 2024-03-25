DROP TABLE IF EXISTS Profile;
CREATE TABLE Profile (
    email TEXT NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    gender TEXT NOT NULL,
    school TEXT NOT NULL,
    birth TEXT NOT NULL,
    personal_id TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    blood_type TEXT NOT NULL,
    facebook TEXT NOT NULL UNIQUE,
    parent_name TEXT NOT NULL,
    parent_relation TEXT NOT NULL,
    parent_phone TEXT NOT NULL,
    food_type TEXT NOT NULL,
    allergy_source TEXT NOT NULL,
    disease TEXT NOT NULL,
    clothes_size TEXT NOT NULL,
    self_intro TEXT NOT NULL,
    motivation TEXT NOT NULL,
    skill_experienced TEXT NOT NULL,
    skill_mastered TEXT NOT NULL
);

DROP TABLE IF EXISTS TaskProgress;
CREATE TABLE TaskProgress (
    email TEXT NOT NULL PRIMARY KEY,
    -- 完成日期
    profile TEXT,
    -- 完成日期
    avatar TEXT,
    -- 完成日期
    quiz TEXT
    -- GitHub 帳號
    -- github TEXT
);

DROP TABLE IF EXISTS Application;
CREATE TABLE Application (
    email TEXT NOT NULL PRIMARY KEY,
    -- 申請日期
    created TEXT NOT NULL,
    -- 更新日期
    updated TEXT NOT NULL,
    -- 申請狀態
    status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS UserControl (
    email TEXT NOT NULL PRIMARY KEY,
    can_update_profile INT NOT NULL DEFAULT FALSE,
    can_apply INT NOT NULL DEFAULT FALSE,
    can_give_up INT NOT NULL DEFAULT FALSE,
    can_update_additional_info INT NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS Attachment (
    email TEXT NOT NULL,
    file TEXT NOT NULL,
    time TEXT NOT NULL,
    PRIMARY KEY (email, file)
);

CREATE TABLE IF NOT EXISTS Payment (
    email TEXT NOT NULL PRIMARY KEY,
    account TEXT NOT NULL,
    time TEXT NOT NULL,
    updated TEXT NOT NULL,
    correct TEXT
);

CREATE TABLE IF NOT EXISTS Voting (
    email TEXT NOT NULL,
    target TEXT NOT NULL,
    vote INT NOT NULL,
    PRIMARY KEY (email, target)

);
