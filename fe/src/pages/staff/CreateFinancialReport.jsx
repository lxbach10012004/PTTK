// filepath: d:\course\PTTKHTTT\PTTK\fe\src\pages\staff\CreateFinancialReport.jsx
import React, { useState } from 'react';

const API_URL = 'http://172.21.92.186:5000/api'; // Thay IP nếu cần

function CreateFinancialReport() {
  const [tieuDe, setTieuDe] = useState('');
  const [moTa, setMoTa] = useState('');
  const [tongThu, setTongThu] = useState('');
  const [tongChi, setTongChi] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!tieuDe.trim() || tongThu === '' || tongChi === '' || parseFloat(tongThu) < 0 || parseFloat(tongChi) < 0) {
      setMessage('Vui lòng nhập tiêu đề và số tiền thu/chi hợp lệ (>= 0).');
      return;
    }
    setIsSubmitting(true);
    setMessage('');
    try {
      const response = await fetch(`${API_URL}/bao-cao/thu-chi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tieu_de: tieuDe.trim(),
          mo_ta: moTa.trim() || null,
          tong_thu: parseFloat(tongThu),
          tong_chi: parseFloat(tongChi),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw result;
      setMessage(`Tạo báo cáo #${result.report?.id_bao_cao_thu_chi || ''} thành công!`);
      setTieuDe(''); // Reset form
      setMoTa('');
      setTongThu('');
      setTongChi('');
    } catch (err) {
      console.error("Lỗi tạo báo cáo thu chi:", err);
      setMessage(`Tạo báo cáo thất bại: ${err.error || 'Lỗi không xác định'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md max-w-lg mx-auto">
      <h1 className="text-xl font-semibold mb-4">Tạo Báo cáo Thu Chi</h1>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ví dụ: Báo cáo thu chi tháng 5/2025"
          />
        </div>
         <div>
          <label htmlFor="moTa" className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả (tùy chọn)
          </label>
          <textarea
            id="moTa"
            rows="3"
            value={moTa}
            onChange={(e) => setMoTa(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Mô tả chi tiết nội dung báo cáo..."
          ></textarea>
        </div>
         <div>
          <label htmlFor="tongThu" className="block text-sm font-medium text-gray-700 mb-1">
            Tổng thu (VNĐ) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="tongThu"
            value={tongThu}
            onChange={(e) => setTongThu(e.target.value)}
            required
            min="0"
            step="1000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="0"
          />
        </div>
         <div>
          <label htmlFor="tongChi" className="block text-sm font-medium text-gray-700 mb-1">
            Tổng chi (VNĐ) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="tongChi"
            value={tongChi}
            onChange={(e) => setTongChi(e.target.value)}
            required
            min="0"
            step="1000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="0"
          />
        </div>

        {message && (
          <p className={`text-sm ${message.includes('thất bại') || message.includes('Lỗi') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={isSubmitting || !tieuDe || tongThu === '' || tongChi === ''}
            className={`w-full py-2 px-4 font-semibold rounded-md shadow text-white ${
              isSubmitting || !tieuDe || tongThu === '' || tongChi === ''
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isSubmitting ? 'Đang tạo...' : 'Tạo Báo cáo'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateFinancialReport;