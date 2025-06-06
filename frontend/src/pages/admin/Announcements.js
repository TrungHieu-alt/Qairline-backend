import { useState, useEffect } from 'react';
import { getAnnouncements, createAnnouncement } from '../../services/api';
import { motion } from 'framer-motion';

function AdminAnnouncements() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({ title: '', content: '', expiryDate: '', image: '' });

    useEffect(() => {
        setLoading(true);
        getAnnouncements()
            .then(res => setAnnouncements(res.data || []))
            .catch(err => setError('Không thể tải thông báo: ' + err.message))
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const newAnnouncement = await createAnnouncement(form);
            setAnnouncements([...announcements, newAnnouncement.data]);
            setForm({ title: '', content: '', expiryDate: '', image: '' });
            alert('Đăng thông báo thành công!');
        } catch (err) {
            setError('Không thể đăng thông báo: ' + err.message);
        }
    };

    if (loading) return <div className="text-center p-4">Đang tải...</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="container mx-auto p-4"
        >
            <h1 className="text-3xl font-bold mb-6 text-blue-600">Quản lý thông báo</h1>
            {error && (
                <div className="text-center p-4 text-red-500">
                    {error}
                </div>
            )}
            {/* Form đăng thông báo */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Đăng thông báo mới</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-2">Tiêu đề</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="p-2 border rounded w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Nội dung</label>
                        <textarea
                            value={form.content}
                            onChange={(e) => setForm({ ...form, content: e.target.value })}
                            className="p-2 border rounded w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Ngày hết hạn</label>
                        <input
                            type="date"
                            value={form.expiryDate}
                            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                            className="p-2 border rounded w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Hình ảnh (URL)</label>
                        <input
                            type="text"
                            value={form.image}
                            onChange={(e) => setForm({ ...form, image: e.target.value })}
                            className="p-2 border rounded w-full"
                        />
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition w-full"
                    >
                        Đăng thông báo
                    </motion.button>
                </form>
            </div>
            {/* Danh sách thông báo */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">Danh sách thông báo</h2>
                <div className="space-y-4">
                    {announcements.length > 0 ? (
                        announcements.map(announcement => (
                            <div key={announcement._id} className="bg-white shadow-md rounded-lg p-4">
                                <h3 className="text-xl font-semibold">{announcement.title}</h3>
                                <p>{announcement.content}</p>
                                <p className="text-sm text-gray-500">Hết hạn: {announcement.expiryDate ? new Date(announcement.expiryDate).toLocaleDateString() : 'Không có'}</p>
                                {announcement.image && <img src={announcement.image} alt={announcement.title} className="w-full h-48 object-cover mt-2 rounded" />}
                            </div>
                        ))
                    ) : (
                        <p>Không có thông báo nào.</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default AdminAnnouncements;