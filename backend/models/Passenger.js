class Passenger {
  constructor({
    id,
    first_name,
    last_name,
    email,
    phone_number,
    address,
    city,
    state,
    zipcode,
    country
  }) {
    this.id = id;
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.phone_number = phone_number;
    this.address = address;
    this.city = city;
    this.state = state;
    this.zipcode = zipcode;
    this.country = country;
  }
}

module.exports = Passenger;