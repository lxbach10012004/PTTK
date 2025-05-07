// filepath: d:\course\PTTKHTTT\PTTK\fe\src\pages\staff\SendNotification.jsx
import React, { useState } from 'react';

const API_URL = 'https://mmncb6j3-5000.asse.devtunnels.ms/api'; // Thay IP nếu cần

function SendNotification() {
  const [tieuDe, setTieuDe] = useState('');
  const [noiDung, setNoiDung] = useState('');
  const [loaiThongBao, setLoaiThongBao] = useState('Thông_báo_chung');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!tieuDe.trim() || !noiDung.trim()) {
      setMessage('Vui lòng nhập tiêu đề và nội dung thông báo.');
      setSuccess(false);
      return;
    }
    setIsSubmitting(true);
    setMessage('');
    setSuccess(false);
    try {
      const response = await fetch(`${API_URL}/thong-bao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tieu_de: tieuDe.trim(),
          noi_dung: noiDung.trim(),
          loai_thong_bao: loaiThongBao
        }),
      });
      const result = await response.json();
      if (!response.ok) throw result;
      setMessage(`Gửi thông báo #${result.notification?.id_thong_bao || ''} thành công!`);
      setSuccess(true);
      setTieuDe(''); // Reset form
      setNoiDung('');
    } catch (err) {
      console.error("Lỗi gửi thông báo:", err);
      setMessage(`Gửi thông báo thất bại: ${err.error || 'Lỗi không xác định'}`);
      setSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Gửi Thông Báo</h1>
        <p className="text-gray-600 mt-1">Tạo và gửi thông báo đến cư dân trong tòa nhà</p>
      </div>
      
      {/* Form gửi thông báo */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">Tạo thông báo mới</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="loaiThongBao" className="block text-sm font-medium text-gray-700 mb-1">
                Loại thông báo
              </label>
              <select
                id="loaiThongBao"
                value={loaiThongBao}
                onChange={(e) => setLoaiThongBao(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="Thông_báo_chung">Thông báo chung</option>
                <option value="Bảo_trì">Bảo trì</option>
                <option value="Khẩn_cấp">Khẩn cấp</option>
                <option value="Thanh_toán">Thanh toán</option>
              </select>
            </div>
            
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Nội dung chi tiết của thông báo..."
              ></textarea>
            </div>

            {message && (
              <div className={`p-4 rounded-md ${success ? 'bg-green-50 border border-green-300' : 'bg-red-50 border border-red-300'}`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {success ? (
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${success ? 'text-green-800' : 'text-red-800'}`}>{message}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={isSubmitting || !tieuDe.trim() || !noiDung.trim()}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                  isSubmitting || !tieuDe.trim() || !noiDung.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang gửi...
                  </span>
                ) : 'Gửi Thông Báo'}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {/* Phần hướng dẫn */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">Hướng dẫn gửi thông báo</h2>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-1">Loại thông báo</h3>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li><span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Thông báo chung</span>: Các thông báo thông thường như thông báo họp, sự kiện...</li>
                <li><span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Bảo trì</span>: Thông báo về việc bảo trì, sửa chữa cơ sở vật chất</li>
                <li><span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">Khẩn cấp</span>: Thông báo cần chú ý ngay như cháy, ngập lụt, mất an ninh</li>
                <li><span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">Thanh toán</span>: Nhắc nhở về các khoản phí cần thanh toán</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-1">Lưu ý khi gửi thông báo</h3>
              <ul className="list-disc pl-5 text-sm text-gray-600">
                <li>Nội dung thông báo nên rõ ràng, đủ thông tin thời gian, địa điểm (nếu có)</li>
                <li>Với thông báo khẩn cấp, cần cung cấp hành động cụ thể người dân cần làm</li>
                <li>Thông báo sẽ được gửi đến tất cả cư dân trong hệ thống</li>
                <li>Sau khi gửi không thể thu hồi hoặc chỉnh sửa thông báo</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SendNotification;