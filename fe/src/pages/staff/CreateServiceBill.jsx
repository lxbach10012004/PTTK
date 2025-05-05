// filepath: d:\course\PTTKHTTT\PTTK\fe\src\pages\staff\CreateServiceBill.jsx
import React, { useState, useEffect } from 'react';

const API_URL = 'http://172.21.92.186:5000/api'; // Thay IP nếu cần

function CreateServiceBill() {
  const [completedRequests, setCompletedRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch các yêu cầu đã hoàn thành
  useEffect(() => {
    setLoadingRequests(true);
    setMessage('');
    fetch(`${API_URL}/yeu-cau-dich-vu?status=Hoàn_thành`) // Lấy yêu cầu đã hoàn thành
      .then(res => res.ok ? res.json() : res.json().then(err => Promise.reject(err)))
      .then(data => {
        // TODO: Lọc thêm các yêu cầu chưa có hóa đơn (cần API hỗ trợ hoặc lọc phía client)
        setCompletedRequests(data);
      })
      .catch(err => {
        console.error("Lỗi fetch yêu cầu hoàn thành:", err);
        setMessage(`Lỗi tải yêu cầu: ${err.error || 'Lỗi không xác định'}`);
        setCompletedRequests([]);
      })
      .finally(() => setLoadingRequests(false));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedRequestId) {
      setMessage('Vui lòng chọn một yêu cầu đã hoàn thành.');
      return;
    }
    setIsSubmitting(true);
    setMessage('');
    try {
      const response = await fetch(`${API_URL}/hoa-don/dich-vu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_yeu_cau: parseInt(selectedRequestId) }),
      });
      const result = await response.json();
      if (!response.ok) throw result;
      setMessage(`Tạo hóa đơn ${result.bill?.so_hoa_don || ''} cho yêu cầu #${selectedRequestId} thành công!`);
      setSelectedRequestId(''); // Reset selection
      // TODO: Nên xóa yêu cầu đã tạo hóa đơn khỏi danh sách chọn
    } catch (err) {
      console.error("Lỗi tạo hóa đơn dịch vụ:", err);
      setMessage(`Tạo hóa đơn thất bại: ${err.error || 'Lỗi không xác định'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">Tạo Hóa đơn Dịch vụ</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="requestSelect" className="block text-sm font-medium text-gray-700 mb-1">
            Chọn yêu cầu đã hoàn thành <span className="text-red-500">*</span>
          </label>
          <select
            id="requestSelect"
            value={selectedRequestId}
            onChange={(e) => setSelectedRequestId(e.target.value)}
            required
            disabled={loadingRequests || completedRequests.length === 0}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
          >
            <option value="">{loadingRequests ? "Đang tải..." : (completedRequests.length === 0 ? "-- Không có yêu cầu phù hợp --" : "-- Chọn yêu cầu --")}</option>
            {completedRequests.map((req) => (
              <option key={req.id_yeu_cau} value={req.id_yeu_cau}>
                #{req.id_yeu_cau} - {req.ten_dich_vu} (Cư dân: {req.ten_cu_dan || req.id_cu_dan})
              </option>
            ))}
          </select>
        </div>

        {message && (
          <p className={`text-sm ${message.includes('thất bại') || message.includes('Lỗi') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={isSubmitting || loadingRequests || !selectedRequestId}
            className={`w-full py-2 px-4 font-semibold rounded-md shadow text-white ${
              isSubmitting || loadingRequests || !selectedRequestId
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isSubmitting ? 'Đang tạo...' : 'Tạo Hóa đơn'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateServiceBill;