import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import Flights from './pages/Flights';
import FlightDetails from './pages/FlightDetails';
import Booking from './pages/Booking';
import Tickets from './pages/Tickets';
import Promotions from './pages/Promotions';
import Login from './pages/Login';
import Register from './pages/Register';
import Destination from './pages/Destination';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import Services from './pages/Services';
import FAQ from './pages/FAQ';
import AdminDashboard from './pages/admin/Dashboard';
import AdminAnnouncements from './pages/admin/Announcements';
import AdminAircrafts from './pages/admin/Aircrafts';
import AdminFlights from './pages/admin/Flights';
import AdminTickets from './pages/admin/Tickets';

// Danh sách điểm đến phổ biến
const popularDestinations = [
    {
        name: "Hà Nội",
        image: "https://i.pinimg.com/736x/c7/77/29/c777299bd23ed0f3b6eec4bc24a26ac6.jpg",
        description: "Hà Nội, thủ đô của Việt Nam, nổi tiếng với kiến trúc ngàn năm và văn hóa phong phú. Hãy khám phá Hồ Hoàn Kiếm, Văn Miếu, và các món ăn đường phố hấp dẫn như phở và bún chả.",
        galleryImages: [
            "https://hoanghamobile.com/tin-tuc/wp-content/uploads/2024/04/anh-ha-noi.jpg",
            "https://media.istockphoto.com/id/160179168/vi/anh/c%E1%BA%A3nh-quan-th%C3%A0nh-ph%E1%BB%91-h%C3%A0-n%E1%BB%99i.jpg?b=1&s=612x612&w=0&k=20&c=fLJ5CRj_3RrxcjmrMF3EHCqDzBySf0o_DZ8yKQ6GWeE=",
            "https://media.istockphoto.com/id/478073811/vi/anh/l%E1%BB%91i-v%C3%A0o-%C4%91%E1%BA%B9p-t%E1%BA%A1i-v%C4%83n-mi%E1%BA%BFu-qu%E1%BB%91c-t%E1%BB%AD-gi%C3%A1m.jpg?s=612x612&w=0&k=20&c=FXgEWvQQLlDi9iP8tacv4_QbnjyaAGWlT2Pij_awKTc="
        ]
    },
    {
        name: "TP. Hồ Chí Minh",
        image: "https://images.unsplash.com/photo-1590004987778-bece5c9adab6",
        description: "TP. Hồ Chí Minh là trung tâm kinh tế sôi động của Việt Nam, với các địa danh nổi tiếng như Dinh Độc Lập, Nhà thờ Đức Bà, và chợ Bến Thành. Đừng bỏ lỡ cơ hội thưởng thức cà phê Sài Gòn!",
        galleryImages: [
            "https://images.unsplash.com/photo-1590004987778-bece5c9adab6",
            "https://images.unsplash.com/photo-1590004987778-bece5c9adab7",
            "https://images.unsplash.com/photo-1590004987778-bece5c9adab8"
        ]
    },
    {
        name: "Đà Nẵng",
        image: "https://images.unsplash.com/photo-1559592417-7d9f9c8d7485",
        description: "Đà Nẵng là thành phố biển xinh đẹp với cầu Rồng, bãi biển Mỹ Khê, và Bà Nà Hills. Đây là điểm đến lý tưởng cho những ai yêu thích thiên nhiên và văn hóa.",
        galleryImages: [
            "https://images.unsplash.com/photo-1559592417-7d9f9c8d7485",
            "https://images.unsplash.com/photo-1559592417-7d9f9c8d7486",
            "https://images.unsplash.com/photo-1559592417-7d9f9c8d7487"
        ]
    },
    {
        name: "Nha Trang",
        image: "https://images.unsplash.com/photo-1591019533368-1e39a1a9d1f7",
        description: "Nha Trang nổi tiếng với những bãi biển xanh ngọc và các hoạt động lặn biển. Đừng bỏ lỡ cơ hội khám phá Vinpearl Land và các hòn đảo tuyệt đẹp.",
        galleryImages: [
            "https://images.unsplash.com/photo-1591019533368-1e39a1a9d1f7",
            "https://images.unsplash.com/photo-1591019533368-1e39a1a9d1f8",
            "https://images.unsplash.com/photo-1591019533368-1e39a1a9d1f9"
        ]
    },
    {
        name: "Đà Lạt",
        image: "https://images.unsplash.com/photo-1591019533328-9e5e5d7d5f5d",
        description: "Đà Lạt, thành phố ngàn hoa, thu hút du khách với khí hậu mát mẻ, hồ Xuân Hương, thung lũng Tình Yêu, và các đồi chè xanh mướt.",
        galleryImages: [
            "https://images.unsplash.com/photo-1591019533328-9e5e5d7d5f5d",
            "https://images.unsplash.com/photo-1591019533328-9e5e5d7d5f5e",
            "https://images.unsplash.com/photo-1591019533328-9e5e5d7d5f5f"
        ]
    },
    {
        name: "Quy Nhơn",
        image: "https://images.unsplash.com/photo-1591019533392-9e5e5d7d5f5f",
        description: "Quy Nhơn là một điểm đến yên bình với bãi biển Kỳ Co, Eo Gió, và các làng chài truyền thống. Đây là nơi lý tưởng để thư giãn và tận hưởng thiên nhiên.",
        galleryImages: [
            "https://images.unsplash.com/photo-1591019533392-9e5e5d7d5f5f",
            "https://images.unsplash.com/photo-1591019533392-9e5e5d7d5f60",
            "https://images.unsplash.com/photo-1591019533392-9e5e5d7d5f61"
        ]
    },
    {
        name: "Phú Quốc",
        image: "https://images.unsplash.com/photo-1591019533432-9e5e5d7d5f5f",
        description: "Phú Quốc, hòn đảo ngọc của Việt Nam, nổi tiếng với bãi Sao, làng chài Hàm Ninh, và các khu nghỉ dưỡng sang trọng. Đây là thiên đường cho kỳ nghỉ biển.",
        galleryImages: [
            "https://images.unsplash.com/photo-1591019533432-9e5e5d7d5f5f",
            "https://images.unsplash.com/photo-1591019533432-9e5e5d7d5f60",
            "https://images.unsplash.com/photo-1591019533432-9e5e5d7d5f61"
        ]
    },
    {
        name: "Hải Phòng",
        image: "https://images.unsplash.com/photo-1591019533442-9e5e5d7d5f5f",
        description: "Hải Phòng, thành phố cảng sôi động, là cửa ngõ ra vịnh Hạ Long. Du khách có thể khám phá đảo Cát Bà, bãi biển Đồ Sơn, và các món hải sản tươi ngon.",
        galleryImages: [
            "https://images.unsplash.com/photo-1591019533442-9e5e5d7d5f5f",
            "https://images.unsplash.com/photo-1591019533442-9e5e5d7d5f60",
            "https://images.unsplash.com/photo-1591019533442-9e5e5d7d5f61"
        ]
    }
];

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Các trang không cần layout (login, register) */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Giao diện khách hàng */}
                    <Route element={<UserLayout />}>
                        <Route path="/" element={<Home destinations={popularDestinations} />} />
                        <Route path="/flights" element={<Flights />} />
                        <Route path="/flight/:flightId" element={<FlightDetails />} />
                        <Route path="/booking/:flightId" element={<Booking />} />
                        <Route path="/tickets" element={<Tickets />} />
                        <Route path="/promotions" element={<Promotions />} />
                        <Route path="/destination/:name" element={<Destination destinations={popularDestinations} />} />
                        <Route path="/about" element={<AboutUs />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/faq" element={<FAQ />} />
                    </Route>

                    {/* Giao diện quản trị */}
                    <Route element={<AdminLayout />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
                        <Route path="/admin/aircrafts" element={<AdminAircrafts />} />
                        <Route path="/admin/flights" element={<AdminFlights />} />
                        <Route path="/admin/tickets" element={<AdminTickets />} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;