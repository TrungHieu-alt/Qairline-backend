import { motion } from 'framer-motion';

function AboutUs() {
    const teamMembers = [
        {
            name: "Nguyễn Văn A",
            position: "CEO",
            image: "https://images.unsplash.com/photo-1560250097-0b93528c311a",
            description: "Với hơn 15 năm kinh nghiệm trong ngành hàng không."
        },
        {
            name: "Trần Thị B",
            position: "Giám đốc Điều hành",
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2",
            description: "Chuyên gia về quản lý và phát triển dịch vụ khách hàng."
        },
        {
            name: "Lê Văn C",
            position: "Giám đốc Kỹ thuật",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
            description: "Phụ trách đội ngũ kỹ thuật và bảo dưỡng máy bay."
        }
    ];

    const milestones = [
        {
            year: "2010",
            title: "Thành lập QAirline",
            description: "Bắt đầu với 3 máy bay và 10 đường bay nội địa."
        },
        {
            year: "2015",
            title: "Mở rộng đường bay quốc tế",
            description: "Khai trương các đường bay đến các nước Đông Nam Á."
        },
        {
            year: "2020",
            title: "Đổi mới công nghệ",
            description: "Áp dụng công nghệ mới trong đặt vé và quản lý chuyến bay."
        },
        {
            year: "2023",
            title: "Phát triển bền vững",
            description: "Cam kết sử dụng nhiên liệu sinh học và bảo vệ môi trường."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative h-96 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05')" }}>
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-center text-white">
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl font-bold mb-4"
                        >
                            Về Chúng Tôi
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl"
                        >
                            Hơn 10 năm phục vụ và phát triển
                        </motion.p>
                    </div>
                </div>
            </div>

            {/* Mission & Vision */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-8 rounded-lg shadow-lg"
                    >
                        <h2 className="text-3xl font-bold text-green-600 mb-4">Tầm nhìn</h2>
                        <p className="text-gray-600">
                            Trở thành hãng hàng không hàng đầu Việt Nam, mang đến trải nghiệm bay an toàn, 
                            thoải mái với giá cả hợp lý cho mọi hành khách.
                        </p>
                    </motion.div>
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-8 rounded-lg shadow-lg"
                    >
                        <h2 className="text-3xl font-bold text-green-600 mb-4">Sứ mệnh</h2>
                        <p className="text-gray-600">
                            Kết nối con người và điểm đến, tạo ra những chuyến bay chất lượng, 
                            đồng thời góp phần phát triển ngành hàng không Việt Nam.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Team Section */}
            <div className="bg-white py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-green-600 mb-12">Đội ngũ lãnh đạo</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {teamMembers.map((member, index) => (
                            <motion.div
                                key={member.name}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.2 }}
                                className="bg-gray-50 rounded-lg overflow-hidden shadow-lg"
                            >
                                <img src={member.image} alt={member.name} className="w-full h-64 object-cover" />
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-gray-800">{member.name}</h3>
                                    <p className="text-green-600 mb-2">{member.position}</p>
                                    <p className="text-gray-600">{member.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Milestones */}
            <div className="container mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-center text-green-600 mb-12">Chặng đường phát triển</h2>
                <div className="space-y-8">
                    {milestones.map((milestone, index) => (
                        <motion.div
                            key={milestone.year}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.2 }}
                            className="flex items-center"
                        >
                            <div className="w-32 flex-shrink-0">
                                <span className="text-2xl font-bold text-green-600">{milestone.year}</span>
                            </div>
                            <div className="flex-grow bg-white p-6 rounded-lg shadow-md ml-4">
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">{milestone.title}</h3>
                                <p className="text-gray-600">{milestone.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AboutUs; 