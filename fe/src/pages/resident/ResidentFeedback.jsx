// filepath: d:\course\PTTKHTTT\PTTK\fe\src\pages\resident\ResidentFeedback.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const API_URL = 'http://172.21.92.186:5000/api'; // Thay IP nếu cần

function ResidentFeedback() {
  const [tieuDe, setTieuDe] = useState('');
  const [noiDung, setNoiDung] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const { user } = useContext(AuthContext);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitMessage(''); // Reset thông báo

    if (!user || !user.id_nguoi_dung) {
        setSubmitMessage('Lỗi: Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
        return;
    }
    if (!tieuDe.trim() || !noiDung.trim()) {
        setSubmitMessage('Vui lòng nhập cả tiêu đề và nội dung phản hồi.');
        return;
    }

    setIsSubmitting(true);

    const feedbackData = {
      id_cu_dan: user.id_nguoi_dung,
      tieu_de: tieuDe.trim(),
      noi_dung: noiDung.trim(),
    };

    console.log('Dữ liệu phản hồi gửi đi:', feedbackData);

    try {
        const response = await fetch(`${API_URL}/phan-hoi-cu-dan`, { // Gọi API thực tế
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(feedbackData),
        });
        const result = await response.json();

        if (response.ok) {
            setSubmitMessage(`Gửi phản hồi #${result.feedback?.id_phan_hoi || ''} thành công!`);
            setTieuDe(''); // Reset form
            setNoiDung('');
        } else {
             setSubmitMessage(`Gửi phản hồi thất bại: ${result.error || 'Lỗi không xác định'}`);
        }
    } catch (error) {
        console.error("Lỗi gửi phản hồi API:", error);
        setSubmitMessage('Đã xảy ra lỗi mạng khi gửi phản hồi.');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md">
      <h1 className="text-xl font-semibold mb-4">Gửi Phản hồi / Góp ý</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tieuDe" className="block text-sm font-medium text-gray-700 mb-1">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="tieuDe"
            value={tieuDe}
            onChange={(e) => setTieuDe(e.target.value)}
            required
            maxLength="200"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ví dụ: Góp ý về vệ sinh hành lang"
          />
        </div>

        <div>
          <label htmlFor="noiDung" className="block text-sm font-medium text-gray-700 mb-1">
            Nội dung <span className="text-red-500">*</span>
          </label>
          <textarea
            id="noiDung"
            rows="5"
            value={noiDung}
            onChange={(e) => setNoiDung(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Nội dung chi tiết phản hồi của bạn..."
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
            {isSubmitting ? 'Đang gửi...' : 'Gửi Phản hồi'}
          </button>
          {!user && <p className="text-xs text-red-500 mt-1">Vui lòng đăng nhập để gửi phản hồi.</p>}
        </div>
      </form>
    </div>
  );
}

export default ResidentFeedback;