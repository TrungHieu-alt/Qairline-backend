class SeatDetail {
  constructor({
    id,
    travel_class_id,
    flight_id
  }) {
    this.id = id;
    this.travel_class_id = travel_class_id;
    this.flight_id = flight_id;
  }
}

module.exports = SeatDetail;