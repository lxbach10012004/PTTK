// filepath: d:\course\PTTKHTTT\PTTK\fe\src\pages\resident\ResidentDashboard.jsx
import React, { useContext } from 'react'; // Thêm useContext
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext

function ResidentDashboard() {
  const { user, logout } = useContext(AuthContext); // Lấy user và logout từ context
  const location = useLocation();

  // Lấy thông tin cư dân từ user trong context
  const residentInfo = user || { ho_ten: "Cư dân" }; // Fallback nếu user chưa load

  const handleLogout = () => {
    logout(); // Gọi hàm logout từ context
  };

  const menuItems = [
    { path: '/resident/services', label: 'Yêu cầu dịch vụ' },
    { path: '/resident/requests', label: 'Xem yêu cầu' },
    { path: '/resident/bills', label: 'Xem hóa đơn' },
    { path: '/resident/information', label: 'Thông tin cá nhân' },
    { path: '/resident/notifications', label: 'Xem thông báo' },
    { path: '/resident/feedback', label: 'Gửi phản hồi' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4 flex flex-col">
        <h2 className="text-xl font-semibold mb-6">Xin chào, {residentInfo.ho_ten}</h2>
        <nav className="flex-grow">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path} className="mb-2">
                <Link
                  to={item.path}
                  className={`block px-4 py-2 rounded hover:bg-blue-100 ${
                    location.pathname.startsWith(item.path) ? 'bg-blue-200 font-semibold' : ''
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {/* Nút Đăng xuất */}
        <button
          onClick={handleLogout} // Thêm onClick
          className="mt-auto w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
        >
          Đăng xuất
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-auto">
        {location.pathname === '/resident' || location.pathname === '/resident/' ? (
           <div className="bg-white p-6 rounded shadow">
             <h1 className="text-2xl font-bold">Chào mừng đến với Hệ thống Quản lý Căn hộ</h1>
             <p className="mt-4">Vui lòng chọn một chức năng từ thanh điều hướng bên trái.</p>
           </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}

export default ResidentDashboard;