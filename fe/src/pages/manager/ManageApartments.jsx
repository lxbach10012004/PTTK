import React, { useState, useEffect, useCallback } from "react";

const API_URL = "http://172.21.92.186:5000/api"; // Thay IP nếu cần

function ManageApartments() {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [currentApartment, setCurrentApartment] = useState(null);
  const [formData, setFormData] = useState({
    ma_can: "",
    toa_nha: "",
    tang: "",
    dien_tich: "",
    so_phong_ngu: "",
    so_phong_tam: "",
    trang_thai: "Trống",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const aptRes = await fetch(`${API_URL}/can-ho`);

      if (!aptRes.ok) {
        const errData = await aptRes
          .json()
          .catch(() => ({ error: "Không thể đọc phản hồi lỗi" }));
        throw new Error(
          `Lỗi tải căn hộ: ${errData.error || aptRes.statusText}`
        );
      }
      const aptData = await aptRes.json();
      setApartments(aptData);
    } catch (err) {
      console.error("Lỗi fetch căn hộ:", err);
      setError(err.message);
      setApartments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentApartment(null);
    setFormData({
      ma_can: "",
      toa_nha: "",
      tang: "",
      dien_tich: "",
      so_phong_ngu: "",
      so_phong_tam: "",
      trang_thai: "Trống",
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
      ? `${API_URL}/can-ho/${currentApartment.id_can_ho}`
      : `${API_URL}/can-ho`;
    const method = isEditing ? "PUT" : "POST";

    const dataToSend = {
      ...formData,
      tang: formData.tang ? parseInt(formData.tang) : null,
      dien_tich: formData.dien_tich ? parseFloat(formData.dien_tich) : null,
      so_phong_ngu: formData.so_phong_ngu
        ? parseInt(formData.so_phong_ngu)
        : null,
      so_phong_tam: formData.so_phong_tam
        ? parseInt(formData.so_phong_tam)
        : null,
    };
    if (!dataToSend.ma_can) {
      setError("Mã căn hộ là bắt buộc.");
      setLoading(false);
      return;
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
          result.error || `Lỗi ${isEditing ? "cập nhật" : "thêm"} căn hộ`
        );
      }
      setMessage(
        result.message ||
          `Căn hộ đã được ${isEditing ? "cập nhật" : "thêm"} thành công.`
      );
      resetForm();
      fetchData();
    } catch (err) {
      console.error(`Lỗi ${isEditing ? "cập nhật" : "thêm"} căn hộ:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (apt) => {
    setIsEditing(true);
    setCurrentApartment(apt);
    setFormData({
      ma_can: apt.ma_can || "",
      toa_nha: apt.toa_nha || "",
      tang: apt.tang || "",
      dien_tich: apt.dien_tich || "",
      so_phong_ngu: apt.so_phong_ngu || "",
      so_phong_tam: apt.so_phong_tam || "",
      trang_thai: apt.trang_thai || "Trống",
    });
    setMessage("");
    setError("");
    window.scrollTo(0, 0);
  };

  const handleDelete = async (aptId) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa căn hộ ID ${aptId}? Việc này có thể ảnh hưởng đến hợp đồng liên quan.`
      )
    ) {
      return;
    }
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/can-ho/${aptId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Lỗi xóa căn hộ");
      }
      setMessage(result.message || "Xóa căn hộ thành công.");
      fetchData();
    } catch (err) {
      console.error("Lỗi xóa căn hộ:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Căn hộ</h1>
        <p className="text-gray-600 mt-1">
          Quản lý thông tin các căn hộ trong chung cư
        </p>
      </div>

      {/* Form Add/Edit */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEditing
              ? `Sửa Căn hộ: ${currentService?.ten_dich_vu}`
              : "Thêm Căn hộ mới"}
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
                htmlFor="ma_can"
                className="block text-sm font-medium text-gray-700"
              >
                Mã căn hộ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="ma_can"
                id="ma_can"
                value={formData.ma_can}
                onChange={handleInputChange}
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <div>
              <label
                htmlFor="toa_nha"
                className="block text-sm font-medium text-gray-700"
              >
                Tòa nhà
              </label>
              <input
                type="text"
                name="toa_nha"
                id="toa_nha"
                value={formData.toa_nha}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <div>
              <label
                htmlFor="tang"
                className="block text-sm font-medium text-gray-700"
              >
                Tầng
              </label>
              <input
                type="number"
                name="tang"
                id="tang"
                value={formData.tang}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <div>
              <label
                htmlFor="dien_tich"
                className="block text-sm font-medium text-gray-700"
              >
                Diện tích (m²)
              </label>
              <input
                type="number"
                step="0.01"
                name="dien_tich"
                id="dien_tich"
                value={formData.dien_tich}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <div>
              <label
                htmlFor="so_phong_ngu"
                className="block text-sm font-medium text-gray-700"
              >
                Số phòng ngủ
              </label>
              <input
                type="number"
                name="so_phong_ngu"
                id="so_phong_ngu"
                value={formData.so_phong_ngu}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <div>
              <label
                htmlFor="so_phong_tam"
                className="block text-sm font-medium text-gray-700"
              >
                Số phòng tắm
              </label>
              <input
                type="number"
                name="so_phong_tam"
                id="so_phong_tam"
                value={formData.so_phong_tam}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <div>
              <label
                htmlFor="trang_thai"
                className="block text-sm font-medium text-gray-700"
              >
                Trạng thái
              </label>
              <select
                name="trang_thai"
                id="trang_thai"
                value={formData.trang_thai}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
              >
                <option value="Trống">Trống</option>
                <option value="Đang_ở">Đang ở</option>
                <option value="Đang_sửa">Đang sửa</option>
              </select>
            </div>
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
                : "Thêm Căn hộ"}
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

      {/* Contracts List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Danh sách Hợp đồng
          </h2>
        </div>

        <div className="p-6">
          {loading && !apartments.length ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-600"></div>
              <span className="ml-3 text-gray-600">Đang tải...</span>
            </div>
          ) : null}

          {!loading && !error && apartments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Không có căn hộ nào.</p>
            </div>
          ) : null}

          {apartments.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Mã Căn
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Tòa nhà
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Tầng
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Diện tích
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Trạng thái
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Cư dân (HĐ hiệu lực)
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {apartments.map((apt) => (
                    <tr key={apt.id_can_ho} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm font-medium">
                        {apt.ma_can}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {apt.toa_nha || "-"}
                      </td>
                      <td className="px-4 py-2 text-sm">{apt.tang || "-"}</td>
                      <td className="px-4 py-2 text-sm">
                        {apt.dien_tich ? `${apt.dien_tich} m²` : "-"}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {apt.trang_thai?.replace("_", " ")}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {apt.ten_cu_dan_hien_tai || "-"}
                      </td>
                      <td className="px-4 py-2 text-sm whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(apt)}
                          className="text-rose-600 hover:text-rose-800 mr-3 focus:outline-none focus:underline"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(apt.id_can_ho)}
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

export default ManageApartments;
