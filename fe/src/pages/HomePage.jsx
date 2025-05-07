import React, { useState } from "react";
import { Link } from "react-router-dom";
// Import logo từ assets folder một cách chính xác
import logo from "../assets/uet_logo.svg";

const HomePage = () => {
  return (
    <div className="py-10 min-h-screen">
      {/* Logo và Header */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center">
          <img
            src={logo}
            alt="Chung cư Logo"
            className="h-20 w-20 mr-4"
          />
          <h2 className="text-3xl font-bold text-blue-700">
            Hệ thống Quản lý Chung cư
          </h2>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-xl shadow-lg p-8 mb-10 mx-4 lg:mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">
            Chào mừng đến với Hệ thống Quản lý Chung cư
          </h1>
          <p className="text-xl mb-8">
            Hệ thống hiện đại giúp quản lý, giám sát và tối ưu hóa mọi hoạt động
            trong khu chung cư
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/login/resident"
              className="w-full sm:w-auto px-6 py-3 bg-white text-blue-700 font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" clipRule="evenodd" />
              </svg>
              Đăng nhập dành cho cư dân
            </Link>
            <Link
              to="/login/staff"
              className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" clipRule="evenodd" />
              </svg>
              Đăng nhập dành cho nhân viên
            </Link>
            <Link
              to="/login/manager"
              className="w-full sm:w-auto px-6 py-3 bg-blue-700 text-white font-medium rounded-lg border border-white hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
              </svg>
              Đăng nhập dành cho quản lý
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Các tính năng chính
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Quản lý căn hộ</h3>
            <p className="text-gray-600">
              Theo dõi và quản lý tất cả thông tin về căn hộ, người thuê và chủ
              sở hữu.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-green-100 text-green-700 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Quản lý yêu cầu</h3>
            <p className="text-gray-600">
              Tiếp nhận, theo dõi và xử lý các yêu cầu từ cư dân nhanh chóng và
              hiệu quả.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Quản lý hóa đơn</h3>
            <p className="text-gray-600">
              Tạo, gửi và theo dõi các hóa đơn dịch vụ, phí quản lý và các chi
              phí khác.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-gray-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Lợi ích khi sử dụng hệ thống
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold mb-2">
                  Tăng hiệu quả quản lý
                </h3>
                <p className="text-gray-600">
                  Hệ thống giúp tiết kiệm thời gian và nguồn lực quản lý thông
                  qua các quy trình tự động hóa.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold mb-2">
                  Cải thiện trải nghiệm cư dân
                </h3>
                <p className="text-gray-600">
                  Cư dân dễ dàng gửi yêu cầu, theo dõi thông báo và quản lý hóa
                  đơn trực tuyến.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold mb-2">Báo cáo chi tiết</h3>
                <p className="text-gray-600">
                  Dễ dàng tạo và phân tích các báo cáo về tài chính, hoạt động
                  và hiệu suất.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold mb-2">Tính bảo mật cao</h3>
                <p className="text-gray-600">
                  Dữ liệu được bảo vệ an toàn với hệ thống xác thực và phân
                  quyền chi tiết.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-5xl mx-auto text-center py-16 px-4">
        <h2 className="text-3xl font-bold mb-4">
          Bắt đầu sử dụng ngay hôm nay
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Hãy trải nghiệm nền tảng quản lý chung cư hiện đại và tiện lợi của
          chúng tôi
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
              to="/login/resident"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Đăng nhập ngay
          </Link>
          <a 
            href="#features" 
            className="px-6 py-3 bg-white text-blue-700 font-medium rounded-lg border border-blue-600 hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Tìm hiểu thêm
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 bg-gray-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="mb-2">© {new Date().getFullYear()} Hệ thống Quản lý Chung cư. Đã đăng ký bản quyền.</p>
          <p className="text-gray-400 text-sm">Được phát triển bởi Nhóm PTTK HTTT</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
