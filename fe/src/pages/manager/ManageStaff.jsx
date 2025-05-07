import React, { useState, useEffect, useCallback } from "react";

const API_URL = "http://172.21.92.186:5000/api"; // Thay IP nếu cần

// Helper function (reuse)
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return "-";
  try {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString("vi-VN"); // Chỉ hiển thị ngày nếu cần
  } catch (e) {
    return dateTimeString;
  }
};

function ManageStaff() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(""); // For success/error messages after actions

  // Form state for Add/Edit
  const [isEditing, setIsEditing] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null); // Staff being edited
  const [formData, setFormData] = useState({
    ho_ten: "",
    email: "",
    so_dien_thoai: "",
    mat_khau: "", // Only for adding
    chuc_vu: "", // Thêm chức vụ từ bảng nhan_vien_phu_trach
  });

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${API_URL}/nguoi-dung?vai_tro=NhanVienPhuTrach`
      );
      if (!response.ok) {
        const errData = await response
          .json()
          .catch(() => ({ error: "Không thể đọc phản hồi lỗi" }));
        throw new Error(
          errData.error ||
            `Lỗi ${response.status}: Không tải được danh sách nhân viên`
        );
      }
      const data = await response.json();
      setStaffList(data);
    } catch (err) {
      console.error("Lỗi fetch nhân viên:", err);
      setError(err.message);
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentStaff(null);
    setFormData({
      ho_ten: "",
      email: "",
      so_dien_thoai: "",
      mat_khau: "",
      chuc_vu: "",
    });
    setMessage("");
    setError("");
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    const url = isEditing
      ? `${API_URL}/nguoi-dung/staff/${currentStaff.id_nguoi_dung}`
      : `${API_URL}/nguoi-dung/staff`;
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
    dataToSend.vai_tro = "NhanVienPhuTrach";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.error || `Lỗi ${isEditing ? "cập nhật" : "thêm"} nhân viên`
        );
      }
      setMessage(
        result.message ||
          `Nhân viên đã được ${isEditing ? "cập nhật" : "thêm"} thành công.`
      );
      resetForm();
      fetchStaff();
    } catch (err) {
      console.error(`Lỗi ${isEditing ? "cập nhật" : "thêm"} nhân viên:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (staff) => {
    setIsEditing(true);
    setCurrentStaff(staff);
    setFormData({
      ho_ten: staff.ho_ten,
      email: staff.email,
      so_dien_thoai: staff.so_dien_thoai || "",
      mat_khau: "",
      chuc_vu: staff.chuc_vu || "",
    });
    setMessage("");
    setError("");
    window.scrollTo(0, 0);
  };

  const handleDelete = async (staffId) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa nhân viên ID ${staffId}? Hành động này không thể hoàn tác.`
      )
    ) {
      return;
    }
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/nguoi-dung/${staffId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Lỗi xóa nhân viên");
      }
      setMessage(result.message || "Xóa nhân viên thành công.");
      fetchStaff();
    } catch (err) {
      console.error("Lỗi xóa nhân viên:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Nhân viên</h1>
        <p className="text-gray-600 mt-1">
          Quản lý thông tin nhân viên phụ trách trong chung cư
        </p>
      </div>

      {/* Form Add/Edit */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEditing
              ? `Sửa thông tin Nhân viên: ${currentService?.ten_dich_vu}`
              : "Thêm Nhân viên mới"}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                htmlFor="chuc_vu"
                className="block text-sm font-medium text-gray-700"
              >
                Chức vụ
              </label>
              <input
                type="text"
                name="chuc_vu"
                id="chuc_vu"
                value={formData.chuc_vu}
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
                : "Thêm Nhân viên"}
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

      {/* Staff List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Danh sách Nhân viên
          </h2>
        </div>

        <div className="p-6">
          {loading && !staffList.length ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-600"></div>
              <span className="ml-3 text-gray-600">Đang tải...</span>
            </div>
          ) : null}

          {!loading && !error && staffList.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Không có nhân viên nào.</p>
            </div>
          ) : null}

          {staffList.length > 0 && (
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
                      Chức vụ
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {staffList.map((staff) => (
                    <tr key={staff.id_nguoi_dung} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">
                        {staff.id_nguoi_dung}
                      </td>
                      <td className="px-4 py-2 text-sm font-medium">
                        {staff.ho_ten}
                      </td>
                      <td className="px-4 py-2 text-sm">{staff.email}</td>
                      <td className="px-4 py-2 text-sm">
                        {staff.so_dien_thoai || "-"}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {staff.chuc_vu || "-"}
                      </td>
                      <td className="px-4 py-2 text-sm whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(staff)}
                          className="text-rose-600 hover:text-rose-800 mr-3 focus:outline-none focus:underline"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(staff.id_nguoi_dung)}
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

export default ManageStaff;
