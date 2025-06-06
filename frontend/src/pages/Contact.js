import { motion } from 'framer-motion';
import { useState } from 'react';

function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Xử lý gửi form ở đây
        console.log('Form submitted:', formData);
        // Reset form
        setFormData({
            name: '',
            email: '',
            subject: '',
            message: ''
        });
    };

    const contactInfo = [
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
            ),
            title: "Điện thoại",
            content: "1900 xxxx",
            detail: "Thứ 2 - Chủ nhật: 7:00 - 22:00"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            title: "Email",
            content: "support@qairline.com",
            detail: "Phản hồi trong vòng 24 giờ"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            title: "Địa chỉ",
            content: "123 Đường ABC, Quận XYZ",
            detail: "Thành phố Hồ Chí Minh, Việt Nam"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Liên Hệ Với Chúng Tôi</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi 
                        qua các kênh bên dưới hoặc gửi tin nhắn trực tiếp.
                    </p>
                </motion.div>

                {/* Contact Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {contactInfo.map((info, index) => (
                        <motion.div
                            key={info.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 }}
                            className="bg-white rounded-lg shadow-lg p-8 text-center"
                        >
                            <div className="text-green-600 mb-4 flex justify-center">
                                {info.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">{info.title}</h3>
                            <p className="text-green-600 font-medium mb-1">{info.content}</p>
                            <p className="text-gray-500 text-sm">{info.detail}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Contact Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8"
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Gửi tin nhắn cho chúng tôi</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Họ và tên</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">Tiêu đề</label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Nội dung</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows="5"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            ></textarea>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            className="w-full bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors"
                        >
                            Gửi tin nhắn
                        </motion.button>
                    </form>
                </motion.div>

                {/* Map */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-16 h-96 bg-gray-200 rounded-lg overflow-hidden"
                >
                    {/* Thêm Google Map hoặc bản đồ khác ở đây */}
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                        Bản đồ sẽ được hiển thị ở đây
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default Contact; 