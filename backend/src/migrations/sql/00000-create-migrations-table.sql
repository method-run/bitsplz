CREATE TABLE
    IF NOT EXISTS migrations (
        file_name VARCHAR(255) NOT NULL,
        applied_date TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        "order" BIGINT GENERATED ALWAYS AS IDENTITY,
        should_apply BOOLEAN DEFAULT true,
        PRIMARY KEY (file_name)
    );

INSERT INTO
    migrations (file_name, "order") OVERRIDING SYSTEM VALUE
VALUES
    ('00000-create-migrations-table.sql', 0);