class Flight {
  constructor({
    id,
    source_airport_id,
    destination_airport_id,
    aircraft_id,
    departure_time,
    arrival_time,
  }) {
    this.id = id;
    this.destination_airport_id = destination_airport_id;
    this.source_airport_id = source_airport_id;
    this.aircraft_id = aircraft_id;
    this.departure_time = departure_time;
    this.arrival_time = arrival_time;
  }
}

module.exports = Flight;
