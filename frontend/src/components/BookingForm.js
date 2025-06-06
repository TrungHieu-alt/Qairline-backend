import { useState } from 'react';
import { motion } from 'framer-motion';

function BookingForm({ flight, locations, onSubmit }) {
    const [name, setName] = useState('');
    const [departureCountry, setDepartureCountry] = useState('');
    const [departureCity, setDepartureCity] = useState('');
    const [destinationCountry, setDestinationCountry] = useState('');
    const [destinationCity, setDestinationCity] = useState('');

    // Danh sách thành phố tương ứng với quốc gia đã chọn
    const departureCities = departureCountry
        ? locations.find(loc => loc.country === departureCountry)?.cities || []
        : [];
    const destinationCities = destinationCountry
        ? locations.find(loc => loc.country === destinationCountry)?.cities || []
        : [];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !departureCountry || !departureCity || !destinationCountry || !destinationCity) {
            alert('Vui lòng điền đầy đủ thông tin.');
            return;
        }
        onSubmit({
            name,
            departure: departureCity,
            destination: destinationCity
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Họ tên */}
            <div>
                <label className="block text-gray-700 mb-2">Họ tên</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập họ tên"
                    className="p-2 border rounded w-full"
                    required
                />
            </div>
            {/* Điểm đi */}
            <div>
                <label className="block text-gray-700 mb-2">Điểm đi</label>
                <div className="flex space-x-4">
                    <select
                        value={departureCountry}
                        onChange={(e) => {
                            setDepartureCountry(e.target.value);
                            setDepartureCity(''); // Reset thành phố khi đổi quốc gia
                        }}
                        className="p-2 border rounded flex-1"
                        required
                    >
                        <option value="">Chọn quốc gia</option>
                        {locations.map(loc => (
                            <option key={loc.country} value={loc.country}>
                                {loc.country}
                            </option>
                        ))}
                    </select>
                    <select
                        value={departureCity}
                        onChange={(e) => setDepartureCity(e.target.value)}
                        className="p-2 border rounded flex-1"
                        disabled={!departureCountry}
                        required
                    >
                        <option value="">Chọn thành phố</option>
                        {departureCities.map(city => (
                            <option key={city} value={city}>
                                {city}
                        </option>
                        ))}
                    </select>
                </div>
            </div>
            {/* Điểm đến */}
            <div>
                <label className="block text-gray-700 mb-2">Điểm đến</label>
                <div className="flex space-x-4">
                    <select
                        value={destinationCountry}
                        onChange={(e) => {
                            setDestinationCountry(e.target.value);
                            setDestinationCity(''); // Reset thành phố khi đổi quốc gia
                        }}
                        className="p-2 border rounded flex-1"
                        required
                    >
                        <option value="">Chọn quốc gia</option>
                        {locations.map(loc => (
                            <option key={loc.country} value={loc.country}>
                                {loc.country}
                            </option>
                        ))}
                    </select>
                    <select
                        value={destinationCity}
                        onChange={(e) => setDestinationCity(e.target.value)}
                        className="p-2 border rounded flex-1"
                        disabled={!destinationCountry}
                        required
                    >
                        <option value="">Chọn thành phố</option>
                        {destinationCities.map(city => (
                            <option key={city} value={city}>
                                {city}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition w-full"
            >
                Tiếp tục
            </motion.button>
        </form>
    );
}

export default BookingForm;