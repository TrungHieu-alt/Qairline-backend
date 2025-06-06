class SeatDetail {
  constructor({
    id,
    seat_number,
    travel_class_id,
    flight_id
  }) {
    this.id = id;
    this.seat_number = seat_number;
    this.travel_class_id = travel_class_id;
    this.flight_id = flight_id;
  }
}

module.exports = SeatDetail;