import React, { useState, useEffect, useCallback } from "react";

const API_URL = "http://172.21.92.186:5000/api"; // Thay IP nếu cần

// Helper function
const formatDate = (dateString) => {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleDateString("vi-VN");
  } catch (e) {
    return dateString;
  }
};
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toISOString().split("T")[0];
  } catch (e) {
    return "";
  }
};
const formatCurrency = (amount) => {
  if (amount == null) return "-";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

function ManageContracts() {
  const [contracts, setContracts] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [currentContract, setCurrentContract] = useState(null);
  const [formData, setFormData] = useState({
    ma_hop_dong: "",
    id_can_ho: "",
    id_cu_dan: "",
    ngay_bat_dau: "",
    ngay_ket_thuc: "",
    tien_thue: "",
    tien_coc: "",
    trang_thai: "Hiệu_lực", // Enum: 'Hiệu_lực', 'Hết_hạn', 'Đã_hủy'
    ghi_chu: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const [conRes, aptRes, resRes] = await Promise.all([
        fetch(`${API_URL}/hop-dong`), // Endpoint lấy hợp đồng
        fetch(`${API_URL}/can-ho`), // Lấy căn hộ để chọn
        fetch(`${API_URL}/nguoi-dung?vai_tro=CuDan`), // Lấy cư dân để chọn
      ]);

      let conData = [],
        aptData = [],
        resData = [];

      if (conRes.ok) {
        conData = await conRes.json();
      } else {
        const errData = await conRes
          .json()
          .catch(() => ({ error: "Không thể đọc phản hồi lỗi" }));
        setError(
          (prev) =>
            prev + ` Lỗi tải hợp đồng: ${errData.error || conRes.statusText}.`
        );
      }
      if (aptRes.ok) {
        aptData = await aptRes.json();
      } else {
        const errData = await aptRes
          .json()
          .catch(() => ({ error: "Không thể đọc phản hồi lỗi" }));
        setError(
          (prev) =>
            prev + ` Lỗi tải căn hộ: ${errData.error || aptRes.statusText}.`
        );
      }
      if (resRes.ok) {
        resData = await resRes.json();
      } else {
        const errData = await resRes
          .json()
          .catch(() => ({ error: "Không thể đọc phản hồi lỗi" }));
        setError(
          (prev) =>
            prev + ` Lỗi tải cư dân: ${errData.error || resRes.statusText}.`
        );
      }

      setContracts(conData);
      setApartments(aptData);
      setResidents(resData);
    } catch (err) {
      console.error("Lỗi fetch data:", err);
      setError(
        (prev) => prev + ` Lỗi mạng hoặc xử lý dữ liệu: ${err.message}.`
      );
      setContracts([]);
      setApartments([]);
      setResidents([]);
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
    setCurrentContract(null);
    setFormData({
      ma_hop_dong: "",
      id_can_ho: "",
      id_cu_dan: "",
      ngay_bat_dau: "",
      ngay_ket_thuc: "",
      tien_thue: "",
      tien_coc: "",
      trang_thai: "Hiệu_lực",
      ghi_chu: "",
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
      ? `${API_URL}/hop-dong/${currentContract.id_hop_dong}`
      : `${API_URL}/hop-dong`;
    const method = isEditing ? "PUT" : "POST";

    // Prepare data, convert types
    const dataToSend = {
      ...formData,
      id_can_ho: parseInt(formData.id_can_ho),
      id_cu_dan: parseInt(formData.id_cu_dan),
      tien_thue: formData.tien_thue ? parseFloat(formData.tien_thue) : null,
      tien_coc: formData.tien_coc ? parseFloat(formData.tien_coc) : null,
      ngay_bat_dau: formData.ngay_bat_dau || null,
      ngay_ket_thuc: formData.ngay_ket_thuc || null,
    };

    if (
      !dataToSend.id_can_ho ||
      !dataToSend.id_cu_dan ||
      !dataToSend.ngay_bat_dau ||
      !dataToSend.tien_thue
    ) {
      setError("Vui lòng nhập đầy đủ thông tin bắt buộc.");
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
          result.error || `Lỗi ${isEditing ? "cập nhật" : "thêm"} hợp đồng`
        );
      }
      setMessage(
        result.message ||
          `Hợp đồng đã được ${isEditing ? "cập nhật" : "thêm"} thành công.`
      );
      resetForm();
      fetchData(); // Refresh list
    } catch (err) {
      console.error(`Lỗi ${isEditing ? "cập nhật" : "thêm"} hợp đồng:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (contract) => {
    setIsEditing(true);
    setCurrentContract(contract);
    setFormData({
      ma_hop_dong: contract.ma_hop_dong || "",
      id_can_ho: String(contract.id_can_ho),
      id_cu_dan: String(contract.id_cu_dan),
      ngay_bat_dau: formatDateForInput(contract.ngay_bat_dau),
      ngay_ket_thuc: formatDateForInput(contract.ngay_ket_thuc),
      tien_thue: contract.tien_thue || "",
      tien_coc: contract.tien_coc || "",
      trang_thai: contract.trang_thai || "Hiệu_lực",
      ghi_chu: contract.ghi_chu || "",
    });
    setMessage("");
    setError("");
    window.scrollTo(0, 0);
  };

  const handleTerminate = async (contractId) => {
    if (
      !window.confirm(`Bạn có chắc chắn muốn hủy hợp đồng ID ${contractId}?`)
    ) {
      return;
    }
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/hop-dong/${contractId}/terminate`,
        { method: "POST" }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Lỗi hủy hợp đồng");
      }
      setMessage(result.message || "Hủy hợp đồng thành công.");
      fetchData(); // Refresh list
    } catch (err) {
      console.error("Lỗi hủy hợp đồng:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Hợp đồng</h1>
        <p className="text-gray-600 mt-1">
          Quản lý thông tin hợp đồng thuê căn hộ trong chung cư
        </p>
      </div>

      {/* Form Add/Edit */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEditing
              ? `Sửa Hợp đồng: ${currentService?.ten_dich_vu}`
              : "Thêm Hợp đồng mới"}
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
                htmlFor="ma_hop_dong"
                className="block text-sm font-medium text-gray-700"
              >
                Mã hợp đồng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="ma_hop_dong"
                id="ma_hop_dong"
                value={formData.ma_hop_dong}
                onChange={handleInputChange}
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <div>
              <label
                htmlFor="id_can_ho"
                className="block text-sm font-medium text-gray-700"
              >
                Căn hộ <span className="text-red-500">*</span>
              </label>
              <select
                name="id_can_ho"
                id="id_can_ho"
                value={formData.id_can_ho}
                onChange={handleInputChange}
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
              >
                <option value="">Chọn căn hộ</option>
                {apartments.map((apt) => (
                  <option key={apt.id_can_ho} value={apt.id_can_ho}>
                    {apt.ma_can} - {apt.toa_nha} - {apt.tang}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="id_cu_dan"
                className="block text-sm font-medium text-gray-700"
              >
                Cư dân thuê <span className="text-red-500">*</span>
              </label>
              <select
                name="id_cu_dan"
                id="id_cu_dan"
                value={formData.id_cu_dan}
                onChange={handleInputChange}
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
              >
                <option value="">Chọn cư dân</option>
                {residents.map((resident) => (
                  <option
                    key={resident.id_nguoi_dung}
                    value={resident.id_nguoi_dung}
                  >
                    {resident.ho_ten} - {resident.cccd}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="ngay_bat_dau"
                className="block text-sm font-medium text-gray-700"
              >
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="ngay_bat_dau"
                id="ngay_bat_dau"
                value={formData.ngay_bat_dau}
                onChange={handleInputChange}
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <div>
              <label
                htmlFor="ngay_ket_thuc"
                className="block text-sm font-medium text-gray-700"
              >
                Ngày kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="ngay_ket_thuc"
                id="ngay_ket_thuc"
                value={formData.ngay_ket_thuc}
                onChange={handleInputChange}
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <div>
              <label
                htmlFor="tien_thue"
                className="block text-sm font-medium text-gray-700"
              >
                Tiền thuê (VNĐ/tháng) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="tien_thue"
                id="tien_thue"
                value={formData.tien_thue}
                onChange={handleInputChange}
                required
                min="0"
                step="100000"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <div>
              <label
                htmlFor="tien_coc"
                className="block text-sm font-medium text-gray-700"
              >
                Tiền cọc (VNĐ)
              </label>
              <input
                type="number"
                name="tien_coc"
                id="tien_coc"
                value={formData.tien_coc}
                onChange={handleInputChange}
                min="0"
                step="100000"
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
                <option value="Hiệu_lực">Hiệu lực</option>
                <option value="Hết_hạn">Hết hạn</option>
                <option value="Đã_hủy">Đã hủy</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="ghi_chu"
                className="block text-sm font-medium text-gray-700"
              >
                Ghi chú
              </label>
              <textarea
                name="ghi_chu"
                id="ghi_chu"
                rows="3"
                value={formData.ghi_chu}
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
                : "Thêm Hợp đồng"}
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
          {loading && !contracts.length ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-600"></div>
              <span className="ml-3 text-gray-600">Đang tải...</span>
            </div>
          ) : null}

          {!loading && !error && contracts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Không có hợp đồng nào.</p>
            </div>
          ) : null}

          {contracts.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Mã HĐ
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Căn hộ
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Cư dân
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Thời hạn
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Tiền thuê
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
                  {contracts.map((contract) => (
                    <tr key={contract.id_hop_dong} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm font-medium">
                        {contract.ma_hop_dong}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {contract.ma_can_ho}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {contract.ten_cu_dan}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <div>{formatDate(contract.ngay_bat_dau)}</div>
                        <div className="text-gray-500">
                          đến {formatDate(contract.ngay_ket_thuc)}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm font-medium">
                        {formatCurrency(contract.tien_thue)}/tháng
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            contract.trang_thai === "Hiệu_lực"
                              ? "bg-green-100 text-green-800"
                              : contract.trang_thai === "Hết_hạn"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {contract.trang_thai?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(contract)}
                          className="text-rose-600 hover:text-rose-800 mr-3 focus:outline-none focus:underline"
                        >
                          Sửa
                        </button>
                        {contract.trang_thai === "Hiệu_lực" && (
                          <button
                            onClick={() =>
                              handleTerminate(contract.id_hop_dong)
                            }
                            className="text-red-600 hover:text-red-800 focus:outline-none focus:underline"
                          >
                            Hủy HĐ
                          </button>
                        )}
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

export default ManageContracts;
