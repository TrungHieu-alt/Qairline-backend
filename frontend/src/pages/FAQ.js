import { motion } from 'framer-motion';
import { useState } from 'react';

function FAQ() {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            category: "Đặt vé",
            questions: [
                {
                    question: "Làm thế nào để đặt vé máy bay?",
                    answer: "Bạn có thể đặt vé trực tuyến thông qua website của chúng tôi, ứng dụng di động hoặc liên hệ tổng đài 1900 xxxx để được hỗ trợ."
                },
                {
                    question: "Tôi có thể thay đổi ngày bay sau khi đặt vé không?",
                    answer: "Có, bạn có thể thay đổi ngày bay trước 24 giờ so với giờ khởi hành. Phí thay đổi sẽ được áp dụng tùy theo hạng vé."
                },
                {
                    question: "Chính sách hoàn vé như thế nào?",
                    answer: "Vé có thể được hoàn trả tùy theo điều kiện của từng hạng vé. Vui lòng kiểm tra điều kiện vé khi đặt chỗ."
                }
            ]
        },
        {
            category: "Hành lý",
            questions: [
                {
                    question: "Hành lý xách tay được mang bao nhiêu kg?",
                    answer: "Hành khách được phép mang 7kg hành lý xách tay cho hạng phổ thông và 12kg cho hạng thương gia."
                },
                {
                    question: "Làm sao để mua thêm hành lý ký gửi?",
                    answer: "Bạn có thể mua thêm hành lý ký gửi khi đặt vé hoặc sau khi đặt vé thông qua website hoặc tổng đài."
                }
            ]
        },
        {
            category: "Check-in",
            questions: [
                {
                    question: "Khi nào tôi có thể check-in online?",
                    answer: "Check-in online mở từ 24 giờ đến 1 giờ trước giờ khởi hành."
                },
                {
                    question: "Tôi cần có mặt tại sân bay trước bao lâu?",
                    answer: "Đối với chuyến bay nội địa, bạn nên có mặt trước 2 giờ. Với chuyến bay quốc tế, nên có mặt trước 3 giờ."
                }
            ]
        },
        {
            category: "Dịch vụ đặc biệt",
            questions: [
                {
                    question: "Làm thế nào để đặt suất ăn đặc biệt?",
                    answer: "Bạn có thể đặt suất ăn đặc biệt khi đặt vé hoặc ít nhất 24 giờ trước chuyến bay."
                },
                {
                    question: "Có dịch vụ hỗ trợ đặc biệt cho người khuyết tật không?",
                    answer: "Có, chúng tôi cung cấp dịch vụ hỗ trợ đặc biệt. Vui lòng thông báo trước ít nhất 48 giờ."
                }
            ]
        }
    ];

    const handleToggle = (categoryIndex, questionIndex) => {
        const index = `${categoryIndex}-${questionIndex}`;
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Câu Hỏi Thường Gặp</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Tìm câu trả lời nhanh cho những thắc mắc phổ biến về dịch vụ của QAirline
                    </p>
                </motion.div>

                {/* FAQ Categories */}
                <div className="space-y-8">
                    {faqs.map((category, categoryIndex) => (
                        <motion.div
                            key={category.category}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: categoryIndex * 0.2 }}
                            className="bg-white rounded-lg shadow-lg overflow-hidden"
                        >
                            <h2 className="text-xl font-bold text-white bg-green-600 p-4">
                                {category.category}
                            </h2>
                            <div className="p-4 space-y-4">
                                {category.questions.map((faq, questionIndex) => (
                                    <div key={questionIndex} className="border-b border-gray-200 last:border-0">
                                        <button
                                            onClick={() => handleToggle(categoryIndex, questionIndex)}
                                            className="w-full text-left py-4 focus:outline-none"
                                        >
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-lg font-semibold text-gray-800">
                                                    {faq.question}
                                                </h3>
                                                <svg
                                                    className={`w-6 h-6 text-green-600 transform transition-transform ${
                                                        openIndex === `${categoryIndex}-${questionIndex}` ? 'rotate-180' : ''
                                                    }`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            </div>
                                            <motion.div
                                                initial={false}
                                                animate={{
                                                    height: openIndex === `${categoryIndex}-${questionIndex}` ? 'auto' : 0,
                                                    opacity: openIndex === `${categoryIndex}-${questionIndex}` ? 1 : 0
                                                }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <p className="text-gray-600 mt-2">
                                                    {faq.answer}
                                                </p>
                                            </motion.div>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Contact Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-16 text-center"
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Không tìm thấy câu trả lời bạn cần?
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Liên hệ với chúng tôi để được hỗ trợ trực tiếp
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.location.href = '/contact'}
                        className="bg-green-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                        Liên hệ hỗ trợ
                    </motion.button>
                </motion.div>
            </div>
        </div>
    );
}

export default FAQ; 