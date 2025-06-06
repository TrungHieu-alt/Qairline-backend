    import { useState, useEffect, useRef } from 'react';
    import { useForm } from 'react-hook-form';
    import { useNavigate } from 'react-router-dom';
    import { getFlights, searchFlights } from '../services/api';
    import { staticFlights } from '../data/flights';
    import FlightCard from '../components/FlightCard';
    import { motion, useInView } from 'framer-motion';

    // Component wrapper để thêm hiệu ứng cuộn
    const Section = ({ children, className, delay = 0 }) => {
        const ref = useRef(null);
        const isInView = useInView(ref, { once: true, margin: "0px 0px -100px 0px" });

        return (
            <motion.section
                ref={ref}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay }}
                className={className}
            >
                {children}
            </motion.section>
        );
    };

    function Home({ destinations }) {
        const { register, handleSubmit } = useForm();
        const navigate = useNavigate();
        const [featuredFlights, setFeaturedFlights] = useState([]);
        const [airports, setAirports] = useState([]);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState(null);
        const [visibleDestinations, setVisibleDestinations] = useState(3);

        // Dữ liệu tĩnh cho ưu đãi và đánh giá
        const specialOffers = [
            { id: 1, title: "Khuyến mãi hè", description: "Giảm 30% cho các chuyến bay nội địa!", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e", tag: "Hot", tagColor: "bg-green-600" },
            { id: 2, title: "Bay quốc tế giá rẻ", description: "Giảm 20% cho các chuyến bay đến Thái Lan!", image: "https://images.unsplash.com/photo-1559592417-7d9f9c8d7485", tag: "International", tagColor: "bg-green-600" }
        ];

        // Dữ liệu tĩnh cho thông báo
        const notifications = [
            { 
                id: 1, 
                title: "Thay đổi lịch bay", 
                description: "Một số chuyến bay đến Đà Nẵng có thể bị ảnh hưởng do thời tiết xấu.", 
                image: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1", 
                tag: "Important", 
                tagColor: "bg-green-600" 
            },
            { 
                id: 2, 
                title: "Nâng cấp sân bay", 
                description: "Sân bay Tân Sơn Nhất đang được nâng cấp, vui lòng đến sớm 30 phút.", 
                image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05", 
                tag: "Notice", 
                tagColor: "bg-green-600" 
            }
        ];

        const testimonials = [
            { id: 1, name: "Nguyễn Văn A", quote: "Chuyến bay rất thoải mái, dịch vụ tuyệt vời!" },
            { id: 2, name: "Trần Thị B", quote: "Giá vé hợp lý, đặt vé dễ dàng!" },
            { id: 3, name: "Lê Văn C", quote: "Hỗ trợ khách hàng rất nhiệt tình!" }
        ];

        const quoteColors = ['text-blue-500', 'text-green-500', 'text-orange-500'];

        useEffect(() => {
            setLoading(true);
            const fetchData = async () => {
                try {
                    const flightsRes = await getFlights();
                    const flights = flightsRes.data.data || staticFlights;
                    const sortedFlights = flights.sort((a, b) => a.price - b.price).slice(0, 3);
                    setFeaturedFlights(sortedFlights);

                    // Trích xuất danh sách sân bay từ dữ liệu chuyến bay
                    const airportSet = new Set();
                    flights.forEach(flight => {
                        airportSet.add(JSON.stringify({
                            id: flight.departure_airport_id,
                            name: flight.departure_airport_name,
                            code: flight.departure_airport_code
                        }));
                        airportSet.add(JSON.stringify({
                            id: flight.arrival_airport_id,
                            name: flight.arrival_airport_name,
                            code: flight.arrival_airport_code
                        }));
                    });
                    const uniqueAirports = Array.from(airportSet).map(airport => JSON.parse(airport));
                    setAirports(uniqueAirports);
                } catch (err) {
                    setError('Không thể tải dữ liệu: ' + err.message);
                    const sortedStaticFlights = staticFlights.sort((a, b) => a.price - b.price).slice(0, 3);
                    setFeaturedFlights(sortedStaticFlights);
                    // Sử dụng staticFlights để trích xuất sân bay nếu lỗi
                    const airportSet = new Set();
                    staticFlights.forEach(flight => {
                        airportSet.add(JSON.stringify({
                            id: flight.departure_airport_id,
                            name: flight.departure_airport_name,
                            code: flight.departure_airport_code
                        }));
                        airportSet.add(JSON.stringify({
                            id: flight.arrival_airport_id,
                            name: flight.arrival_airport_name,
                            code: flight.arrival_airport_code
                        }));
                    });
                    const uniqueAirports = Array.from(airportSet).map(airport => JSON.parse(airport));
                    setAirports(uniqueAirports);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }, []);

        const onSubmit = (data) => {
            const searchData = {
                legs: [
                    {
                        from_airport_id: data.departure,
                        to_airport_id: data.destination,
                        date: data.travelDate
                    }
                ]
            };
            searchFlights(searchData)
                .then(res => navigate('/flights', { state: { flights: res.data.data } }))
                .catch(err => console.error('Search failed:', err));
        };

        const handleExploreDestination = (destinationName) => {
            navigate(`/destination/${encodeURIComponent(destinationName.toLowerCase())}`);
        };

        const handleViewMoreDestinations = () => {
            setVisibleDestinations(destinations.length);
        };

        const handleViewLessDestinations = () => {
            setVisibleDestinations(3);
        };

        return (
            <div>
                {/* Banner ảnh đầu trang */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="relative bg-cover bg-center h-96"
                    style={{ backgroundImage: "url('https://free.vector6.com/wp-content/uploads/2020/03/StockAnhDep001.jpg')" }}
                >
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-center text-white"
                        >
                            <h1 className="text-5xl font-bold mb-4">Khám phá Việt Nam cùng QAirline</h1>
                            <p className="text-xl mb-6">Đặt vé ngay hôm nay để nhận ưu đãi lên đến 30%!</p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/flights')}
                                className="bg-yellow-500 text-white p-3 rounded-lg hover:bg-yellow-600 transition"
                            >
                                Đặt vé ngay
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Ô tìm chuyến bay */}
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="container mx-auto p-5 flex justify-center"
                >
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl">
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                            <select
                                {...register('departure')}
                                className="p-1 border rounded flex-1"
                            >
                                <option value="">Chọn điểm đi</option>
                                {airports.map(airport => (
                                    <option key={airport.id} value={airport.id}>
                                        {airport.name} ({airport.code})
                                    </option>
                                ))}
                            </select>
                            <select
                                {...register('destination')}
                                className="p-1 border rounded flex-1"
                            >
                                <option value="">Chọn điểm đến</option>
                                {airports.map(airport => (
                                    <option key={airport.id} value={airport.id}>
                                        {airport.name} ({airport.code})
                                    </option>
                                ))}
                            </select>
                            <input
                                type="date"
                                {...register('travelDate')}
                                className="p-2 border rounded flex-1"
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
                            >
                                Tìm chuyến bay
                            </motion.button>
                        </form>
                    </div>
                </motion.div>

                {/* Chuyến bay nổi bật */}
                <Section className="container mx-auto p-2 mt-8 bg-white">
                    <h2 className="text-3xl font-bold mb-6 text-green-600">Chuyến bay nổi bật</h2>
                    {loading ? (
                        <div className="text-center p-2">Đang tải...</div>
                    ) : (
                        <>
                            {error && (
                                <div className="text-center p-2 text-red-500 bg-red-100 rounded-lg mb-6">
                                    {error}
                                    <p className="text-gray-600 mt-2">Hiển thị dữ liệu tĩnh do lỗi từ backend.</p>
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {featuredFlights.length > 0 ? (
                                    featuredFlights.map((flight, index) => (
                                        <motion.div
                                            key={flight.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: index * 0.1 }}
                                        >
                                            <FlightCard flight={flight} navigate={navigate} />
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center p-2">Không có chuyến bay nổi bật.</div>
                                )}
                            </div>
                        </>
                    )}
                </Section>

                {/* Đường phân cách */}
            <hr className="border-t border-gray-300 my-8" />


                {/* Điểm đến phổ biến */}
                <Section className="container mx-auto p-2 bg-blue-50" delay={0.2}>
                    <h2 className="text-3xl font-bold mb-6 text-green-600">Điểm đến phổ biến</h2>
                    <div className="space-y-6">
                        {destinations.slice(0, visibleDestinations).map((dest, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="relative bg-cover bg-center h-80 rounded-lg overflow-hidden"
                                style={{ backgroundImage: `url(${dest.image})` }}
                            >
                                <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-start p-6">
                                    <h3 className="text-3xl font-bold text-white drop-shadow-md">{dest.name}</h3>
                                    <p className="text-lg text-white drop-shadow-md mt-2">Nhiệt độ: {dest.temperature}</p>
                                    <p className="text-base text-white drop-shadow-md mt-2 max-w-md">{dest.description}</p>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleExploreDestination(dest.name)}
                                        className="mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition"
                                    >
                                        Khám phá
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="text-center mt-6">
                        {visibleDestinations < destinations.length ? (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleViewMoreDestinations}
                                className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
                            >
                                Xem thêm
                            </motion.button>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleViewLessDestinations}
                                className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
                            >
                                Thu gọn
                            </motion.button>
                        )}
                    </div>
                </Section>

                {/* Đường phân cách */}
            <hr className="border-t border-gray-300 my-8" />


                {/* Ưu đãi đặc biệt */}
                <Section className="container mx-auto p-2 bg-green-50" delay={0.4}>
                    <h2 className="text-3xl font-bold mb-6 text-green-600">Ưu đãi đặc biệt</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {specialOffers.map((offer, index) => (
                            <motion.div
                                key={offer.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                <img src={offer.image} alt={offer.title} className="w-full h-48 object-cover" />
                                <div className="p-4">
                                    <div className="flex items-center mb-2">
                                        <span className={`${offer.tagColor} text-white text-xs font-bold px-2 py-1 rounded`}>{offer.tag}</span>
                                        <h3 className="text-xl font-semibold ml-2 text-gray-800">{offer.title}</h3>
                                    </div>
                                    <p className="text-gray-600 mb-4">{offer.description}</p>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => navigate('/flights')}
                                        className="w-full bg-green-600 text-white p-2 rounded hover:bg-orange-500 transition-colors"
                                    >
                                        Đặt ngay
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </Section>

                {/* Đường phân cách */}
                <hr className="border-t border-gray-200 my-8" />

                {/* Thông báo */}
                <Section className="container mx-auto p-2 bg-green-50/50" delay={0.5}>
                    <h2 className="text-3xl font-bold mb-6 text-green-600">Thông báo</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {notifications.map((notification, index) => (
                            <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                <img src={notification.image} alt={notification.title} className="w-full h-48 object-cover" />
                                <div className="p-4">
                                    <div className="flex items-center mb-2">
                                        <span className={`${notification.tagColor} text-white text-xs font-bold px-2 py-1 rounded`}>
                                            {notification.tag}
                                        </span>
                                        <h3 className="text-xl font-semibold ml-2 text-gray-800">{notification.title}</h3>
                                    </div>
                                    <p className="text-gray-600 mb-4">{notification.description}</p>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => navigate('/notifications')}
                                        className="w-full bg-green-600 text-white p-2 rounded hover:bg-orange-500 transition-colors"
                                    >
                                        Xem ngay
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </Section>

                {/* Đường phân cách */}
            <hr className="border-t border-gray-300 my-8" />

                {/* Đánh giá khách hàng */}
                <Section className="container mx-auto p-2 bg-green-50" delay={0.6}>
                    <h2 className="text-3xl font-bold mb-6 text-green-600">Đánh giá từ khách hàng</h2>
                    <div className="space-y-4">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={testimonial.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="p-2 bg-white shadow-md rounded-lg"
                            >
                                <p className="text-gray-600 italic">
                                    <span className={`text-3xl ${quoteColors[index % quoteColors.length]} mr-1`}>"</span>
                                    {testimonial.quote}
                                    <span className={`text-3xl ${quoteColors[index % quoteColors.length]} ml-1`}>"</span>
                                </p>
                                <p className="text-green-600 font-semibold mt-2">{testimonial.name}</p>
                            </motion.div>
                        ))}
                    </div>
                </Section>
                {/* Đường phân cách */}
            <hr className="border-t border-gray-300 my-8" />

                {/* Thông tin máy bay */}
                <Section className="container mx-auto p-2 bg-white" delay={0.8}>
                    <h2 className="text-3xl font-bold mb-6 text-green-600">Thông tin máy bay</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <img src="https://images.unsplash.com/photo-1549221341-3a4b4b7a5a5a" alt="Boeing 787" className="w-full h-48 object-cover rounded" />
                            <h3 className="text-xl font-semibold mt-2 text-green-600">Boeing 787 Dreamliner</h3>
                            <p className="text-gray-600">Máy bay hiện đại với cabin rộng rãi và tiện nghi cao cấp.</p>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <img src="https://images.unsplash.com/photo-1549221341-3a4b4b7a5a5a" alt="Airbus A350" className="w-full h-48 object-cover rounded" />
                            <h3 className="text-xl font-semibold mt-2 text-green-600">Airbus A350</h3>
                            <p className="text-gray-600">Máy bay tiết kiệm nhiên liệu với công nghệ tiên tiến.</p>
                        </div>
                    </div>
                </Section>
            {/* Đường phân cách */}
            <hr className="border-t border-gray-300 my-8" />

                {/* Cẩm nang du lịch địa phương */}
                <Section className="container mx-auto p-2 bg-white" delay={1.0}>
                    <h2 className="text-3xl font-bold mb-6 text-green-600">Cẩm nang du lịch địa phương</h2>
                    <div className="space-y-4">
                        <div className="bg-gray-100 p-4 rounded-lg flex items-center">
                            <img src="https://picsum.photos/100/100" alt="Ẩm thực" className="w-24 h-24 object-cover rounded mr-4" />
                            <div>
                                <h3 className="text-xl font-semibold text-green-600">Khám phá ẩm thực Việt Nam</h3>
                                <p className="text-gray-600">Thưởng thức các món ăn đặc sản tại các địa phương.</p>
                            </div>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-lg flex items-center">
                            <img src="https://picsum.photos/100/100" alt="Lễ hội" className="w-24 h-24 object-cover rounded mr-4" />
                            <div>
                                <h3 className="text-xl font-semibold text-green-600">Lễ hội văn hóa</h3>
                                <p className="text-gray-600">Trải nghiệm các lễ hội độc đáo trên khắp Việt Nam.</p>
                            </div>
                        </div>
                    </div>
                </Section>
            </div>
        );
    }

    export default Home;