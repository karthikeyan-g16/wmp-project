CREATE SCHEMA IF NOT EXISTS portfolio_schema;
CREATE SCHEMA IF NOT EXISTS analytics_schema;
CREATE SCHEMA IF NOT EXISTS auth_schema;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_catalog.pg_roles
        WHERE rolname = 'portfolio_svc_user'
    ) THEN
        CREATE ROLE portfolio_svc_user
        WITH LOGIN PASSWORD 'localdev123';
    END IF;

    IF NOT EXISTS (
        SELECT FROM pg_catalog.pg_roles
        WHERE rolname = 'analytics_svc_user'
    ) THEN
        CREATE ROLE analytics_svc_user
        WITH LOGIN PASSWORD 'localdev123';
    END IF;

    IF NOT EXISTS (
        SELECT FROM pg_catalog.pg_roles
        WHERE rolname = 'auth_svc_user'
    ) THEN
        CREATE ROLE auth_svc_user
        WITH LOGIN PASSWORD 'localdev123';
    END IF;
END
$$;

GRANT USAGE, CREATE ON SCHEMA portfolio_schema
TO portfolio_svc_user;

GRANT USAGE, CREATE ON SCHEMA analytics_schema
TO analytics_svc_user;

GRANT USAGE, CREATE ON SCHEMA auth_schema
TO auth_svc_user;

GRANT ALL PRIVILEGES ON ALL TABLES
IN SCHEMA portfolio_schema TO portfolio_svc_user;

GRANT ALL PRIVILEGES ON ALL TABLES
IN SCHEMA analytics_schema TO analytics_svc_user;

GRANT ALL PRIVILEGES ON ALL TABLES
IN SCHEMA auth_schema TO auth_svc_user;

GRANT ALL PRIVILEGES ON ALL SEQUENCES
IN SCHEMA portfolio_schema TO portfolio_svc_user;

GRANT ALL PRIVILEGES ON ALL SEQUENCES
IN SCHEMA analytics_schema TO analytics_svc_user;

GRANT ALL PRIVILEGES ON ALL SEQUENCES
IN SCHEMA auth_schema TO auth_svc_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA portfolio_schema
GRANT ALL ON TABLES TO portfolio_svc_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA analytics_schema
GRANT ALL ON TABLES TO analytics_svc_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA auth_schema
GRANT ALL ON TABLES TO auth_svc_user;
