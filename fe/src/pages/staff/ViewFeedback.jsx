// filepath: d:\course\PTTKHTTT\PTTK\fe\src\pages\staff\ViewFeedback.jsx
import React, { useState, useEffect } from "react";

const API_URL = "https://mmncb6j3-5000.asse.devtunnels.ms/api"; // Thay IP nếu cần

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return "-";
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return dateTimeString;
    return date.toLocaleString("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch (e) {
    return dateTimeString;
  }
};

const formatFeedbackStatus = (status) => {
  switch (status) {
    case "Mới":
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          Mới
        </span>
      );
    case "Đã_xem":
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Đã xem
        </span>
      );
    case "Đã_trả_lời":
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Đã trả lời
        </span>
      );
    default:
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
          {status?.replace("_", " ") || "Không xác định"}
        </span>
      );
  }
};

function ViewFeedback() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [statusFilter, setStatusFilter] = useState("Tất_cả");
  const [searchTerm, setSearchTerm] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);
    setMessage("");
    fetch(`${API_URL}/phan-hoi-cu-dan`)
      .then((res) => {
        if (!res.ok) {
          return res
            .json()
            .then((errData) => {
              throw new Error(errData.error || `Lỗi ${res.status}`);
            })
            .catch(() => {
              throw new Error(`Lỗi ${res.status}`);
            });
        }
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return res.json();
        } else {
          return res.text().then((text) => {
            throw new Error(
              "Phản hồi từ API không phải JSON: " + text.substring(0, 100)
            );
          });
        }
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setFeedbackList(data);
        } else {
          throw new Error("Định dạng dữ liệu không hợp lệ từ API.");
        }
      })
      .catch((err) => {
        setError(
          `Không thể tải danh sách phản hồi: ${
            err.message || "Lỗi không xác định"
          }`
        );
        setFeedbackList([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateStatus = async (feedbackId) => {
    if (!updateStatus) {
      setMessage("Vui lòng chọn trạng thái mới.");
      return;
    }
    setIsUpdating(true);
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/phan-hoi-cu-dan/${feedbackId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trang_thai: updateStatus }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Lỗi ${response.status}`);
      }
      setFeedbackList((prevList) =>
        prevList.map((fb) =>
          fb.id_phan_hoi === feedbackId
            ? { ...fb, trang_thai: updateStatus }
            : fb
        )
      );
      setMessage(`Cập nhật trạng thái phản hồi #${feedbackId} thành công!`);
      setSelectedFeedback(null);
    } catch (err) {
      setMessage(`Cập nhật thất bại: ${err.message || "Lỗi không xác định"}`);
    } finally {
      setIsUpdating(false);
      setUpdateStatus("");
    }
  };

  // Thống kê nhanh
  const total = feedbackList.length;
  const newfb = feedbackList.filter((fb) => fb.trang_thai === "Mới").length;
  const done = feedbackList.filter(
    (fb) => fb.trang_thai === "Đã_trả_lời"
  ).length;

  const filteredFeedback = feedbackList.filter((fb) => {
    if (statusFilter !== "Tất_cả" && fb.trang_thai !== statusFilter)
      return false;
    if (searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase();
      return (
        fb.tieu_de?.toLowerCase().includes(searchLower) ||
        fb.noi_dung?.toLowerCase().includes(searchLower) ||
        fb.ten_cu_dan?.toLowerCase().includes(searchLower) ||
        fb.id_phan_hoi?.toString().includes(searchLower)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
        <span className="ml-3 text-lg">Đang tải danh sách phản hồi...</span>
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

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Xem Phản hồi Cư dân
        </h1>
        <p className="text-gray-600 mt-1">
          Quản lý và xử lý các phản hồi, góp ý từ cư dân
        </p>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-rose-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Tổng phản hồi</div>
          <div className="text-2xl font-semibold text-rose-700">{total}</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Mới</div>
          <div className="text-2xl font-semibold text-blue-700">{newfb}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Đã trả lời</div>
          <div className="text-2xl font-semibold text-green-700">{done}</div>
        </div>
      </div>

      {/* Thông báo */}
      {message && (
        <div
          className={`p-4 rounded-md ${
            message.includes("thất bại") || message.includes("Lỗi")
              ? "bg-red-50 border-l-4 border-red-500"
              : "bg-green-50 border-l-4 border-green-500"
          }`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              {message.includes("thất bại") || message.includes("Lỗi") ? (
                <svg
                  className="h-5 w-5 text-red-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-green-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p
                className={`text-sm ${
                  message.includes("thất bại") || message.includes("Lỗi")
                    ? "text-red-700"
                    : "text-green-700"
                }`}
              >
                {message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bộ lọc và tìm kiếm */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="statusFilter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Lọc theo trạng thái:
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
            >
              <option value="Tất_cả">Tất cả trạng thái</option>
              <option value="Mới">Mới</option>
              <option value="Đã_xem">Đã xem</option>
              <option value="Đã_xử_lý">Đã trả lời</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="searchTerm"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tìm kiếm:
            </label>
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
                id="searchTerm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tiêu đề, nội dung, tên cư dân..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách phản hồi */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">Danh sách phản hồi</h2>
        </div>
        {filteredFeedback.length === 0 ? (
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Không có phản hồi nào
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc."
                : "Chưa có phản hồi nào từ cư dân."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Cư dân
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tiêu đề
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Ngày gửi
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Trạng thái
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFeedback.map((fb) => (
                  <tr key={fb.id_phan_hoi} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{fb.id_phan_hoi}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {fb.ten_cu_dan || `ID: ${fb.id_cu_dan}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate">{fb.tieu_de}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(fb.ngay_gui)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFeedbackStatus(fb.trang_thai)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => setSelectedFeedback(fb)}
                        className="text-rose-600 hover:text-rose-900 hover:underline focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1 rounded px-3 py-1"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal chi tiết phản hồi */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
              <h2 className="text-lg font-semibold text-gray-800">
                Phản hồi #{selectedFeedback.id_phan_hoi}
              </h2>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {/* Body */}
            <div className="p-6">
              {/* Chi tiết phản hồi */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Trạng thái</p>
                    <div className="mt-1">
                      {formatFeedbackStatus(selectedFeedback.trang_thai)}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mức độ ưu tiên</p>
                    <div className="mt-1">
                      {selectedFeedback.muc_do_uu_tien || "Không xác định"}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cư dân</p>
                  <p className="mt-1 font-medium">
                    {selectedFeedback.ten_cu_dan ||
                      `ID: ${selectedFeedback.id_cu_dan}`}
                  </p>
                  {selectedFeedback.email_cu_dan && (
                    <p className="text-sm text-gray-600">
                      Email: {selectedFeedback.email_cu_dan}
                    </p>
                  )}
                  {selectedFeedback.sdt_cu_dan && (
                    <p className="text-sm text-gray-600">
                      SĐT: {selectedFeedback.sdt_cu_dan}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tiêu đề</p>
                  <p className="mt-1 font-medium">{selectedFeedback.tieu_de}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nội dung phản hồi</p>
                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded">
                    {selectedFeedback.noi_dung || "(Không có nội dung)"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ngày gửi</p>
                  <p className="mt-1">
                    {formatDateTime(selectedFeedback.ngay_gui)}
                  </p>
                </div>
              </div>
              {/* Cập nhật trạng thái */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-700 mb-3">
                  Cập nhật trạng thái phản hồi
                </h3>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500 mb-3"
                >
                  <option value="">-- Chọn trạng thái mới --</option>
                  <option value="Đã_xem">Đã xem</option>
                  <option value="Đang_xử_lý">Đang xử lý</option>
                  <option value="Đã_xử_lý">Đã xử lý</option>
                </select>
                <button
                  onClick={() =>
                    handleUpdateStatus(selectedFeedback.id_phan_hoi)
                  }
                  disabled={isUpdating || !updateStatus}
                  className={`w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isUpdating || !updateStatus
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                  }`}
                >
                  {isUpdating ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Đang cập nhật...
                    </span>
                  ) : (
                    "Cập nhật trạng thái"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewFeedback;
