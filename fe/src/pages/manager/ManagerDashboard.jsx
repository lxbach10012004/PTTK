import React, { useContext } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function ManagerDashboard() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const managerInfo = user || { ho_ten: "Quản lý" };

  const handleLogout = () => {
    logout();
    navigate('/login/manager');
  };

  // Cập nhật menuItems
  const menuItems = [
    { path: '/manager/create-request', label: 'Tạo Yêu cầu Nội bộ' }, // Thêm dòng này
    { path: '/manager/view-reports', label: 'Xem Báo cáo' },
    { path: '/manager/manage-staff', label: 'Quản lý Nhân viên' },
    { path: '/manager/manage-residents', label: 'Quản lý Cư dân' },
    { path: '/manager/manage-contracts', label: 'Quản lý Hợp đồng' },
    { path: '/manager/manage-apartments', label: 'Quản lý Căn hộ' },
    { path: '/manager/manage-services', label: 'Quản lý Dịch vụ' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4 flex flex-col">
        <h2 className="text-xl font-semibold mb-6">Quản lý: {managerInfo.ho_ten}</h2>
        <nav className="flex-grow">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path} className="mb-2">
                <Link
                  to={item.path}
                  className={`block px-4 py-2 rounded hover:bg-purple-100 ${ // Đổi màu hover cho quản lý
                    location.pathname.startsWith(item.path) ? 'bg-purple-200 font-semibold' : ''
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
         {location.pathname === '/manager' || location.pathname === '/manager/' ? (
           <div className="bg-white p-6 rounded shadow">
             <h1 className="text-2xl font-bold">Trang Quản lý Tòa nhà</h1>
             <p className="mt-4">Vui lòng chọn một chức năng từ thanh điều hướng bên trái.</p>
           </div>
        ) : (
          <Outlet /> // Render các component con tại đây
        )}
      </main>
    </div>
  );
}

export default ManagerDashboard;