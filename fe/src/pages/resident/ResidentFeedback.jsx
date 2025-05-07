// filepath: d:\course\PTTKHTTT\PTTK\fe\src\pages\resident\ResidentFeedback.jsx
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const API_URL = 'https://mmncb6j3-5000.asse.devtunnels.ms/api'; // Thay IP nếu cần

// Hàm định dạng trạng thái
const formatStatus = (status) => {
  switch (status) {
    case "Mới":
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          Mới
        </span>
      );
    case "Đang_xử_lý":
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Đang xử lý
        </span>
      );
    case "Đã_trả_lời":
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Đã trả lời
        </span>
      );
    case "Đã_đóng":
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
          Đã đóng
        </span>
      );
    default:
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
          {status}
        </span>
      );
  }
};

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

function ResidentFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    tieu_de: "",
    noi_dung: "",
    loai_phan_hoi: "Góp_ý",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { user } = useContext(AuthContext);

  // Lấy danh sách phản hồi khi component được tải
  useEffect(() => {
    if (user && user.id_nguoi_dung) {
      fetchFeedback();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_URL}/phan-hoi?id_cu_dan=${user.id_nguoi_dung}`
      );
      if (!response.ok) {
        throw new Error("Không thể kết nối đến máy chủ");
      }
      const data = await response.json();
      setFeedbacks(data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách phản hồi:", err);
      setError("Không thể tải danh sách phản hồi. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Lọc phản hồi theo từ khóa và trạng thái
  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const statusMatch = filterStatus
      ? feedback.trang_thai === filterStatus
      : true;
    const searchMatch =
      searchTerm.trim() === "" ||
      (feedback.tieu_de &&
        feedback.tieu_de.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (feedback.noi_dung &&
        feedback.noi_dung.toLowerCase().includes(searchTerm.toLowerCase()));
    return statusMatch && searchMatch;
  });

  // Xử lý thay đổi form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Gửi phản hồi mới
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tieu_de || !formData.noi_dung) {
      setError("Vui lòng điền đầy đủ tiêu đề và nội dung.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/phan-hoi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          id_cu_dan: user.id_nguoi_dung,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể gửi phản hồi");
      }

      // Reset form và hiển thị thông báo thành công
      setFormData({
        tieu_de: "",
        noi_dung: "",
        loai_phan_hoi: "Góp_ý",
      });
      setShowForm(false);
      setSubmitSuccess(true);
      // Tải lại danh sách phản hồi
      fetchFeedback();

      // Ẩn thông báo thành công sau 3 giây
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Lỗi khi gửi phản hồi:", err);
      setError(err.message || "Không thể gửi phản hồi. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  // Hiển thị khi đang tải
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Thông báo lỗi */}
      {error && (
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
      )}

      {/* Thông báo thành công */}
      {submitSuccess && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
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
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Phản hồi của bạn đã được gửi thành công!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Card chính */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Tiêu đề và nút tạo phản hồi */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                Phản hồi & Góp ý
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Gửi phản hồi, góp ý hoặc khiếu nại của bạn tới ban quản lý
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="mt-2 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
            >
              {showForm ? "Đóng" : "Tạo phản hồi mới"}
            </button>
          </div>
        </div>

        {/* Form tạo phản hồi mới */}
        {showForm && (
          <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="tieu_de"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="tieu_de"
                  name="tieu_de"
                  value={formData.tieu_de}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="loai_phan_hoi"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Loại phản hồi
                </label>
                <select
                  id="loai_phan_hoi"
                  name="loai_phan_hoi"
                  value={formData.loai_phan_hoi}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="Góp_ý">Góp ý</option>
                  <option value="Khiếu_nại">Khiếu nại</option>
                  <option value="Phản_ánh">Phản ánh sự cố</option>
                  <option value="Yêu_cầu">Yêu cầu khác</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="noi_dung"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nội dung <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="noi_dung"
                  name="noi_dung"
                  rows="4"
                  value={formData.noi_dung}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                ></textarea>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 rounded-md text-white transition-colors ${
                    submitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center">
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
                      Đang gửi...
                    </span>
                  ) : (
                    "Gửi phản hồi"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bộ lọc và tìm kiếm */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                placeholder="Tìm kiếm phản hồi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Mới">Mới</option>
                <option value="Đang_xử_lý">Đang xử lý</option>
                <option value="Đã_trả_lời">Đã trả lời</option>
                <option value="Đã_đóng">Đã đóng</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danh sách phản hồi */}
        {filteredFeedbacks.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Không có phản hồi nào
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus
                ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
                : "Bạn chưa gửi phản hồi nào."}
            </p>
            {!showForm && !searchTerm && !filterStatus && (
              <div className="mt-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg
                    className="-ml-1 mr-2 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Tạo phản hồi mới
                </button>
              </div>
            )}
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
                    Tiêu đề
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Loại
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
                    Chi tiết
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFeedbacks.map((feedback) => (
                  <tr key={feedback.id_phan_hoi} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{feedback.id_phan_hoi}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate">
                        {feedback.tieu_de}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {feedback.loai_phan_hoi?.replace(/_/g, " ") || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(feedback.ngay_tao)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatStatus(feedback.trang_thai)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => {
                          /* Thêm xử lý xem chi tiết tại đây */
                        }}
                        className="text-blue-600 hover:text-blue-900 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                      >
                        <div className="inline-flex items-center">
                          <span>Xem</span>
                          <svg
                            className="ml-1 h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResidentFeedback;
