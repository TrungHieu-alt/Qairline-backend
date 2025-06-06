import { useState } from 'react';

function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-4 right-4">
            {isOpen ? (
                <div className="bg-white p-4 rounded-lg shadow-lg w-64">
                    <h3 className="font-bold text-green-600">Hỗ trợ khách hàng</h3>
                    <p className="text-sm">Chào bạn! Tôi có thể giúp gì cho bạn hôm nay?</p>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="mt-2 bg-green-500 text-white p-1 rounded hover:bg-green-600"
                    >
                        Đóng
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-green-500 text-white p-4 rounded-full hover:bg-green-600 transition"
                >
                    💬
                </button>
            )}
        </div>
    );
}

export default Chatbot;