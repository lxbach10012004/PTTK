import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const API_URL = 'https://mmncb6j3-5000.asse.devtunnels.ms/api'; // Thay IP nếu cần

function ManagerCreateRequest() {
  const [internalServices, setInternalServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [tieuDe, setTieuDe] = useState("");
  const [moTa, setMoTa] = useState("");
  const [mucDoUuTien, setMucDoUuTien] = useState("Trung_bình"); // Giữ nguyên enum từ schema

  const { user } = useContext(AuthContext);

  // Fetch dịch vụ nội bộ
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError("");
      try {
        // Lấy tất cả dịch vụ
        const servicesRes = await fetch(`${API_URL}/dich-vu`);

        if (!servicesRes.ok)
          throw new Error("Không tải được danh sách dịch vụ");

        const servicesData = await servicesRes.json();

        // Lọc ra dịch vụ nội bộ (hien_thi_cho_cu_dan = 0)
        const internal = servicesData.filter(
          (s) => s.hien_thi_cho_cu_dan === 0 && s.trang_thai === 1
        ); // Chỉ lấy dịch vụ nội bộ đang hoạt động
        setInternalServices(internal);
      } catch (err) {
        console.error("Lỗi fetch dịch vụ:", err);
        setError(err.message || "Lỗi không xác định khi tải dịch vụ.");
        setInternalServices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Tự động điền tiêu đề khi chọn dịch vụ
  useEffect(() => {
    if (selectedServiceId) {
      const service = internalServices.find(
        (s) => s.id_dich_vu === parseInt(selectedServiceId)
      );
      if (service && !tieuDe) {
        setTieuDe(`Yêu cầu nội bộ: ${service.ten_dich_vu}`);
      }
    }
  }, [selectedServiceId, internalServices, tieuDe]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitMessage("");
    setError("");

    if (!user || user.vai_tro !== "QuanLyToaNha") {
      setError("Bạn không có quyền thực hiện hành động này.");
      return;
    }
    if (!selectedServiceId || !tieuDe) {
      setError("Vui lòng chọn dịch vụ và nhập tiêu đề.");
      return;
    }

    setIsSubmitting(true);

    const requestData = {
      tieu_de: tieuDe.trim(),
      mo_ta: moTa.trim() || null,
      id_dich_vu: parseInt(selectedServiceId),
      muc_do_uu_tien: mucDoUuTien,
      id_quan_ly: user.id_nguoi_dung, // Gửi id của quản lý tạo yêu cầu
    };

    console.log("Dữ liệu yêu cầu nội bộ gửi đi:", requestData);

    try {
      const response = await fetch(`${API_URL}/yeu-cau-dich-vu/manager`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      const result = await response.json();
      if (response.ok) {
        setSubmitMessage(
          `Đã tạo yêu cầu nội bộ #${
            result.request?.id_yeu_cau || ""
          } thành công!`
        );
        // Reset form
        setSelectedServiceId("");
        setTieuDe("");
        setMoTa("");
        setMucDoUuTien("Trung_bình");
      } else {
        setError(
          `Tạo yêu cầu thất bại: ${result.error || "Lỗi không xác định"}`
        );
      }
    } catch (error) {
      console.error("Lỗi gửi yêu cầu API:", error);
      setError("Đã xảy ra lỗi mạng khi gửi yêu cầu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Tạo Yêu cầu Nội bộ</h1>
        <p className="text-gray-600 mt-1">
          Tạo các yêu cầu nội bộ và phân công công việc
        </p>
      </div>

      {/* Stats cards */}
      {!loading && internalServices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500">
              Dịch vụ nội bộ khả dụng
            </h3>
            <p className="text-2xl font-semibold text-rose-600">
              {internalServices.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500">Loại dịch vụ</h3>
            <div className="mt-2">
              {internalServices.slice(0, 3).map((service) => (
                <span
                  key={service.id_dich_vu}
                  className="inline-block bg-rose-100 text-rose-800 text-xs px-2 py-1 rounded-full mr-2 mb-1"
                >
                  {service.ten_dich_vu}
                </span>
              ))}
              {internalServices.length > 3 && (
                <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                  +{internalServices.length - 3} khác
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md space-y-4"
      >
        <h2 className="text-lg font-medium border-b border-gray-200 pb-3">
          Thông tin yêu cầu nội bộ
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        )}

        {submitMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            <p>{submitMessage}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Chọn dịch vụ nội bộ */}
          <div>
            <label
              htmlFor="service"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Chọn dịch vụ nội bộ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="service"
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                required
                disabled={internalServices.length === 0 || loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500 disabled:bg-gray-100"
              >
                <option value="">
                  {loading
                    ? "Đang tải..."
                    : internalServices.length === 0
                    ? "-- Không có dịch vụ nội bộ nào đang hoạt động --"
                    : "-- Chọn dịch vụ --"}
                </option>
                {internalServices.map((service) => (
                  <option key={service.id_dich_vu} value={service.id_dich_vu}>
                    {service.ten_dich_vu}
                  </option>
                ))}
              </select>
              {loading && (
                <div className="absolute inset-y-0 right-0 pr-8 flex items-center pointer-events-none">
                  <div className="animate-spin h-4 w-4 border-2 border-rose-500 rounded-full border-t-transparent"></div>
                </div>
              )}
            </div>
          </div>

          {/* Tiêu đề */}
          <div>
            <label
              htmlFor="tieuDe"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="tieuDe"
              value={tieuDe}
              onChange={(e) => setTieuDe(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500"
              placeholder="Nhập tiêu đề yêu cầu"
            />
          </div>

          {/* Mô tả */}
          <div>
            <label
              htmlFor="moTa"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mô tả chi tiết (tùy chọn)
            </label>
            <textarea
              id="moTa"
              rows="4"
              value={moTa}
              onChange={(e) => setMoTa(e.target.value)}
              placeholder="Ví dụ: Vệ sinh khu vực hành lang tầng 3, block A..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500"
            ></textarea>
          </div>

          {/* Mức độ ưu tiên */}
          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mức độ ưu tiên
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="priority-low"
                  name="priority"
                  value="Thấp"
                  checked={mucDoUuTien === "Thấp"}
                  onChange={(e) => setMucDoUuTien(e.target.value)}
                  className="focus:ring-rose-500 h-4 w-4 text-rose-600 border-gray-300"
                />
                <label
                  htmlFor="priority-low"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Thấp
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="priority-medium"
                  name="priority"
                  value="Trung_bình"
                  checked={mucDoUuTien === "Trung_bình"}
                  onChange={(e) => setMucDoUuTien(e.target.value)}
                  className="focus:ring-rose-500 h-4 w-4 text-rose-600 border-gray-300"
                />
                <label
                  htmlFor="priority-medium"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Trung bình
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="priority-high"
                  name="priority"
                  value="Cao"
                  checked={mucDoUuTien === "Cao"}
                  onChange={(e) => setMucDoUuTien(e.target.value)}
                  className="focus:ring-rose-500 h-4 w-4 text-rose-600 border-gray-300"
                />
                <label
                  htmlFor="priority-high"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Cao
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Nút Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !user || user.vai_tro !== "QuanLyToaNha"}
            className={`w-full py-2 px-4 font-semibold rounded-md shadow text-white ${
              isSubmitting || !user || user.vai_tro !== "QuanLyToaNha"
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
            }`}
          >
            {isSubmitting ? "Đang tạo..." : "Tạo Yêu Cầu"}
          </button>
          {(!user || user.vai_tro !== "QuanLyToaNha") && (
            <p className="text-xs text-red-500 mt-1">
              Chỉ quản lý mới có thể tạo yêu cầu.
            </p>
          )}
        </div>
      </form>

      {/* Thông tin bổ sung */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">
            Về Yêu cầu Nội bộ
          </h3>
          <p className="text-sm text-gray-600">
            Yêu cầu nội bộ được sử dụng để đề xuất các công việc nội bộ cần thực
            hiện trong tòa nhà mà không liên quan trực tiếp đến cư dân. Nhân
            viên phụ trách sẽ được phân công xử lý các yêu cầu này.
          </p>
        </div>
        <div className="p-6">
          <div className="bg-blue-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Các loại yêu cầu nội bộ
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Sửa chữa, bảo trì cơ sở hạ tầng</li>
                    <li>Vệ sinh khu vực chung</li>
                    <li>Kiểm tra an ninh, an toàn</li>
                    <li>Kế hoạch nâng cấp tiện ích</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManagerCreateRequest;
