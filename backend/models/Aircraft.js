class Aircraft {
  constructor({
    id,
    airline_id,
    aircraft_type_id,
    registration_number
  }) {
    this.id = id;
    this.airline_id = airline_id;
    this.aircraft_type_id = aircraft_type_id;
    this.registration_number = registration_number;
  }
}

module.exports = Aircraft;