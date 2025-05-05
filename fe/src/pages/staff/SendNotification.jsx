// filepath: d:\course\PTTKHTTT\PTTK\fe\src\pages\staff\SendNotification.jsx
import React, { useState } from 'react';

const API_URL = 'http://172.21.92.186:5000/api'; // Thay IP nếu cần

function SendNotification() {
  const [tieuDe, setTieuDe] = useState('');
  const [noiDung, setNoiDung] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!tieuDe.trim() || !noiDung.trim()) {
      setMessage('Vui lòng nhập tiêu đề và nội dung thông báo.');
      return;
    }
    setIsSubmitting(true);
    setMessage('');
    try {
      const response = await fetch(`${API_URL}/thong-bao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tieu_de: tieuDe.trim(),
          noi_dung: noiDung.trim(),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw result;
      setMessage(`Gửi thông báo #${result.notification?.id_thong_bao || ''} thành công!`);
      setTieuDe(''); // Reset form
      setNoiDung('');
    } catch (err) {
      console.error("Lỗi gửi thông báo:", err);
      setMessage(`Gửi thông báo thất bại: ${err.error || 'Lỗi không xác định'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md max-w-lg mx-auto">
      <h1 className="text-xl font-semibold mb-4">Gửi Thông báo Chung</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tieuDeNoti" className="block text-sm font-medium text-gray-700 mb-1">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="tieuDeNoti"
            value={tieuDe}
            onChange={(e) => setTieuDe(e.target.value)}
            required
            maxLength="200"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ví dụ: Lịch cắt nước tòa A"
          />
        </div>

        <div>
          <label htmlFor="noiDungNoti" className="block text-sm font-medium text-gray-700 mb-1">
            Nội dung <span className="text-red-500">*</span>
          </label>
          <textarea
            id="noiDungNoti"
            rows="5"
            value={noiDung}
            onChange={(e) => setNoiDung(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Nội dung chi tiết của thông báo..."
          ></textarea>
        </div>

        {message && (
          <p className={`text-sm ${message.includes('thất bại') || message.includes('Lỗi') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={isSubmitting || !tieuDe || !noiDung}
            className={`w-full py-2 px-4 font-semibold rounded-md shadow text-white ${
              isSubmitting || !tieuDe || !noiDung
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi Thông báo'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SendNotification;