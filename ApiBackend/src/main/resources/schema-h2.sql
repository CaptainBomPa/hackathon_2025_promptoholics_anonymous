CREATE TABLE IF NOT EXISTS pension_calculation (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    expected_pension DOUBLE PRECISION NOT NULL,
    age SMALLINT NOT NULL CHECK (age BETWEEN 0 AND 120) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    salary_amount DOUBLE PRECISION NOT NULL,
    included_sickness_periods BOOLEAN NOT NULL,
    accumulated_funds_total DOUBLE PRECISION,
    actual_pension DOUBLE PRECISION,
    inflation_adjusted_pension DOUBLE PRECISION,
    postal_code VARCHAR(16),
    version INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pension_usage_date ON pension_calculation(created_at);
