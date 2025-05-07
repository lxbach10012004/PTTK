// filepath: d:\course\PTTKHTTT\PTTK\fe\src\pages\staff\CreateServiceBill.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const API_URL = 'https://mmncb6j3-5000.asse.devtunnels.ms/api'; // Thay IP nếu cần

// Format định dạng ngày
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '-';
  try {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateTimeStr;
  }
};

function CreateServiceBill() {
  const [completedRequests, setCompletedRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [selectedRequestInfo, setSelectedRequestInfo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const { user } = useContext(AuthContext);

  // Fetch các yêu cầu đã hoàn thành
  useEffect(() => {
    // Comment phần kiểm tra đăng nhập để test không cần đăng nhập
    /* if (!user || user.vai_tro !== 'NhanVien') {
      setMessage('Bạn không có quyền truy cập chức năng này');
      setLoadingRequests(false);
      return;
    } */

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
        setSuccess(false);
        setCompletedRequests([]);
      })
      .finally(() => setLoadingRequests(false));
  }, [user]);

  // Cập nhật thông tin yêu cầu chi tiết khi chọn
  useEffect(() => {
    if (selectedRequestId) {
      const request = completedRequests.find(req => req.id_yeu_cau === parseInt(selectedRequestId));
      setSelectedRequestInfo(request || null);
    } else {
      setSelectedRequestInfo(null);
    }
  }, [selectedRequestId, completedRequests]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedRequestId) {
      setMessage('Vui lòng chọn một yêu cầu đã hoàn thành.');
      setSuccess(false);
      return;
    }
    setIsSubmitting(true);
    setMessage('');
    setSuccess(false);
    
    try {
      const response = await fetch(`${API_URL}/hoa-don/dich-vu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_yeu_cau: parseInt(selectedRequestId),
          id_nhan_vien: user?.id_nguoi_dung || 1 // Sử dụng ID mặc định khi test
        }),
      });
      
      const result = await response.json();
      if (!response.ok) throw result;
      
      setMessage(`Tạo hóa đơn ${result.bill?.so_hoa_don || ''} cho yêu cầu #${selectedRequestId} thành công!`);
      setSuccess(true);
      setSelectedRequestId(''); // Reset selection
      setSelectedRequestInfo(null);
      
      // Xóa yêu cầu đã tạo hóa đơn khỏi danh sách chọn
      setCompletedRequests(prev => prev.filter(req => req.id_yeu_cau !== parseInt(selectedRequestId)));
    } catch (err) {
      console.error("Lỗi tạo hóa đơn dịch vụ:", err);
      setMessage(`Tạo hóa đơn thất bại: ${err.error || 'Lỗi không xác định'}`);
      setSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Tạo Hóa đơn Dịch vụ</h1>
        <p className="text-gray-600 mt-1">Tạo hóa đơn cho các yêu cầu dịch vụ đã hoàn thành</p>
      </div>
      
      {/* Form tạo hóa đơn */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Thông tin hóa đơn dịch vụ</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500 disabled:bg-gray-100 text-sm"
              >
                <option value="">{
                  loadingRequests 
                    ? "Đang tải..." 
                    : (completedRequests.length === 0 
                        ? "-- Không có yêu cầu phù hợp --" 
                        : "-- Chọn yêu cầu --")
                }</option>
                {completedRequests.map((req) => (
                  <option key={req.id_yeu_cau} value={req.id_yeu_cau}>
                    #{req.id_yeu_cau} - {req.ten_dich_vu} (Cư dân: {req.ten_cu_dan || req.id_cu_dan})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Hiển thị chi tiết yêu cầu được chọn */}
            {selectedRequestInfo && (
              <div className="bg-rose-50 p-4 rounded-md">
                <h3 className="font-medium text-lg text-rose-800">{selectedRequestInfo.tieu_de}</h3>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Dịch vụ:</p>
                    <p className="font-medium">{selectedRequestInfo.ten_dich_vu}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Cư dân yêu cầu:</p>
                    <p className="font-medium">{selectedRequestInfo.ten_cu_dan || `ID: ${selectedRequestInfo.id_cu_dan}`}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Đơn giá:</p>
                    <p className="font-medium">
                      {selectedRequestInfo.don_gia ? 
                        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedRequestInfo.don_gia) 
                        : 'Không có thông tin'}
                      {selectedRequestInfo.don_vi_tinh ? ` / ${selectedRequestInfo.don_vi_tinh}` : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Ngày hẹn:</p>
                    <p className="font-medium">{formatDateTime(selectedRequestInfo.ngay_hen)}</p>
                  </div>
                  {selectedRequestInfo.mo_ta && (
                    <div className="col-span-2">
                      <p className="text-gray-600">Mô tả yêu cầu:</p>
                      <p className="font-medium">{selectedRequestInfo.mo_ta}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {message && (
              <div className={`p-3 rounded-md ${success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message}
              </div>
            )}

            <div className="mt-6 flex items-center space-x-3">
              <button
                type="submit"
                disabled={isSubmitting || loadingRequests || !selectedRequestId}
                className={`px-6 py-2.5 font-medium rounded-md shadow-sm text-white ${
                  isSubmitting || loadingRequests || !selectedRequestId
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500'
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
                ) : 'Tạo Hóa đơn'}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {/* Thông tin bổ sung */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Lưu ý khi tạo hóa đơn</h2>
        </div>
        <div className="p-6">
          <div className="bg-amber-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">Thông tin về tạo hóa đơn dịch vụ</h3>
                <div className="mt-2 text-sm text-amber-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Chỉ những yêu cầu đã hoàn thành mới có thể tạo hóa đơn</li>
                    <li>Hóa đơn sẽ được tạo dựa trên đơn giá của dịch vụ đã đăng ký</li>
                    <li>Sau khi tạo hóa đơn, hệ thống sẽ tự động gửi thông báo đến cư dân</li>
                    <li>Mỗi yêu cầu dịch vụ chỉ có thể được tạo một hóa đơn</li>
                    <li>Hãy kiểm tra kỹ thông tin trước khi tạo hóa đơn</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateServiceBill;