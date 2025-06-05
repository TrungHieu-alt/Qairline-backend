class PaymentStatus {
  constructor({
    id,
    status,
    due_date,
    amount,
    reservation_id,
    created_at,
    updated_at,
  }) {
    this.id = id;
    this.status = status;
    this.due_date = due_date;
    this.amount = amount;
    this.reservation_id = reservation_id;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}

module.exports = PaymentStatus;