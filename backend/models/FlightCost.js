class FlightCost {
  constructor({
    seat_id,
    valid_from_date,
    valid_to_date,
    cost,
    created_at,
    updated_at
  }) {
    this.seat_id = seat_id;
    this.valid_from_date = valid_from_date;
    this.valid_to_date = valid_to_date;
    this.cost = cost;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}

module.exports = FlightCost;