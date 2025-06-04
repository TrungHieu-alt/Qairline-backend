class ServiceOffering {
  constructor({
    travel_class_id,
    service_id,
    is_offered,
    from_month,
    to_month,
    created_at,
    updated_at,
  }) {
    this.travel_class_id = travel_class_id;
    this.service_id = service_id;
    this.is_offered = is_offered;
    this.from_month = from_month;
    this.to_month = to_month;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}

module.exports = ServiceOffering;