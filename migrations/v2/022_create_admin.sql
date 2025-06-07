-- +goose Up
INSERT INTO users (id, email, password_hash, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@qairline.com',
  '$2b$10$28ua4yKfeqoacMSAPJDaFuF2TE5XfI8IOKDUOnA/k0XEzXpLEPa6C',
  'admin',
  NOW(),
  NOW()
);

-- +goose Down
DELETE FROM users WHERE email = 'admin@qairline.com'; 