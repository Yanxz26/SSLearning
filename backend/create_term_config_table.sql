USE learning_assistant;

CREATE TABLE IF NOT EXISTS term_configs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    term_name VARCHAR(100) NOT NULL,
    start_date VARCHAR(20) NOT NULL,
    end_date VARCHAR(20),
    total_weeks INT DEFAULT 18,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入初始学期配置数据
INSERT INTO term_configs (user_id, term_name, start_date, end_date, total_weeks)
VALUES (3, '2026年春季学期', '2026-02-19', '2026-06-30', 18);