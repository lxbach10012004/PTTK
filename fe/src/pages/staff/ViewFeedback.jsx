// filepath: d:\course\PTTKHTTT\PTTK\fe\src\pages\staff\ViewFeedback.jsx
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

// Hàm định dạng loại phản hồi
const formatFeedbackType = (type) => {
  if (!type) return "-";
  return type.replace(/_/g, " ");
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

function ViewFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const { user } = useContext(AuthContext);

  // Lấy danh sách phản hồi
  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/phan-hoi`);
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

    fetchFeedbacks();
  }, []);

  // Lọc phản hồi theo từ khóa, trạng thái và loại
  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const statusMatch = filterStatus
      ? feedback.trang_thai === filterStatus
      : true;
    const typeMatch = filterType ? feedback.loai_phan_hoi === filterType : true;
    const searchMatch =
      searchTerm.trim() === "" ||
      (feedback.tieu_de &&
        feedback.tieu_de.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (feedback.noi_dung &&
        feedback.noi_dung.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (feedback.ten_cu_dan &&
        feedback.ten_cu_dan.toLowerCase().includes(searchTerm.toLowerCase()));
    return statusMatch && typeMatch && searchMatch;
  });

  // Lấy danh sách các loại phản hồi unique để hiển thị trong dropdown
  const feedbackTypes = [
    ...new Set(feedbacks.map((feedback) => feedback.loai_phan_hoi)),
  ].filter(Boolean);

  // Xem chi tiết phản hồi
  const handleViewFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setReplyText(feedback.tra_loi || "");
  };

  // Đóng modal chi tiết
  const handleCloseModal = () => {
    setSelectedFeedback(null);
    setReplyText("");
  };

  // Xử lý thay đổi trạng thái và trả lời phản hồi
  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!selectedFeedback) return;

    setSubmitting(true);
    setMessage(null);
    try {
      const response = await fetch(
        `${API_URL}/phan-hoi/${selectedFeedback.id_phan_hoi}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            trang_thai: "Đã_trả_lời",
            tra_loi: replyText,
            id_nhan_vien: user?.id_nguoi_dung || 1, // Mặc định ID nhân viên khi test
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể cập nhật phản hồi");
      }

      // Cập nhật state
      setFeedbacks((prevFeedbacks) =>
        prevFeedbacks.map((fb) =>
          fb.id_phan_hoi === selectedFeedback.id_phan_hoi
            ? { ...fb, trang_thai: "Đã_trả_lời", tra_loi: replyText }
            : fb
        )
      );

      setMessage({
        type: "success",
        text: "Phản hồi đã được cập nhật thành công!",
      });

      // Đóng modal sau 2 giây
      setTimeout(() => {
        handleCloseModal();
      }, 2000);
    } catch (err) {
      console.error("Lỗi khi cập nhật phản hồi:", err);
      setMessage({
        type: "error",
        text:
          err.message || "Không thể cập nhật phản hồi. Vui lòng thử lại sau.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Hiển thị khi đang tải
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
        <span className="ml-3 text-lg">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-800">
            Quản lý Phản hồi & Góp ý
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Xem và phản hồi các góp ý, khiếu nại từ cư dân
          </p>
        </div>

        {/* Thống kê nhanh */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Tổng phản hồi</div>
              <div className="text-2xl font-semibold text-blue-700">
                {feedbacks.length}
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Đang chờ xử lý</div>
              <div className="text-2xl font-semibold text-yellow-700">
                {
                  feedbacks.filter(
                    (fb) =>
                      fb.trang_thai === "Mới" || fb.trang_thai === "Đang_xử_lý"
                  ).length
                }
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Đã trả lời</div>
              <div className="text-2xl font-semibold text-green-700">
                {
                  feedbacks.filter((fb) => fb.trang_thai === "Đã_trả_lời")
                    .length
                }
              </div>
            </div>
          </div>
        </div>

        {/* Bộ lọc và tìm kiếm */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                placeholder="Tìm kiếm phản hồi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm rounded-md"
              >
                <option value="">Tất cả loại phản hồi</option>
                {feedbackTypes.map((type) => (
                  <option key={type} value={type}>
                    {formatFeedbackType(type)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm rounded-md"
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
              Không tìm thấy phản hồi nào
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus || filterType
                ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
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
                    Tiêu đề
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Người gửi
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
                    Thao tác
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
                      {feedback.ten_cu_dan || "Không xác định"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFeedbackType(feedback.loai_phan_hoi)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(feedback.ngay_tao)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatStatus(feedback.trang_thai)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleViewFeedback(feedback)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                      >
                        <span>Xem & Trả lời</span>
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
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
              <h2 className="text-lg font-semibold text-gray-800">
                Chi tiết phản hồi #{selectedFeedback.id_phan_hoi}
              </h2>
              <button
                onClick={handleCloseModal}
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
            <div className="p-6 space-y-5">
              {/* Thông báo */}
              {message && (
                <div
                  className={`p-4 rounded-md ${
                    message.type === "error"
                      ? "bg-red-50 text-red-700"
                      : "bg-green-50 text-green-700"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  <div className="mt-1">
                    {formatStatus(selectedFeedback.trang_thai)}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Loại phản hồi</p>
                  <div className="mt-1 font-medium">
                    {formatFeedbackType(selectedFeedback.loai_phan_hoi)}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Người gửi</p>
                <p className="mt-1 font-medium">
                  {selectedFeedback.ten_cu_dan || "Không xác định"}
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
                <div className="mt-1 bg-gray-50 p-4 rounded-md text-sm">
                  {selectedFeedback.noi_dung || "(Không có nội dung)"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Ngày gửi</p>
                  <p className="mt-1">
                    {formatDateTime(selectedFeedback.ngay_tao)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cập nhật lần cuối</p>
                  <p className="mt-1">
                    {formatDateTime(selectedFeedback.ngay_cap_nhat) || "-"}
                  </p>
                </div>
              </div>

              {/* Form trả lời */}
              <form onSubmit={handleSubmitReply} className="mt-6">
                <div className="mb-4">
                  <label
                    htmlFor="reply"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Trả lời phản hồi
                  </label>
                  <textarea
                    id="reply"
                    rows="4"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                    placeholder="Nhập nội dung trả lời..."
                    required={selectedFeedback.trang_thai !== "Đã_trả_lời"}
                    disabled={
                      submitting || selectedFeedback.trang_thai === "Đã_đóng"
                    }
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-50"
                  >
                    Đóng
                  </button>

                  {selectedFeedback.trang_thai !== "Đã_đóng" && (
                    <button
                      type="submit"
                      disabled={submitting || !replyText.trim()}
                      className={`px-4 py-2 rounded-md text-white transition-colors ${
                        submitting || !replyText.trim()
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-50"
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
                        "Gửi trả lời"
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewFeedback;
