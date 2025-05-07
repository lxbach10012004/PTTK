import React, { useState, useEffect, useCallback } from "react";

const API_URL = 'https://mmncb6j3-5000.asse.devtunnels.ms/api'; // Thay IP nếu cần

// Helper function (reuse)
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return "-";
  try {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString("vi-VN"); // Chỉ hiển thị ngày
  } catch (e) {
    return dateTimeString;
  }
};

function ManageResidents() {
  const [residentList, setResidentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [currentResident, setCurrentResident] = useState(null);
  const [formData, setFormData] = useState({
    ho_ten: "",
    email: "",
    so_dien_thoai: "",
    mat_khau: "",
    ngay_chuyen_den: "",
    cccd: "",
    gioi_tinh: "",
    ngay_sinh: "",
  });

  const fetchResidents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Sử dụng endpoint lấy người dùng theo vai trò
      const response = await fetch(`${API_URL}/nguoi-dung?vai_tro=CuDan`);
      if (!response.ok) {
        const errData = await response
          .json()
          .catch(() => ({ error: "Không thể đọc phản hồi lỗi" }));
        throw new Error(
          errData.error ||
            `Lỗi ${response.status}: Không tải được danh sách cư dân`
        );
      }
      const data = await response.json();
      // Backend cần trả về thông tin join từ nguoi_dung và cu_dan
      setResidentList(data);
    } catch (err) {
      console.error("Lỗi fetch cư dân:", err);
      setError(err.message);
      setResidentList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResidents();
  }, [fetchResidents]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentResident(null);
    setFormData({
      ho_ten: "",
      email: "",
      so_dien_thoai: "",
      mat_khau: "",
      ngay_chuyen_den: "",
      cccd: "",
      gioi_tinh: "",
      ngay_sinh: "",
    });
    setMessage("");
    setError("");
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    // Endpoint xử lý người dùng (backend sẽ tự phân vai trò)
    const url = isEditing
      ? `${API_URL}/nguoi-dung/resident/${currentResident.id_nguoi_dung}`
      : `${API_URL}/nguoi-dung/resident`; // Giả định endpoint này tồn tại
    const method = isEditing ? "PUT" : "POST";

    const dataToSend = { ...formData };
    if (isEditing) {
      delete dataToSend.mat_khau;
    } else if (!dataToSend.mat_khau) {
      setError("Mật khẩu là bắt buộc khi thêm mới.");
      setLoading(false);
      return;
    }
    if (!dataToSend.ho_ten || !dataToSend.email) {
      setError("Họ tên và Email là bắt buộc.");
      setLoading(false);
      return;
    }
    // Gửi cả vai trò để backend biết
    dataToSend.vai_tro = "CuDan";
    // Format lại ngày nếu cần trước khi gửi
    if (dataToSend.ngay_chuyen_den === "") {
      dataToSend.ngay_chuyen_den = null; // Gửi null nếu trống
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.error || `Lỗi ${isEditing ? "cập nhật" : "thêm"} cư dân`
        );
      }
      setMessage(
        result.message ||
          `Cư dân đã được ${isEditing ? "cập nhật" : "thêm"} thành công.`
      );
      resetForm();
      fetchResidents();
    } catch (err) {
      console.error(`Lỗi ${isEditing ? "cập nhật" : "thêm"} cư dân:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (resident) => {
    setIsEditing(true);
    setCurrentResident(resident);
    // Format ngày về yyyy-MM-dd cho input type="date"
    const ngayChuyenDenFormatted = resident.ngay_chuyen_den
      ? new Date(resident.ngay_chuyen_den).toISOString().split("T")[0]
      : "";
    const ngaySinhFormatted = resident.ngay_sinh
      ? new Date(resident.ngay_sinh).toISOString().split("T")[0]
      : "";
    setFormData({
      ho_ten: resident.ho_ten,
      email: resident.email,
      so_dien_thoai: resident.so_dien_thoai || "",
      mat_khau: "",
      ngay_chuyen_den: ngayChuyenDenFormatted,
      cccd: resident.cccd || "",
      gioi_tinh: resident.gioi_tinh || "",
      ngay_sinh: ngaySinhFormatted,
    });
    setMessage("");
    setError("");
    window.scrollTo(0, 0);
  };

  const handleDelete = async (residentId) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa cư dân ID ${residentId}? Việc này có thể ảnh hưởng đến các bản ghi liên quan (căn hộ, hóa đơn...).`
      )
    ) {
      return;
    }
    setMessage("");
    setError("");
    setLoading(true);
    try {
      // Endpoint xóa người dùng (backend xử lý cascade hoặc logic liên quan)
      const response = await fetch(`${API_URL}/nguoi-dung/${residentId}`, {
        method: "DELETE",
      }); // Dùng endpoint chung
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Lỗi xóa cư dân");
      }
      setMessage(result.message || "Xóa cư dân thành công.");
      fetchResidents();
    } catch (err) {
      console.error("Lỗi xóa cư dân:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Cư dân</h1>
        <p className="text-gray-600 mt-1">
          Quản lý thông tin cư dân trong chung cư
        </p>
      </div>

      {/* Form Add/Edit */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEditing
              ? `Sửa thông tin Cư dân: ${currentService?.ten_dich_vu}`
              : "Thêm Cư dân mới"}
          </h2>
        </div>

        <form
          onSubmit={handleAddOrUpdate}
          className="p-6 bg-white border-b border-gray-200"
        >
          {error && (
            <div className="mb-4 p-4 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {message && (
            <div className="mb-4 p-4 rounded-md bg-green-50 border border-green-200">
              <p className="text-sm text-green-600">{message}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="ho_ten"
                className="block text-sm font-medium text-gray-700"
              >
                Họ tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="ho_ten"
                id="ho_ten"
                value={formData.ho_ten}
                onChange={handleInputChange}
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <div>
              <label
                htmlFor="so_dien_thoai"
                className="block text-sm font-medium text-gray-700"
              >
                Số điện thoại
              </label>
              <input
                type="tel"
                name="so_dien_thoai"
                id="so_dien_thoai"
                value={formData.so_dien_thoai}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <div>
              <label
                htmlFor="cccd"
                className="block text-sm font-medium text-gray-700"
              >
                CCCD/CMND
              </label>
              <input
                type="text"
                name="cccd"
                id="cccd"
                value={formData.cccd}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <div>
              <label
                htmlFor="gioi_tinh"
                className="block text-sm font-medium text-gray-700"
              >
                Giới tính
              </label>
              <select
                name="gioi_tinh"
                id="gioi_tinh"
                value={formData.gioi_tinh}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="ngay_sinh"
                className="block text-sm font-medium text-gray-700"
              >
                Ngày sinh
              </label>
              <input
                type="date"
                name="ngay_sinh"
                id="ngay_sinh"
                value={formData.ngay_sinh}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            {!isEditing && (
              <div>
                <label
                  htmlFor="mat_khau"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="mat_khau"
                  id="mat_khau"
                  value={formData.mat_khau}
                  onChange={handleInputChange}
                  required={!isEditing}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
            >
              {loading
                ? "Đang xử lý..."
                : isEditing
                ? "Lưu thay đổi"
                : "Thêm Cư dân"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Hủy sửa
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Residents List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Danh sách Cư dân
          </h2>
        </div>

        <div className="p-6">
          {loading && !residentList.length ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-600"></div>
              <span className="ml-3 text-gray-600">Đang tải...</span>
            </div>
          ) : null}

          {!loading && !error && residentList.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Không có cư dân nào.</p>
            </div>
          ) : null}

          {residentList.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Họ tên
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      SĐT
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      CCCD
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Căn hộ
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {residentList.map((resident) => (
                    <tr
                      key={resident.id_nguoi_dung}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-2 text-sm">
                        {resident.id_nguoi_dung}
                      </td>
                      <td className="px-4 py-2 text-sm font-medium">
                        {resident.ho_ten}
                      </td>
                      <td className="px-4 py-2 text-sm">{resident.email}</td>
                      <td className="px-4 py-2 text-sm">
                        {resident.so_dien_thoai || "-"}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {resident.cccd || "-"}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {resident.ma_can_ho || "-"}
                      </td>
                      <td className="px-4 py-2 text-sm whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(resident)}
                          className="text-rose-600 hover:text-rose-800 mr-3 focus:outline-none focus:underline"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(resident.id_nguoi_dung)}
                          className="text-red-600 hover:text-red-800 focus:outline-none focus:underline"
                        >
                          Xóa
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
    </div>
  );
}

export default ManageResidents;
