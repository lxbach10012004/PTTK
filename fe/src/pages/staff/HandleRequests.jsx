import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const API_URL = 'https://mmncb6j3-5000.asse.devtunnels.ms/api'; // Thay IP nếu cần

// Hàm định dạng ngày giờ
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

// Hàm định dạng trạng thái
const formatStatus = (status) => {
  switch (status) {
    case "Chờ_tiếp_nhận":
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          Chờ tiếp nhận
        </span>
      );
    case "Đã_tiếp_nhận":
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Đã tiếp nhận
        </span>
      );
    case "Đang_xử_lý":
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Đang xử lý
        </span>
      );
    case "Hoàn_thành":
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Hoàn thành
        </span>
      );
    case "Từ_chối":
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Từ chối
        </span>
      );
    case "Hủy":
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
          Hủy
        </span>
      );
    default:
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
          {status?.replace(/_/g, " ") || "Không xác định"}
        </span>
      );
  }
};

// Hàm định dạng mức độ ưu tiên
const formatPriority = (priority) => {
  switch (priority) {
    case "Cao":
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Cao
        </span>
      );
    case "Trung_bình":
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Trung bình
        </span>
      );
    case "Thấp":
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          Thấp
        </span>
      );
    default:
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
          {priority?.replace(/_/g, " ") || "Không xác định"}
        </span>
      );
  }
};

function HandleRequests() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState("Tất_cả");
  const [searchTerm, setSearchTerm] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState("");
  const { user } = useContext(AuthContext);

  // Fetch yêu cầu từ API
  useEffect(() => {
    const fetchRequests = async () => {
      // Comment phần kiểm tra quyền nhân viên để test không cần đăng nhập
      /* if (!user || user.vai_tro !== 'NhanVien') {
        setError('Bạn không có quyền truy cập chức năng này');
        setLoading(false);
        return;
      } */

      try {
        setLoading(true);
        setError("");
        setMessage("");

        // Gọi API lấy yêu cầu dịch vụ
        const res = await fetch(`${API_URL}/yeu-cau-dich-vu`);
        if (!res.ok) {
          throw new Error(`Lỗi ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        if (!Array.isArray(data)) {
          throw new Error("Dữ liệu không hợp lệ");
        }

        // Sắp xếp theo ngày tạo mới nhất và độ ưu tiên
        const sortedData = data.sort((a, b) => {
          // Ưu tiên cao có thứ tự đầu
          const priorityOrder = { Cao: 0, Trung_bình: 1, Thấp: 2 };
          const statusOrder = {
            Chờ_tiếp_nhận: 0,
            Đã_tiếp_nhận: 1,
            Đang_xử_lý: 2,
            Hoàn_thành: 3,
            Từ_chối: 4,
            Hủy: 5,
          };

          // Sắp xếp theo trạng thái (chưa xử lý trước)
          if (statusOrder[a.trang_thai] !== statusOrder[b.trang_thai]) {
            return statusOrder[a.trang_thai] - statusOrder[b.trang_thai];
          }

          // Nếu cùng trạng thái, sắp xếp theo độ ưu tiên
          if (
            priorityOrder[a.muc_do_uu_tien] !== priorityOrder[b.muc_do_uu_tien]
          ) {
            return (
              priorityOrder[a.muc_do_uu_tien] - priorityOrder[b.muc_do_uu_tien]
            );
          }

          // Nếu cùng độ ưu tiên, sắp xếp theo ngày tạo (mới nhất trước)
          return new Date(b.ngay_tao) - new Date(a.ngay_tao);
        });

        setRequests(sortedData);
        setFilteredRequests(sortedData); // Ban đầu hiển thị tất cả
      } catch (err) {
        console.error("Lỗi khi lấy danh sách yêu cầu:", err);
        setError(err.message || "Đã xảy ra lỗi khi tải danh sách yêu cầu");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user]);

  // Lọc yêu cầu theo trạng thái và từ khóa tìm kiếm
  useEffect(() => {
    let results = requests;

    // Lọc theo trạng thái
    if (statusFilter !== "Tất_cả") {
      results = results.filter((req) => req.trang_thai === statusFilter);
    }

    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      results = results.filter(
        (req) =>
          req.tieu_de?.toLowerCase().includes(lowerSearchTerm) ||
          req.mo_ta?.toLowerCase().includes(lowerSearchTerm) ||
          req.ten_dich_vu?.toLowerCase().includes(lowerSearchTerm) ||
          req.ten_cu_dan?.toLowerCase().includes(lowerSearchTerm) ||
          String(req.id_yeu_cau).includes(lowerSearchTerm)
      );
    }

    setFilteredRequests(results);
  }, [statusFilter, searchTerm, requests]);

  // Cập nhật trạng thái yêu cầu
  const handleUpdateStatus = async (requestId) => {
    if (!updateStatus) {
      setMessage("Vui lòng chọn trạng thái mới");
      return;
    }

    setMessage("");
    setUpdatingId(requestId);

    try {
      const response = await fetch(`${API_URL}/yeu-cau-dich-vu/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trang_thai: updateStatus,
          id_nhan_vien: user?.id_nguoi_dung || 1, // Sử dụng ID mặc định khi test
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Lỗi ${response.status}`);
      }

      // Cập nhật state
      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.id_yeu_cau === requestId
            ? {
                ...req,
                trang_thai: updateStatus,
                id_nhan_vien_phu_trach: user?.id_nguoi_dung || 1,
              }
            : req
        )
      );

      setMessage(`Cập nhật trạng thái yêu cầu #${requestId} thành công!`);
      setSelectedRequest(null);
      setUpdateStatus("");
    } catch (error) {
      console.error("Lỗi khi cập nhật yêu cầu:", error);
      setMessage(`Cập nhật thất bại: ${error.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Hiển thị khi đang tải
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">Đang tải danh sách yêu cầu...</span>
      </div>
    );
  }

  // Hiển thị khi có lỗi
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
      {/* Tiêu đề trang và thống kê */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Xử lý Yêu cầu Dịch vụ
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý và xử lý các yêu cầu dịch vụ từ cư dân và quản lý
          </p>
        </div>

        {/* Thống kê nhanh */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-rose-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Tổng yêu cầu</div>
              <div className="text-2xl font-semibold text-rose-700">
                {requests.length}
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Đang chờ xử lý</div>
              <div className="text-2xl font-semibold text-yellow-700">
                {
                  requests.filter(
                    (req) =>
                      req.trang_thai === "Chờ_tiếp_nhận" ||
                      req.trang_thai === "Đã_tiếp_nhận"
                  ).length
                }
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Đang xử lý</div>
              <div className="text-2xl font-semibold text-blue-700">
                {
                  requests.filter((req) => req.trang_thai === "Đang_xử_lý")
                    .length
                }
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Hoàn thành</div>
              <div className="text-2xl font-semibold text-green-700">
                {
                  requests.filter((req) => req.trang_thai === "Hoàn_thành")
                    .length
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thông báo */}
      {message && (
        <div
          className={`p-4 rounded-md ${
            message.includes("thất bại") || message.includes("Lỗi")
              ? "bg-red-50 text-red-700 border-l-4 border-red-500"
              : "bg-green-50 text-green-700 border-l-4 border-green-500"
          }`}
        >
          {message}
        </div>
      )}

      {/* Bộ lọc và tìm kiếm */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Lọc theo trạng thái */}
          <div>
            <label
              htmlFor="statusFilter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Lọc theo trạng thái:
            </label>
            <select
              id="statusFilter"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="Tất_cả">Tất cả trạng thái</option>
              <option value="Chờ_tiếp_nhận">Chờ tiếp nhận</option>
              <option value="Đã_tiếp_nhận">Đã tiếp nhận</option>
              <option value="Đang_xử_lý">Đang xử lý</option>
              <option value="Hoàn_thành">Hoàn thành</option>
              <option value="Từ_chối">Từ chối</option>
              <option value="Hủy">Hủy</option>
            </select>
          </div>

          {/* Tìm kiếm */}
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tìm kiếm:
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
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
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tìm theo ID, tiêu đề, tên cư dân..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách yêu cầu */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">
            Danh sách yêu cầu ({filteredRequests.length})
          </h2>
        </div>

        {filteredRequests.length === 0 ? (
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
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Không có yêu cầu nào
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== "Tất_cả"
                ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
                : "Chưa có yêu cầu dịch vụ nào."}
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
                    Dịch vụ
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Người yêu cầu
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Ngày tạo
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Độ ưu tiên
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
                {filteredRequests.map((request) => (
                  <tr key={request.id_yeu_cau} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{request.id_yeu_cau}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate">{request.tieu_de}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.ten_dich_vu || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.ten_cu_dan
                        ? request.ten_cu_dan
                        : request.ten_quan_ly
                        ? `${request.ten_quan_ly} (QL)`
                        : "Không xác định"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(request.ngay_tao)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPriority(request.muc_do_uu_tien)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatStatus(request.trang_thai)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="text-blue-600 hover:text-blue-900 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-3 py-1"
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

      {/* Modal chi tiết yêu cầu */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
              <h2 className="text-lg font-semibold text-gray-800">
                Chi tiết yêu cầu #{selectedRequest.id_yeu_cau}
              </h2>
              <button
                onClick={() => setSelectedRequest(null)}
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
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  <div className="mt-1">
                    {formatStatus(selectedRequest.trang_thai)}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mức độ ưu tiên</p>
                  <div className="mt-1">
                    {formatPriority(selectedRequest.muc_do_uu_tien)}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Người yêu cầu</p>
                <p className="mt-1 font-medium">
                  {selectedRequest.ten_cu_dan
                    ? `${selectedRequest.ten_cu_dan} (Cư dân)`
                    : selectedRequest.ten_quan_ly
                    ? `${selectedRequest.ten_quan_ly} (Quản lý)`
                    : "Không xác định"}
                </p>
                {selectedRequest.email_nguoi_yeu_cau && (
                  <p className="text-sm text-gray-600">
                    Email: {selectedRequest.email_nguoi_yeu_cau}
                  </p>
                )}
                {selectedRequest.sdt_nguoi_yeu_cau && (
                  <p className="text-sm text-gray-600">
                    SĐT: {selectedRequest.sdt_nguoi_yeu_cau}
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500">Dịch vụ</p>
                <p className="mt-1 font-medium">
                  {selectedRequest.ten_dich_vu || "Không xác định"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Tiêu đề</p>
                <p className="mt-1 font-medium">{selectedRequest.tieu_de}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Mô tả chi tiết</p>
                <p className="mt-1 text-sm bg-gray-50 p-3 rounded">
                  {selectedRequest.mo_ta || "(Không có mô tả)"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Ngày tạo</p>
                  <p className="mt-1">
                    {formatDateTime(selectedRequest.ngay_tao)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cập nhật lần cuối</p>
                  <p className="mt-1">
                    {formatDateTime(selectedRequest.ngay_cap_nhat) || "-"}
                  </p>
                </div>
              </div>

              {/* Form cập nhật trạng thái */}
              <div className="bg-gray-50 p-4 rounded-md mt-4">
                <h3 className="font-medium text-gray-700 mb-3">
                  Cập nhật trạng thái yêu cầu
                </h3>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-3"
                >
                  <option value="">-- Chọn trạng thái mới --</option>
                  <option value="Đã_tiếp_nhận">Đã tiếp nhận</option>
                  <option value="Đang_xử_lý">Đang xử lý</option>
                  <option value="Hoàn_thành">Hoàn thành</option>
                  <option value="Từ_chối">Từ chối</option>
                </select>

                <button
                  onClick={() => handleUpdateStatus(selectedRequest.id_yeu_cau)}
                  disabled={
                    updatingId === selectedRequest.id_yeu_cau || !updateStatus
                  }
                  className={`w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    updatingId === selectedRequest.id_yeu_cau || !updateStatus
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                  }`}
                >
                  {updatingId === selectedRequest.id_yeu_cau ? (
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

export default HandleRequests;
