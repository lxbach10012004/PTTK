// filepath: d:\course\PTTKHTTT\PTTK\fe\src\pages\staff\ViewFeedback.jsx
import React, { useState, useEffect } from 'react';

const API_URL = 'http://172.21.92.186:5000/api'; // Thay IP nếu cần

// Hàm định dạng ngày giờ (có thể import từ utils)
const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    try {
        const date = new Date(dateTimeString);
        return date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
    } catch (e) { return dateTimeString; }
};

// Hàm định dạng trạng thái phản hồi (nếu có)
const formatFeedbackStatus = (status) => {
    // Tùy chỉnh theo các trạng thái bạn định nghĩa (Mới, Đã xem, Đã xử lý...)
    switch (status) {
        case 'Mới': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Mới</span>;
        case 'Đã_xem': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Đã xem</span>;
        // Thêm các trạng thái khác
        default: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status || 'N/A'}</span>;
    }
};


function ViewFeedback() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/phan-hoi-cu-dan`) // API lấy tất cả phản hồi
      .then(res => res.ok ? res.json() : res.json().then(err => Promise.reject(err)))
      .then(data => {
        setFeedbackList(data);
      })
      .catch(err => {
        console.error("Lỗi fetch phản hồi:", err);
        setError(`Không thể tải danh sách phản hồi: ${err.error || 'Lỗi không xác định'}`);
        setFeedbackList([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4 text-center">Đang tải danh sách phản hồi...</div>;
  if (error) return <div className="p-4 text-center text-red-600">{error}</div>;

  return (
    <div className="bg-white p-6 rounded shadow-md">
      <h1 className="text-xl font-semibold mb-4">Xem Phản hồi từ Cư dân</h1>

      {feedbackList.length === 0 ? (
        <p>Chưa có phản hồi nào từ cư dân.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cư dân</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nội dung</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày gửi</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                {/* Thêm cột hành động nếu cần (ví dụ: Đánh dấu đã đọc) */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feedbackList.map((fb) => (
                <tr key={fb.id_phan_hoi}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fb.id_phan_hoi}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fb.ten_cu_dan || `ID: ${fb.id_cu_dan}`}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fb.tieu_de}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{fb.noi_dung}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(fb.ngay_gui)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatFeedbackStatus(fb.trang_thai)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ViewFeedback;