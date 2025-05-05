// filepath: d:\course\PTTKHTTT\PTTK\fe\src\pages\staff\StaffDashboard.jsx
import React, { useContext } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function StaffDashboard() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const staffInfo = user || { ho_ten: "Nhân viên" };

  const handleLogout = () => {
    logout();
    navigate('/login/staff'); // Chuyển về trang login staff sau khi logout
  };

  const menuItems = [
    { path: '/staff/handle-requests', label: 'Xử lý yêu cầu Dịch vụ' },
    { path: '/staff/view-feedback', label: 'Xem phản hồi từ Cư dân' }, // Thêm dòng này
    { path: '/staff/create-service-bill', label: 'Tạo hóa đơn Dịch vụ' },
    { path: '/staff/create-maintenance-bill', label: 'Tạo hóa đơn Hàng tháng' },
    { path: '/staff/create-financial-report', label: 'Tạo báo cáo Tài chính' },
    { path: '/staff/send-notification', label: 'Gửi thông báo' },
  ];

  // ... (phần render JSX giữ nguyên, chỉ thay đổi mảng menuItems) ...
   return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4 flex flex-col">
        <h2 className="text-xl font-semibold mb-6">Nhân viên: {staffInfo.ho_ten}</h2>
        <nav className="flex-grow">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path} className="mb-2">
                <Link
                  to={item.path}
                  className={`block px-4 py-2 rounded hover:bg-green-100 ${
                    location.pathname.startsWith(item.path) ? 'bg-green-200 font-semibold' : ''
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button
          onClick={handleLogout}
          className="mt-auto w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
        >
          Đăng xuất
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-auto">
         {location.pathname === '/staff' || location.pathname === '/staff/' ? (
           <div className="bg-white p-6 rounded shadow">
             <h1 className="text-2xl font-bold">Trang Nhân viên</h1>
             <p className="mt-4">Vui lòng chọn một chức năng từ thanh điều hướng bên trái.</p>
           </div>
        ) : (
          <Outlet /> // Render các component con tại đây
        )}
      </main>
    </div>
  );
}

export default StaffDashboard;