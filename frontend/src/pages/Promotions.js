import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAnnouncements } from '../services/api';
import { staticPromotions } from '../data/promotions';
import { motion } from 'framer-motion';

function Promotions() {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        getAnnouncements()
            .then(res => setPromotions(res.data || []))
            .catch(err => {
                setError('Không thể tải danh sách thông báo: ' + err.message);
                // Sử dụng dữ liệu tĩnh làm dự phòng
                setPromotions(staticPromotions);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center p-4">Đang tải...</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="container mx-auto p-4"
        >
            <h1 className="text-3xl font-bold mb-6 text-green-600">Khuyến mãi và tin tức</h1>
            {error && (
                <div className="text-center p-4 text-red-500">
                    {error}
                    <p className="text-gray-600 mt-2">Hiển thị dữ liệu tĩnh do lỗi từ backend.</p>
                </div>
            )}
            <div className="space-y-6">
                {promotions.length > 0 ? (
                    promotions.map((promo, index) => (
                        <motion.div
                            key={promo.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white shadow-md rounded-lg overflow-hidden"
                        >
                            <img src={promo.image || "https://images.unsplash.com/photo-1559592417-7d9f9c8d7485"} alt={promo.title} className="w-full h-48 object-cover" />
                            <div className="p-4">
                                <h2 className="text-xl font-semibold text-green-600">{promo.title}</h2>
                                <p className="text-gray-600">{promo.content}</p>
                                <p className="text-sm text-gray-500">Hết hạn: {new Date(promo.expiryDate || "2025-08-31").toLocaleDateString()}</p>
                                <Link to="/flights">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="mt-2 bg-green-600 text-white p-2 rounded hover:bg-orange-500 transition-colors"
                                    >
                                        Đặt ngay
                                    </motion.button>
                                </Link>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center p-4">Không có thông báo nào.</div>
                )}
            </div>
        </motion.div>
    );
}

export default Promotions;