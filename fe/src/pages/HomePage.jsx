import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6">Hệ thống Quản lý Chung cư</h1>
        <p className="mb-8 text-gray-600">Vui lòng chọn vai trò của bạn để đăng nhập:</p>
        <div className="space-y-4">
          <Link
            to="/login/resident" // Sẽ tạo trang login riêng cho cư dân sau
            className="block w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
          >
            Cư dân
          </Link>
          <Link
            to="/login/staff" // Sẽ tạo trang login riêng cho nhân viên sau
            className="block w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-200"
          >
            Nhân viên
          </Link>
          <Link
            to="/login/manager" // Sẽ tạo trang login riêng cho quản lý sau
            className="block w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 transition duration-200"
          >
            Quản lý
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage;