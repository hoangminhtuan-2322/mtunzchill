CREATE TABLE IF NOT EXISTS mtc_users (id uuid PRIMARY KEY, username varchar(24) NOT NULL UNIQUE, display_name varchar(40) NOT NULL, password_hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(), CONSTRAINT mtc_username_format CHECK(username ~ '^[a-z][a-z0-9_]{2,23}$'));
CREATE TABLE IF NOT EXISTS mtc_sessions(token_hash char(64) PRIMARY KEY,user_id uuid NOT NULL REFERENCES mtc_users(id) ON DELETE CASCADE,created_at timestamptz NOT NULL DEFAULT now(),expires_at timestamptz NOT NULL);
CREATE INDEX IF NOT EXISTS mtc_session_expiry_idx ON mtc_sessions(expires_at);
CREATE INDEX IF NOT EXISTS mtc_session_user_idx ON mtc_sessions(user_id);
CREATE TABLE IF NOT EXISTS mtc_state(user_id uuid PRIMARY KEY REFERENCES mtc_users(id) ON DELETE CASCADE,revision bigint NOT NULL CHECK(revision>=1),data jsonb NOT NULL,updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS mtc_auth_limits(bucket varchar(48) PRIMARY KEY,hits int NOT NULL DEFAULT 0,starts_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS mtc_auth_limit_age_idx ON mtc_auth_limits(starts_at);
