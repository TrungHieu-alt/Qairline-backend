class Reservation {
  constructor({ id, passenger_id, seat_id, reservation_date }) {
    this.id = id;
    this.passenger_id = passenger_id;
    this.seat_id = seat_id;
    this.reservation_date = reservation_date;
  }
}

module.exports = Reservation;