const PLACE_TYPE_LABELS = {
  restaurant: 'Restaurant',
  food: 'Food & Beverage',
  cafe: 'Cafe',
  bar: 'Bar',
  lodging: 'Hotel',
  hospital: 'Hospital',
  doctor: 'Medical Clinic',
  dentist: 'Dental Clinic',
  gym: 'Gym / Fitness',
  beauty_salon: 'Beauty Salon',
  hair_care: 'Hair Salon',
  nail_salon: 'Nail Salon',
  school: 'School',
  university: 'University',
  real_estate_agency: 'Real Estate',
  lawyer: 'Law Firm',
  accounting: 'Accounting Firm',
  insurance_agency: 'Insurance Agency',
  bank: 'Bank',
  car_dealer: 'Car Dealership',
  car_repair: 'Auto Repair',
  car_wash: 'Car Wash',
  clothing_store: 'Clothing Store',
  electronics_store: 'Electronics Store',
  pharmacy: 'Pharmacy',
  supermarket: 'Grocery Store',
  shopping_mall: 'Shopping Mall',
  travel_agency: 'Travel Agency',
  spa: 'Spa & Wellness',
  plumber: 'Plumbing Service',
  electrician: 'Electrical Service',
  hardware_store: 'Hardware Store',
  veterinary_care: 'Veterinary Clinic',
  physiotherapist: 'Physiotherapy',
  florist: 'Florist',
  jewelry_store: 'Jewellery Store',
  furniture_store: 'Furniture Store',
  bakery: 'Bakery',
  night_club: 'Night Club',
  movie_theater: 'Cinema',
  laundry: 'Laundry Service',
  painter: 'Painting Service',
  roofing_contractor: 'Roofing',
  general_contractor: 'Contractor',
  moving_company: 'Moving Company',
  storage: 'Storage',
  gym: 'Gym',
  fitness: 'Fitness',
  optician: 'Optician',
  physiotherapist: 'Physiotherapy',
};

const EXCLUDED_TYPES = new Set([
  'establishment',
  'point_of_interest',
  'premise',
  'geocode',
  'political',
  'locality',
  'sublocality',
  'neighborhood',
  'administrative_area_level_1',
  'administrative_area_level_2',
  'country',
  'route',
  'street_address',
]);

export function mapPlaceTypeToCategory(types = []) {
  for (const t of types) {
    if (PLACE_TYPE_LABELS[t]) return PLACE_TYPE_LABELS[t];
  }
  const readable = types.filter(t => !EXCLUDED_TYPES.has(t));
  if (readable.length === 0) return 'Business';
  return readable[0]
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

export function extractCityFromAddress(formattedAddress) {
  if (!formattedAddress) return '';
  const parts = formattedAddress.split(',').map(p => p.trim());
  if (parts.length >= 3) return parts[parts.length - 3];
  if (parts.length === 2) return parts[0];
  return parts[0] || '';
}

export function formatCSVCell(val) {
  if (val === null || val === undefined) return '""';
  return `"${String(val).replace(/"/g, '""')}"`;
}
