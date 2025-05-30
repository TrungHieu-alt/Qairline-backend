function hasAvailableSeats(flight, ticket_class_id, quantity) {
  const qty = parseInt(quantity || 1);

  switch (parseInt(ticket_class_id)) {
    case 1:
      return flight.available_first_class_seats >= qty;
    case 2:
      return flight.available_business_class_seats >= qty;
    case 3:
      return flight.available_economy_class_seats >= qty;
    default:
      return false;
  }
}

module.exports = {
  hasAvailableSeats
};