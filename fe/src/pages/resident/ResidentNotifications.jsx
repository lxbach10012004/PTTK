// filepath: d:\course\PTTKHTTT\PTTK\fe\src\pages\resident\ResidentNotifications.jsx
import React, { useState, useEffect } from 'react';

// --- Bỏ hàm giả lập ---
// const fetchNotifications = async () => { ... };

const API_URL = 'http://172.21.92.186:5000/api'; // Thay IP nếu cần

// Hàm định dạng ngày giờ
const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    try {
        const date = new Date(dateTimeString);
        return date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
    } catch (e) { return dateTimeString; }
};

function ResidentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/thong-bao`) // Gọi API thực tế
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => {
        setNotifications(data);
      })
      .catch(err => {
        console.error("Lỗi fetch thông báo:", err);
        setError("Không thể tải danh sách thông báo.");
        setNotifications([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center p-4">Đang tải thông báo...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded shadow-md">
      <h1 className="text-xl font-semibold mb-4">Thông báo</h1>
      {notifications.length === 0 ? (
        <p>Hiện chưa có thông báo nào.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((noti) => (
            <li key={noti.id_thong_bao} className="border p-4 rounded-md hover:shadow-sm transition-shadow">
              <h3 className="text-md font-semibold text-blue-700 mb-1">{noti.tieu_de}</h3>
              <p className="text-sm text-gray-700 mb-2">{noti.noi_dung}</p>
              <p className="text-xs text-gray-500 text-right">Gửi lúc: {formatDateTime(noti.ngay_gui)}</p>
              {/* TODO: Lấy tên người gửi nếu API trả về id_nhan_vien và có thể join */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ResidentNotifications;