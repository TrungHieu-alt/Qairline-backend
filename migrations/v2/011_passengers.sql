-- +goose Up
CREATE TABLE passengers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT,
    last_name TEXT,
    email TEXT CONSTRAINT email_check CHECK (email LIKE '%@%.%'),
    phone_number BIGINT NOT NULL UNIQUE CONSTRAINT ph_length_check CHECK (LENGTH(phone_number::TEXT) = 10),
    address TEXT,
    city TEXT,
    state TEXT,
    zipcode TEXT CONSTRAINT zip_chk CHECK (LENGTH(zipcode) = 5),
    country TEXT
);

-- +goose Down
DROP TABLE passengers;