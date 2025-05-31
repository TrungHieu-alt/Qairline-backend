
// Map tên hạng → cột ghế còn & cột giá gốc trên bảng flights
const COL_BY_CLASS = {
  'First Class':    'available_first_class_seats',
  'Business Class': 'available_business_class_seats',
  'Economy Class':  'available_economy_class_seats'
};

const PRICE_FIELD_BY_CLASS = {
  'First Class':    'base_first_class_price',
  'Business Class': 'base_business_class_price',
  'Economy Class':  'base_economy_class_price'
};

function seatColumnByClass(className) {
  return COL_BY_CLASS[className];
}

function basePriceFieldByClass(className) {
  return PRICE_FIELD_BY_CLASS[className];
}

/**
 * Kiểm tra còn đủ ghế cho hạng đã cho.
 * @param {Object} flight  Bản ghi flights
 * @param {String} className  'First Class' | 'Business Class' | 'Economy Class'
 * @param {Number} quantity   Số ghế yêu cầu
 */
function hasAvailableSeats(flight, className, quantity = 1) {
  const col = seatColumnByClass(className);
  if (!col) return false;
  return flight[col] >= parseInt(quantity, 10);
}

module.exports = {
  seatColumnByClass,
  basePriceFieldByClass,
  hasAvailableSeats
};
