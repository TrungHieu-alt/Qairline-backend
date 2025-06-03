-- +goose Up
CREATE TABLE service_offerings (
    travel_class_id UUID NOT NULL,
    service_id UUID NOT NULL,
    is_offered BOOLEAN NOT NULL DEFAULT false,
    from_month TEXT,
    to_month TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT service_offerings_pk PRIMARY KEY (travel_class_id, service_id),
    CONSTRAINT fk_travel_class
        FOREIGN KEY (travel_class_id)
        REFERENCES travel_classes (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_service
        FOREIGN KEY (service_id)
        REFERENCES flight_services (id)
        ON DELETE CASCADE,
    CONSTRAINT check_months CHECK (
        (from_month IS NULL AND to_month IS NULL) OR
        (from_month IS NOT NULL AND to_month IS NOT NULL AND from_month <= to_month)
    )
);

-- +goose Down
DROP TABLE service_offerings; 