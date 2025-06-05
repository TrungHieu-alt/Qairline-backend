--
-- Dumping data for table `admins`
--
BEGIN;
LOCK TABLE admins IN ACCESS EXCLUSIVE MODE;
INSERT INTO users (email, password_hash, role)
VALUES
  (admin@test.com, '$2b$10$GsDJ99Feu/vsIDmvI.cAyuL0TsEjcC8RtSa0rcoqK789fjUAG1tZy', 'admin'),
COMMIT;
