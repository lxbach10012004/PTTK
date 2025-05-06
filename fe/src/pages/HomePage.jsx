import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="py-10">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-xl shadow-lg p-8 mb-10">
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
              className="px-6 py-3 bg-white text-blue-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Đăng nhập dành cho cư dân
            </Link>
            <Link
              to="/login/staff"
              className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              Đăng nhập dành cho nhân viên
            </Link>
            <Link
              to="/login/manager"
              className="px-6 py-3 bg-blue-700 text-white font-medium rounded-lg border border-white hover:bg-blue-600 transition-colors"
            >
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
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Đăng nhập ngay
          </Link>
          <button className="px-6 py-3 bg-white text-blue-700 font-medium rounded-lg border border-blue-600 hover:bg-gray-50 transition-colors">
            Tìm hiểu thêm
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
