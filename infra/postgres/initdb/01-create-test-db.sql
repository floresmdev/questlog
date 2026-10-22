-- Runs once, only when the pgdata volume is empty (first `up`, or after `down -v`).
-- The API tests use their own database so they never touch dev data.
CREATE DATABASE questlog_test;
