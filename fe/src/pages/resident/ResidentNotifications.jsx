// filepath: d:\course\PTTKHTTT\PTTK\fe\src\pages\resident\ResidentNotifications.jsx
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const API_URL = "http://172.21.92.186:5000/api"; // Thay IP nếu cần

// Hàm định dạng ngày giờ
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return "-";
  try {
    const date = new Date(dateTimeString);
    return date.toLocaleString("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch (e) {
    return dateTimeString;
  }
};

// Hàm định dạng loại thông báo
const formatNotificationType = (type) => {
  switch (type) {
    case "Khẩn_cấp":
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Khẩn cấp
        </span>
      );
    case "Bảo_trì":
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Bảo trì
        </span>
      );
    case "Thông_báo_chung":
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          Thông báo chung
        </span>
      );
    case "Thanh_toán":
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Thanh toán
        </span>
      );
    default:
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
          {type || "Khác"}
        </span>
      );
  }
};

function ResidentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext); // Lấy thông tin người dùng
  const [filterType, setFilterType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [readStatus, setReadStatus] = useState({});

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Comment đoạn này khi cần bỏ qua kiểm tra đăng nhập
    /* if (!user || !user.id_nguoi_dung) {
      setLoading(false);
      return;
    } */

    fetch(`${API_URL}/thong-bao`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        // Sắp xếp theo thời gian giảm dần (mới nhất lên đầu)
        const sortedData = data.sort(
          (a, b) =>
            new Date(b.ngay_gui || "1970-01-01") -
            new Date(a.ngay_gui || "1970-01-01")
        );
        setNotifications(sortedData);
      })
      .catch((err) => {
        console.error("Lỗi fetch thông báo:", err);
        setError("Không thể tải danh sách thông báo.");
        setNotifications([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  // Lọc thông báo theo loại và theo từ khóa tìm kiếm
  const filteredNotifications = notifications.filter((notification) => {
    const typeMatch = filterType
      ? notification.loai_thong_bao === filterType
      : true;
    const searchMatch =
      searchTerm.trim() === "" ||
      (notification.tieu_de &&
        notification.tieu_de
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (notification.noi_dung &&
        notification.noi_dung.toLowerCase().includes(searchTerm.toLowerCase()));

    return typeMatch && searchMatch;
  });

  // Lấy các loại thông báo để hiển thị trong dropdown
  const notificationTypes = [
    ...new Set(notifications.map((notif) => notif.loai_thong_bao)),
  ].filter(Boolean);

  // Xử lý đánh dấu đã đọc thông báo
  const markAsRead = (id) => {
    setReadStatus((prev) => ({
      ...prev,
      [id]: true,
    }));
    // Thực tế có thể gọi API để cập nhật trạng thái đã đọc
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">Đang tải thông báo...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Comment phần kiểm tra này khi test không cần đăng nhập
  /* if (!user) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">Vui lòng đăng nhập để xem thông báo.</p>
          </div>
        </div>
      </div>
    );
  } */

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-800">Thông báo</h1>
          <p className="text-gray-600 text-sm mt-1">
            Xem các thông báo và cập nhật từ ban quản lý
          </p>
        </div>

        {/* Thống kê nhanh */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Tổng thông báo</div>
              <div className="text-2xl font-semibold text-blue-700">
                {notifications.length}
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Thông báo khẩn</div>
              <div className="text-2xl font-semibold text-red-700">
                {
                  notifications.filter(
                    (notif) => notif.loai_thong_bao === "Khẩn_cấp"
                  ).length
                }
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Chưa đọc</div>
              <div className="text-2xl font-semibold text-yellow-700">
                {
                  notifications.filter(
                    (notif) => !readStatus[notif.id_thong_bao]
                  ).length
                }
              </div>
            </div>
          </div>
        </div>

        {/* Bộ lọc và tìm kiếm */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Tìm kiếm thông báo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Tất cả thông báo</option>
                {notificationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type?.replace(/_/g, " ") || "Khác"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Danh sách thông báo */}
        <div className="divide-y divide-gray-200">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Không có thông báo nào
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterType
                  ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
                  : "Bạn chưa có thông báo nào."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((noti) => (
              <div
                key={noti.id_thong_bao}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  readStatus[noti.id_thong_bao] ? "opacity-75" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      {formatNotificationType(noti.loai_thong_bao)}
                      <span className="ml-2 text-xs text-gray-500">
                        {formatDateTime(noti.ngay_gui)}
                      </span>
                    </div>
                    <h2 className="text-lg font-medium text-gray-900">
                      {noti.tieu_de}
                    </h2>
                    <p className="mt-1 text-gray-600">{noti.noi_dung}</p>
                  </div>
                  {!readStatus[noti.id_thong_bao] && (
                    <div className="ml-4">
                      <span className="inline-block w-3 h-3 bg-blue-500 rounded-full"></span>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => markAsRead(noti.id_thong_bao)}
                    className={`text-sm text-blue-600 hover:text-blue-800 ${
                      readStatus[noti.id_thong_bao] ? "hidden" : ""
                    }`}
                  >
                    Đánh dấu đã đọc
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ResidentNotifications;
