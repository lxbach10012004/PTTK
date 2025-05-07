// filepath: d:\course\PTTKHTTT\PTTK\fe\src\pages\staff\CreateFinancialReport.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const API_URL = 'https://mmncb6j3-5000.asse.devtunnels.ms/api'; // Thay IP nếu cần

function CreateFinancialReport() {
  const { user } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    tieu_de: '',
    ky_bao_cao: '',
    thoi_gian_bat_dau: '',
    thoi_gian_ket_thuc: '',
    ghi_chu: '',
  });
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.tieu_de.trim()) {
      setError('Vui lòng nhập tiêu đề báo cáo');
      return;
    }

    if (!formData.ky_bao_cao) {
      setError('Vui lòng chọn kỳ báo cáo');
      return;
    }

    if (!formData.thoi_gian_bat_dau || !formData.thoi_gian_ket_thuc) {
      setError('Vui lòng nhập thời gian báo cáo');
      return;
    }

    const thuChiData = {
      ...formData,
      id_nguoi_tao: user?.id_nguoi_dung,
    };

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/bao-cao/thu-chi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(thuChiData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Không thể tạo báo cáo');
      }

      setSuccess('Đã tạo báo cáo thu chi thành công!');
      setFormData({
        tieu_de: '',
        ky_bao_cao: '',
        thoi_gian_bat_dau: '',
        thoi_gian_ket_thuc: '',
        ghi_chu: '',
      });
    } catch (err) {
      console.error('Lỗi khi tạo báo cáo:', err);
      setError(err.message || 'Đã xảy ra lỗi khi tạo báo cáo');
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
        <p className="text-gray-600 mt-1">Tạo báo cáo tài chính theo kỳ</p>
      </div>

      {/* Form tạo báo cáo */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Thông tin báo cáo</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-4 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 rounded-md bg-green-50 border border-green-200">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label htmlFor="tieu_de" className="block text-sm font-medium text-gray-700">
                Tiêu đề báo cáo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="tieu_de"
                id="tieu_de"
                value={formData.tieu_de}
                onChange={handleInputChange}
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="ky_bao_cao" className="block text-sm font-medium text-gray-700">
                Kỳ báo cáo <span className="text-red-500">*</span>
              </label>
              <select
                name="ky_bao_cao"
                id="ky_bao_cao"
                value={formData.ky_bao_cao}
                onChange={handleInputChange}
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Chọn kỳ báo cáo</option>
                <option value="Thang">Tháng</option>
                <option value="Quy">Quý</option>
                <option value="Nam">Năm</option>
              </select>
            </div>

            <div>
              <label htmlFor="thoi_gian_bat_dau" className="block text-sm font-medium text-gray-700">
                Thời gian bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="thoi_gian_bat_dau"
                id="thoi_gian_bat_dau"
                value={formData.thoi_gian_bat_dau}
                onChange={handleInputChange}
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="thoi_gian_ket_thuc" className="block text-sm font-medium text-gray-700">
                Thời gian kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="thoi_gian_ket_thuc"
                id="thoi_gian_ket_thuc"
                value={formData.thoi_gian_ket_thuc}
                onChange={handleInputChange}
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label htmlFor="ghi_chu" className="block text-sm font-medium text-gray-700">
                Ghi chú
              </label>
              <textarea
                name="ghi_chu"
                id="ghi_chu"
                rows="3"
                value={formData.ghi_chu}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 font-medium rounded-md shadow-sm text-white ${
                isSubmitting
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
                  Đang tạo...
                </span>
              ) : 'Tạo báo cáo'}
            </button>
          </div>
        </form>
      </div>

      {/* Danh sách báo cáo */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Báo cáo đã tạo</h2>
        </div>

        <div className="p-6">
          {loading && !reports.length ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Đang tải...</span>
            </div>
          ) : null}

          {!loading && reports.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Chưa có báo cáo nào.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tiêu đề</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kỳ báo cáo</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tổng thu</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tổng chi</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report.id_bao_cao} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">{report.id_bao_cao}</td>
                      <td className="px-4 py-2 text-sm font-medium">{report.tieu_de}</td>
                      <td className="px-4 py-2 text-sm">{report.ky_bao_cao}</td>
                      <td className="px-4 py-2 text-sm">
                        {formatDate(report.thoi_gian_bat_dau)} - {formatDate(report.thoi_gian_ket_thuc)}
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-green-600">{formatCurrency(report.tong_thu)}</td>
                      <td className="px-4 py-2 text-sm font-medium text-red-600">{formatCurrency(report.tong_chi)}</td>
                      <td className="px-4 py-2 text-sm whitespace-nowrap">
                        <button
                          onClick={() => handleViewDetails(report)}
                          className="text-blue-600 hover:text-blue-800 mr-3 focus:outline-none focus:underline"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => handleExport(report.id_bao_cao)}
                          className="text-blue-600 hover:text-blue-800 focus:outline-none focus:underline"
                        >
                          Xuất PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
                <h3 className="text-sm font-medium text-blue-800">Thông tin về báo cáo tài chính</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Báo cáo tài chính được tạo theo kỳ (tháng, quý, năm)</li>
                    <li>Đảm bảo chọn đúng khoảng thời gian để báo cáo chính xác</li>
                    <li>Hệ thống sẽ tự động tổng hợp các khoản thu chi trong khoảng thời gian được chọn</li>
                    <li>Có thể xuất báo cáo dưới dạng PDF để lưu trữ hoặc in ấn</li>
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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