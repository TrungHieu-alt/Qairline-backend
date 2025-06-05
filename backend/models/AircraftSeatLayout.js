class AircraftSeatLayout {
  constructor({ aircraft_type_id, travel_class_id, capacity }) {
    this.aircraft_type_id = aircraft_type_id;
    this.travel_class_id = travel_class_id;
    this.capacity = capacity;
  }
}

module.exports = AircraftSeatLayout;