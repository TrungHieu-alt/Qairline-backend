-- +goose Up
INSERT INTO employees (id, first_name, last_name, email, password_hash, role)
VALUES (
  gen_random_uuid(),
  'Admin',
  'User',
  'admin@test.com',
  '$2b$10$GsDJ99Feu/vsIDmvI.cAyuL0TsEjcC8RtSa0rcoqK789fjUAG1tZy',
  'Admin'
);

-- +goose Down
DELETE FROM employees WHERE email = 'admin@test.com';
