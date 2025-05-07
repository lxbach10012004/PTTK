import React, { useState, useEffect, useCallback } from "react";

const API_URL = 'https://mmncb6j3-5000.asse.devtunnels.ms/api'; // Thay IP nếu cần

// Helper function for currency formatting (reuse)
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "-";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

function ManageServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [formData, setFormData] = useState({
    ten_dich_vu: "",
    don_vi_tinh: "",
    don_gia: "",
    mo_ta: "",
    trang_thai: 1, // 1: Hoạt động, 0: Không hoạt động
    hien_thi_cho_cu_dan: 0, // 1: Có, 0: Không (Nội bộ)
  });

  // Fetch services from API
  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/dich-vu`);
      if (!response.ok) throw new Error("Không tải được danh sách dịch vụ");
      const data = await response.json();
      setServices(data);
    } catch (err) {
      setError(err.message);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseInt(value),
    }));
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentService(null);
    setFormData({
      ten_dich_vu: "",
      don_vi_tinh: "",
      don_gia: "",
      mo_ta: "",
      trang_thai: 1,
      hien_thi_cho_cu_dan: 0,
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
      ? `${API_URL}/dich-vu/${currentService.id_dich_vu}`
      : `${API_URL}/dich-vu`;
    const method = isEditing ? "PUT" : "POST";

    // Prepare data, convert types
    const dataToSend = {
      ...formData,
      don_gia: formData.don_gia ? parseFloat(formData.don_gia) : 0,
      trang_thai: parseInt(formData.trang_thai),
      hien_thi_cho_cu_dan: parseInt(formData.hien_thi_cho_cu_dan),
    };
    if (!dataToSend.ten_dich_vu || !dataToSend.don_vi_tinh) {
      setError("Tên dịch vụ và Đơn vị tính là bắt buộc.");
      setLoading(false);
      return;
    }
    if (isNaN(dataToSend.don_gia)) {
      setError("Đơn giá phải là một số.");
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
        throw new Error(result.error || `Lỗi ${isEditing ? "cập nhật" : "thêm"} dịch vụ`);
      }
      setMessage(result.message || `Dịch vụ đã được ${isEditing ? "cập nhật" : "thêm"} thành công.`);
      resetForm();
      fetchServices();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setIsEditing(true);
    setCurrentService(service);
    setFormData({
      ten_dich_vu: service.ten_dich_vu,
      don_gia: service.don_gia || '',
      don_vi_tinh: service.don_vi_tinh,
      mo_ta: service.mo_ta || '',
      trang_thai: service.trang_thai, // 0 hoặc 1
      hien_thi_cho_cu_dan: service.hien_thi_cho_cu_dan, // 0 hoặc 1
    });
    setMessage('');
    setError('');
    window.scrollTo(0, 0);
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm(`Bạn có chắc chắn muốn ẩn dịch vụ ID ${serviceId}? Dịch vụ này sẽ không thể được chọn cho yêu cầu mới.`)) {
      return;
    }
    setMessage('');
    setError('');
    setLoading(true);
    try {
      // API uses DELETE method, but backend service performs an update (soft delete)
      const response = await fetch(`${API_URL}/dich-vu/${serviceId}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Lỗi ẩn dịch vụ');
      }
      setMessage(result.message || 'Ẩn dịch vụ thành công.');
      fetchServices();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Dịch vụ</h1>
        <p className="text-gray-600 mt-1">
          Quản lý các dịch vụ cung cấp trong chung cư
        </p>
      </div>

      {/* Form Add/Edit */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEditing
              ? `Sửa Dịch vụ: ${currentService?.ten_dich_vu}`
              : "Thêm Dịch vụ mới"}
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
                htmlFor="ten_dich_vu"
                className="block text-sm font-medium text-gray-700"
              >
                Tên dịch vụ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="ten_dich_vu"
                id="ten_dich_vu"
                value={formData.ten_dich_vu}
                onChange={handleInputChange}
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <div>
              <label
                htmlFor="don_gia"
                className="block text-sm font-medium text-gray-700"
              >
                Đơn giá <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="don_gia"
                id="don_gia"
                value={formData.don_gia}
                onChange={handleInputChange}
                required
                min="0"
                step="1000"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <div>
              <label
                htmlFor="don_vi_tinh"
                className="block text-sm font-medium text-gray-700"
              >
                Đơn vị tính
              </label>
              <input
                type="text"
                name="don_vi_tinh"
                id="don_vi_tinh"
                value={formData.don_vi_tinh}
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
                onChange={handleSelectChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
              >
                <option value={1}>Hoạt động</option>
                <option value={0}>Không hoạt động</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="mo_ta"
                className="block text-sm font-medium text-gray-700"
              >
                Mô tả
              </label>
              <textarea
                name="mo_ta"
                id="mo_ta"
                rows="3"
                value={formData.mo_ta}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
              ></textarea>
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
                : "Thêm Dịch vụ"}
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

      {/* Services List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Danh sách Dịch vụ
          </h2>
        </div>

        <div className="p-6">
          {loading && !services.length ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-600"></div>
              <span className="ml-3 text-gray-600">Đang tải...</span>
            </div>
          ) : null}

          {!loading && !error && services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Không có dịch vụ nào.</p>
            </div>
          ) : null}

          {services.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Tên dịch vụ
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Đơn giá
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Đơn vị tính
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Trạng thái
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {services.map((service) => (
                    <tr key={service.id_dich_vu} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">
                        {service.id_dich_vu}
                      </td>
                      <td className="px-4 py-2 text-sm font-medium">
                        {service.ten_dich_vu}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {formatCurrency(service.don_gia)}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {service.don_vi_tinh || "-"}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            service.trang_thai === 1
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {service.trang_thai === 1 ? "Hoạt động" : "Không hoạt động"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(service)}
                          className="text-rose-600 hover:text-rose-800 mr-3 focus:outline-none focus:underline"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(service.id_dich_vu)}
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

export default ManageServices;
