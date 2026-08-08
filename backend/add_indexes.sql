-- 为 todos 表添加索引优化统计查询
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_user_completed ON todos(user_id, completed);
CREATE INDEX IF NOT EXISTS idx_todos_user_created ON todos(user_id, created_at);

-- 为 focus_records 表添加索引
CREATE INDEX IF NOT EXISTS idx_focus_user_date ON focus_records(user_id, date);

-- 为 notes 表添加索引
CREATE INDEX IF NOT EXISTS idx_notes_user_created ON notes(user_id, created_at);

-- 为 wrong_questions 表添加索引
CREATE INDEX IF NOT EXISTS idx_wrong_user_created ON wrong_questions(user_id, created_at);
