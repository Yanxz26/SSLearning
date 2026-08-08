USE learning_assistant;

-- 修改notes表的字符集为utf8mb4
ALTER TABLE notes CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 验证字符集
SELECT 
  table_name, 
  table_collation 
FROM information_schema.tables 
WHERE table_schema = 'learning_assistant' AND table_name = 'notes';

-- 查看列字符集
SELECT 
  column_name, 
  character_set_name, 
  collation_name 
FROM information_schema.columns 
WHERE table_schema = 'learning_assistant' AND table_name = 'notes';