// filepath: d:\course\PTTKHTTT\PTTK\fe\src\pages\resident\ResidentServiceRequest.jsx
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const API_URL = "http://172.21.92.186:5000/api";

function ResidentServiceRequest() {
  const [availableServices, setAvailableServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [ngayHen, setNgayHen] = useState("");
  const [moTa, setMoTa] = useState("");
  const [selectedServiceInfo, setSelectedServiceInfo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const { user } = useContext(AuthContext);

  // Fetch danh sách dịch vụ từ API (chỉ dịch vụ cho cư dân)
  useEffect(() => {
    setLoadingServices(true);
    fetch(`${API_URL}/dich-vu/available`) // Sử dụng route mới
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        setAvailableServices(data);
        setSubmitMessage("");
      })
      .catch((error) => {
        console.error("Lỗi fetch dịch vụ:", error);
        setSubmitMessage("Lỗi: Không tải được danh sách dịch vụ.");
        setAvailableServices([]);
      })
      .finally(() => setLoadingServices(false));
  }, []);

  // Cập nhật thông tin dịch vụ khi chọn
  useEffect(() => {
    if (selectedServiceId) {
      const service = availableServices.find(
        (s) => s.id_dich_vu === parseInt(selectedServiceId)
      );
      setSelectedServiceInfo(service);
    } else {
      setSelectedServiceInfo(null);
    }
  }, [selectedServiceId, availableServices]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitMessage("");
    setSuccess(false);

    // Comment phần kiểm tra này khi test không cần đăng nhập
    if (!user || !user.id_nguoi_dung) {
      setSubmitMessage(
        "Lỗi: Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
      );
      return;
    }

    if (!selectedServiceId || !ngayHen) {
      setSubmitMessage("Vui lòng chọn dịch vụ và thời gian hẹn.");
      return;
    }

    setIsSubmitting(true);

    const requestData = {
      tieu_de: `Yêu cầu ${selectedServiceInfo?.ten_dich_vu || "dịch vụ"}`,
      mo_ta: moTa.trim() || null,
      id_dich_vu: parseInt(selectedServiceId),
      id_cu_dan: user?.id_nguoi_dung || 1, // Sử dụng ID mặc định khi test
      ngay_hen: ngayHen,
      muc_do_uu_tien: "Trung_bình",
    };

    try {
      // Gửi đến route POST gốc
      const response = await fetch(`${API_URL}/yeu-cau-dich-vu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      const result = await response.json();
      if (response.ok) {
        setSubmitMessage(`Yêu cầu dịch vụ đã được gửi thành công!`);
        setSuccess(true);
        // Reset form
        setSelectedServiceId("");
        setNgayHen("");
        setMoTa("");
        setSelectedServiceInfo(null);
      } else {
        setSubmitMessage(
          `Gửi yêu cầu thất bại: ${result.error || "Lỗi không xác định"}`
        );
      }
    } catch (error) {
      console.error("Lỗi gửi yêu cầu API:", error);
      setSubmitMessage("Đã xảy ra lỗi mạng khi gửi yêu cầu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Yêu cầu Dịch vụ</h1>
        <p className="text-gray-600 mt-1">
          Đặt lịch sử dụng các dịch vụ tiện ích trong chung cư
        </p>
      </div>

      {/* Form yêu cầu dịch vụ */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Tạo yêu cầu dịch vụ mới
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label
                htmlFor="service"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Chọn dịch vụ <span className="text-red-500">*</span>
              </label>
              <select
                id="service"
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                required
                disabled={loadingServices || availableServices.length === 0}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
              >
                <option value="">
                  {loadingServices
                    ? "Đang tải..."
                    : availableServices.length === 0
                    ? "-- Không có dịch vụ --"
                    : "-- Chọn dịch vụ --"}
                </option>
                {availableServices.map((service) => (
                  <option key={service.id_dich_vu} value={service.id_dich_vu}>
                    {service.ten_dich_vu}
                  </option>
                ))}
              </select>
              {selectedServiceInfo && (
                <div className="mt-2 p-3 bg-blue-50 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Thông tin dịch vụ
                    </span>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {selectedServiceInfo.trang_thai || "Hoạt động"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Mô tả:</span>{" "}
                    {selectedServiceInfo.mo_ta || "Không có mô tả"}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Đơn giá:</span>{" "}
                    {selectedServiceInfo.don_gia?.toLocaleString("vi-VN")} VNĐ /{" "}
                    {selectedServiceInfo.don_vi_tinh}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="ngayHen"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Ngày giờ hẹn <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="ngayHen"
                value={ngayHen}
                onChange={(e) => setNgayHen(e.target.value)}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="moTa"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mô tả thêm (tùy chọn)
              </label>
              <textarea
                id="moTa"
                rows="3"
                value={moTa}
                onChange={(e) => setMoTa(e.target.value)}
                placeholder="Ví dụ: Yêu cầu đặt lịch bơi cho 2 người..."
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              ></textarea>
            </div>
          </div>

          {submitMessage && (
            <div
              className={`mt-4 p-3 rounded-md ${
                success
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {submitMessage}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 font-medium rounded-md shadow-sm text-white ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              }`}
            >
              {isSubmitting ? (
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
                "Gửi Yêu Cầu"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Thông tin bổ sung */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Lưu ý khi sử dụng dịch vụ
          </h2>
        </div>
        <div className="p-6">
          <div className="bg-amber-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-amber-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">
                  Thông tin về dịch vụ
                </h3>
                <div className="mt-2 text-sm text-amber-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Vui lòng đặt lịch trước ít nhất 24 giờ để đảm bảo dịch vụ
                      được chuẩn bị tốt nhất
                    </li>
                    <li>
                      Phí dịch vụ sẽ được tính vào hóa đơn tháng hoặc thanh toán
                      trực tiếp tùy loại dịch vụ
                    </li>
                    <li>
                      Nếu cần hủy hoặc thay đổi lịch, vui lòng thông báo trước
                      ít nhất 4 giờ
                    </li>
                    <li>
                      Mọi thắc mắc xin liên hệ ban quản lý qua số điện thoại:{" "}
                      <span className="font-medium">0123 456 789</span>
                    </li>
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

export default ResidentServiceRequest;
