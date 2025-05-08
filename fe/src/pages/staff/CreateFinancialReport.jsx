// filepath: d:\course\PTTKHTTT\PTTK\fe\src\pages\staff\CreateFinancialReport.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const API_URL = 'https://mmncb6j3-5000.asse.devtunnels.ms/api'; // Thay IP nếu cần

function CreateFinancialReport() {
  const { user } = useContext(AuthContext);
  const [tieuDe, setTieuDe] = useState('');
  const [moTa, setMoTa] = useState('');
  const [tongThu, setTongThu] = useState('');
  const [tongChi, setTongChi] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

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
          id_nguoi_tao: user?.id_nguoi_dung,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw result;
      setMessage(`Tạo báo cáo #${result.report?.id_bao_cao_thu_chi || ''} thành công!`);
      setTieuDe('');
      setMoTa('');
      setTongThu('');
      setTongChi('');
    } catch (err) {
      setMessage(`Tạo báo cáo thất bại: ${err.error || 'Lỗi không xác định'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('vi-VN', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
  };

  const handleExport = (id) => {
    console.log('Exporting report with ID:', id);
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Tạo Báo cáo Tài chính</h1>
        <p className="text-gray-600 mt-1">Lập báo cáo tổng hợp thu chi tài chính cho tòa nhà</p>
      </div>

      {/* Form tạo báo cáo */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Thông tin báo cáo</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {message && (
            <div className={`p-3 rounded-md text-sm ${message.includes('thất bại') || message.includes('Lỗi') ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
              {message}
            </div>
          )}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500"
              placeholder="0"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isSubmitting || !tieuDe || tongThu === '' || tongChi === ''}
              className={`w-full py-2 px-4 font-semibold rounded-md shadow text-white ${
                isSubmitting || !tieuDe || tongThu === '' || tongChi === ''
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500'
              }`}
            >
              {isSubmitting ? 'Đang tạo...' : 'Tạo Báo cáo'}
            </button>
          </div>
        </form>
      </div>

      {/* Thông tin bổ sung */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Hướng dẫn</h2>
        </div>
        <div className="p-6">
          <div className="bg-blue-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Hướng dẫn lập báo cáo thu chi</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Nhập tiêu đề rõ ràng cho báo cáo (ví dụ: "Báo cáo thu chi tháng 5/2025").</li>
                    <li>Ghi chú mô tả nội dung báo cáo nếu cần.</li>
                    <li>Nhập tổng số tiền thu và tổng số tiền chi thực tế của kỳ báo cáo.</li>
                    <li>Kiểm tra kỹ số liệu trước khi xác nhận tạo báo cáo.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chi tiết báo cáo Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Chi tiết báo cáo</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Đóng</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tiêu đề</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedReport.tieu_de}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Kỳ báo cáo</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedReport.ky_bao_cao}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Thời gian</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(selectedReport.thoi_gian_bat_dau)} - {formatDate(selectedReport.thoi_gian_ket_thuc)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tổng thu</dt>
                  <dd className="mt-1 text-sm font-medium text-green-600">{formatCurrency(selectedReport.tong_thu)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tổng chi</dt>
                  <dd className="mt-1 text-sm font-medium text-red-600">{formatCurrency(selectedReport.tong_chi)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Chênh lệch</dt>
                  <dd className="mt-1 text-sm font-medium">
                    <span className={selectedReport.tong_thu - selectedReport.tong_chi >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(selectedReport.tong_thu - selectedReport.tong_chi)}
                    </span>
                  </dd>
                </div>
                {selectedReport.ghi_chu && (
                  <div className="col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Ghi chú</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedReport.ghi_chu}</dd>
                  </div>
                )}
              </dl>
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => handleExport(selectedReport.id_bao_cao)}
                className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
              >
                Xuất PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateFinancialReport;