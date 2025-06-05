class AircraftType {
  constructor({
    id,
    name,
    total_seats
  }) {
    this.id = id;
    this.name = name;
    this.total_seats = total_seats;
  }
}

module.exports = AircraftType;