INSERT INTO users (email, password_hash, phone_num, name, nickname, address, created_at, level, role) VALUES
('admin@test.com', '$2b$10$nThZ5ny20voL0B8KyObFJu2GUT84TYPmq0HmCMjaGv7n/raPoOVOW', '01000000000', '관리자', NULL, '서울', NOW(), 'BRONZE', 'ADMIN'),
('user1@test.com', '$2b$10$nThZ5ny20voL0B8KyObFJu2GUT84TYPmq0HmCMjaGv7n/raPoOVOW', '01000000001', '고객1', '고객1', '서울', NOW(), 'BRONZE', 'USER'),
('user2@test.com', '$2b$10$nThZ5ny20voL0B8KyObFJu2GUT84TYPmq0HmCMjaGv7n/raPoOVOW', '01000000002', '고객2', '고객2', '부산', NOW(), 'BRONZE', 'USER'),
('user3@test.com', '$2b$10$nThZ5ny20voL0B8KyObFJu2GUT84TYPmq0HmCMjaGv7n/raPoOVOW', '01000000003', '고객3', '고객3', '대구', NOW(), 'BRONZE', 'USER');
