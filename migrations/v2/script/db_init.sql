BEGIN;
LOCK TABLE users IN ACCESS EXCLUSIVE MODE;
INSERT INTO users (email, password_hash, role)
VALUES
  ('admin@test.com', '$2b$10$.64H5Ym2Rll7xsPSvspynuA0BA64GEevupLO/R43IK7gGgbs2iYQ.', 'admin');
COMMIT;

