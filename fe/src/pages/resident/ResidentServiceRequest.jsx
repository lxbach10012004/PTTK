// filepath: d:\course\PTTKHTTT\PTTK\fe\src\pages\resident\ResidentServiceRequest.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const API_URL = 'http://172.21.92.186:5000/api';

function ResidentServiceRequest() {
  const [availableServices, setAvailableServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [ngayHen, setNgayHen] = useState('');
  const [moTa, setMoTa] = useState('');
  const [selectedServiceInfo, setSelectedServiceInfo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const { user } = useContext(AuthContext);

  // Fetch danh sách dịch vụ từ API (chỉ dịch vụ cho cư dân)
  useEffect(() => {
    setLoadingServices(true);
    fetch(`${API_URL}/dich-vu/available`) // Sử dụng route mới
      .then(res => {
        if (!res.ok) { throw new Error('Network response was not ok'); }
        return res.json();
      })
      .then(data => {
        setAvailableServices(data);
        setSubmitMessage('');
      })
      .catch(error => {
        console.error("Lỗi fetch dịch vụ:", error);
        setSubmitMessage("Lỗi: Không tải được danh sách dịch vụ.");
        setAvailableServices([]);
      })
      .finally(() => setLoadingServices(false));
  }, []);

  // ... (useEffect cập nhật selectedServiceInfo giữ nguyên) ...
   useEffect(() => {
    if (selectedServiceId) {
      const service = availableServices.find(s => s.id_dich_vu === parseInt(selectedServiceId));
      setSelectedServiceInfo(service);
    } else {
      setSelectedServiceInfo(null);
    }
  }, [selectedServiceId, availableServices]);


  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitMessage('');

    if (!user || !user.id_nguoi_dung) { /* ... */ return; }
    if (!selectedServiceId || !ngayHen) { /* ... */ return; }

    setIsSubmitting(true);

    const requestData = {
      tieu_de: `Yêu cầu ${selectedServiceInfo?.ten_dich_vu || 'dịch vụ'}`,
      mo_ta: moTa.trim() || null,
      id_dich_vu: parseInt(selectedServiceId),
      // id_cu_dan sẽ được controller tự động thêm dựa vào login
      ngay_hen: ngayHen,
      muc_do_uu_tien: 'Trung_bình',
    };

    console.log('Dữ liệu yêu cầu gửi đi:', requestData);

    try {
      // Gửi đến route POST gốc
      const response = await fetch(`${API_URL}/yeu-cau-dich-vu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
      const result = await response.json();
      if (response.ok) {
        setSubmitMessage(`Đã gửi yêu cầu #${result.request?.id_yeu_cau || ''} thành công!`);
        // Reset form
        setSelectedServiceId(''); setNgayHen(''); setMoTa(''); setSelectedServiceInfo(null);
      } else {
        setSubmitMessage(`Gửi yêu cầu thất bại: ${result.error || 'Lỗi không xác định'}`);
      }
    } catch (error) {
      console.error('Lỗi gửi yêu cầu API:', error);
      setSubmitMessage('Đã xảy ra lỗi mạng khi gửi yêu cầu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... (phần render JSX giữ nguyên) ...
   return (
    <div className="bg-white p-6 rounded shadow-md">
      <h1 className="text-xl font-semibold mb-4">Yêu cầu Dịch vụ</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
            Chọn dịch vụ <span className="text-red-500">*</span>
          </label>
          <select
            id="service"
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            required
            disabled={loadingServices || availableServices.length === 0}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
          >
            <option value="">{loadingServices ? "Đang tải..." : (availableServices.length === 0 ? "-- Không có dịch vụ --" : "-- Chọn dịch vụ --")}</option>
            {availableServices.map((service) => (
              <option key={service.id_dich_vu} value={service.id_dich_vu}>
                {service.ten_dich_vu}
              </option>
            ))}
          </select>
          {selectedServiceInfo && (
             <p className="text-sm text-gray-500 mt-1">
               Đơn giá: {selectedServiceInfo.don_gia?.toLocaleString('vi-VN')} VNĐ / {selectedServiceInfo.don_vi_tinh}
             </p>
          )}
        </div>

        <div>
          <label htmlFor="ngayHen" className="block text-sm font-medium text-gray-700 mb-1">
            Ngày giờ hẹn <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            id="ngayHen"
            value={ngayHen}
            onChange={(e) => setNgayHen(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="moTa" className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả thêm (tùy chọn)
          </label>
          <textarea
            id="moTa"
            rows="3"
            value={moTa}
            onChange={(e) => setMoTa(e.target.value)}
            placeholder="Ví dụ: Yêu cầu đặt lịch bơi cho 2 người..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          ></textarea>
        </div>

        {submitMessage && (
          <p className={`text-sm ${submitMessage.includes('thành công') ? 'text-green-600' : 'text-red-600'}`}>
            {submitMessage}
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={isSubmitting || !user}
            className={`w-full py-2 px-4 font-semibold rounded-md shadow text-white ${
              isSubmitting || !user
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
          </button>
           {!user && <p className="text-xs text-red-500 mt-1">Vui lòng đăng nhập để gửi yêu cầu.</p>}
        </div>
      </form>
    </div>
  );
}

export default ResidentServiceRequest;