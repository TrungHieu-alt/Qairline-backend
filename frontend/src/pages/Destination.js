import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';

function Destination({ destinations }) {
    const { name } = useParams(); // Lấy tên điểm đến từ URL (ví dụ: /destination/hanoi)
    const navigate = useNavigate();
    
    // Tìm điểm đến dựa trên tên
    const destination = destinations.find(dest => dest.name.toLowerCase() === name.toLowerCase());

    useEffect(() => {
        // Nếu không tìm thấy điểm đến, chuyển hướng về trang chủ
        if (!destination) {
            navigate('/');
        }
    }, [destination, navigate]);

    if (!destination) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="container mx-auto p-4"
        >
            {/* Banner hình ảnh lớn */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative bg-cover bg-center h-96 rounded-lg mb-6"
                style={{ backgroundImage: `url('${destination.image}')` }}
            >
                <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-white rounded-lg">
                    <h1 className="text-4xl font-bold mb-2">{destination.name}</h1>
                </div>
            </motion.div>

            {/* Mô tả điểm đến */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-white shadow-md rounded-lg p-6 mb-6"
            >
                <h2 className="text-2xl font-semibold mb-4 text-green-600">Giới thiệu về {destination.name}</h2>
                <p className="text-gray-600">{destination.description}</p>
            </motion.div>

            {/* Gallery ảnh */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mb-6"
            >
                <h2 className="text-2xl font-semibold mb-4 text-green-600">Khám phá {destination.name}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {destination.galleryImages.map((image, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            className="relative rounded-lg overflow-hidden"
                        >
                            <img
                                src={image}
                                alt={`${destination.name} ${index + 1}`}
                                className="w-full h-40 object-cover"
                            />
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Nút quay lại */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-center"
            >
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/')}
                    className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
                >
                    Quay lại trang chủ
                </motion.button>
            </motion.div>
        </motion.div>
    );
}

export default Destination;