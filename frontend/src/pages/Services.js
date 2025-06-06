import { motion } from 'framer-motion';

function Services() {
    const services = [
        {
            title: "Hạng vé Thương gia",
            description: "Trải nghiệm đẳng cấp với ghế ngả 180 độ, ẩm thực cao cấp và dịch vụ chăm sóc cá nhân.",
            icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
            ),
            features: [
                "Ghế ngả 180 độ",
                "Bữa ăn cao cấp",
                "Phòng chờ VIP",
                "Ưu tiên lên máy bay"
            ]
        },
        {
            title: "Hạng vé Phổ thông đặc biệt",
            description: "Tận hưởng không gian rộng rãi hơn và các đặc quyền bổ sung.",
            icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            ),
            features: [
                "Ghế rộng rãi",
                "Hành lý ưu tiên",
                "Bữa ăn đặc biệt",
                "Check-in ưu tiên"
            ]
        },
        {
            title: "Hạng vé Phổ thông",
            description: "Giá cả hợp lý với dịch vụ chất lượng cao.",
            icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            features: [
                "Ghế thoải mái",
                "Hành lý xách tay",
                "Đồ ăn nhẹ",
                "Giải trí trên máy bay"
            ]
        }
    ];

    const additionalServices = [
        {
            title: "Đặt chỗ trước",
            description: "Chọn ghế yêu thích của bạn trước chuyến bay.",
            price: "Từ 50.000 VND"
        },
        {
            title: "Hành lý thêm",
            description: "Mua thêm hành lý ký gửi cho chuyến bay.",
            price: "Từ 200.000 VND"
        },
        {
            title: "Bữa ăn đặc biệt",
            description: "Đặt trước các bữa ăn theo yêu cầu.",
            price: "Từ 150.000 VND"
        },
        {
            title: "Đón tiễn sân bay",
            description: "Dịch vụ xe đưa đón tận nơi.",
            price: "Từ 300.000 VND"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative bg-cover bg-center h-96" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05')" }}>
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-white"
                    >
                        <h1 className="text-5xl font-bold mb-4">Dịch Vụ Của Chúng Tôi</h1>
                        <p className="text-xl">Trải nghiệm bay đẳng cấp cùng QAirline</p>
                    </motion.div>
                </div>
            </div>

            {/* Main Services */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 }}
                            className="bg-white rounded-lg shadow-lg p-8"
                        >
                            <div className="text-green-600 mb-4">
                                {service.icon}
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">{service.title}</h2>
                            <p className="text-gray-600 mb-6">{service.description}</p>
                            <ul className="space-y-2">
                                {service.features.map((feature, i) => (
                                    <li key={i} className="flex items-center text-gray-600">
                                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Additional Services */}
            <div className="bg-white py-16">
                <div className="container mx-auto px-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold text-center text-gray-800 mb-12"
                    >
                        Dịch Vụ Bổ Sung
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {additionalServices.map((service, index) => (
                            <motion.div
                                key={service.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-gray-50 rounded-lg p-6"
                            >
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.title}</h3>
                                <p className="text-gray-600 mb-4">{service.description}</p>
                                <p className="text-green-600 font-semibold">{service.price}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-green-600 py-16">
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Sẵn sàng trải nghiệm dịch vụ của chúng tôi?
                        </h2>
                        <p className="text-white mb-8">
                            Đặt vé ngay hôm nay để tận hưởng những dịch vụ tốt nhất từ QAirline
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white text-green-600 py-3 px-8 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Đặt vé ngay
                        </motion.button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default Services; 