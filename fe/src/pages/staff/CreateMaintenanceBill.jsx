// filepath: d:\course\PTTKHTTT\PTTK\fe\src\pages\staff\CreateMaintenanceBill.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const API_URL = 'https://mmncb6j3-5000.asse.devtunnels.ms/api'; // Thay IP nếu cần

function CreateMaintenanceBill() {
  const [residents, setResidents] = useState([]); // Cần API lấy danh sách cư dân
  const [loadingResidents, setLoadingResidents] = useState(true);
  const [selectedResidentId, setSelectedResidentId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState(''); // Mô tả tùy chọn
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const { user } = useContext(AuthContext);

  // Fetch danh sách cư dân (Cần API mới: GET /api/cu-dan)
  useEffect(() => {
    // Comment phần kiểm tra quyền nhân viên để test không cần đăng nhập
    /* if (!user || user.vai_tro !== 'NhanVien') {
      setMessage('Bạn không có quyền truy cập chức năng này');
      setLoadingResidents(false);
      return;
    } */

    setLoadingResidents(true);
    setMessage('');
// Tạm thời dùng API lấy yêu cầu để có danh sách cư dân (không lý tưởng)
    // Cần API GET /api/cu-dan trả về [{id_cu_dan, ho_ten}, ...]
    fetch(`${API_URL}/yeu-cau-dich-vu`) // Tạm thời
      .then(res => res.ok ? res.json() : res.json().then(err => Promise.reject(err)))
      .then(data => {
         // Trích xuất danh sách cư dân duy nhất từ yêu cầu
         const residentMap = new Map();
         data.forEach(req => {
             if (req.id_cu_dan && !residentMap.has(req.id_cu_dan)) {
                 residentMap.set(req.id_cu_dan, { id_cu_dan: req.id_cu_dan, ho_ten: req.ten_cu_dan || `ID: ${req.id_cu_dan}` });
             }
         });
         setResidents(Array.from(residentMap.values()));
      })
      .catch(err => {
        console.error("Lỗi fetch cư dân (tạm):", err);
        setMessage(`Lỗi tải danh sách cư dân: ${err.error || 'Lỗi không xác định'}`);
        setSuccess(false);
        setResidents([]);
      })
      .finally(() => setLoadingResidents(false));
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedResidentId || !amount || parseFloat(amount) <= 0) {
      setMessage('Vui lòng chọn cư dân và nhập số tiền hợp lệ (> 0).');
      setSuccess(false);
      return;
    }
    setIsSubmitting(true);
    setMessage('');
    setSuccess(false);
    
    try {
      const response = await fetch(`${API_URL}/hoa-don/bao-tri`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_cu_dan: parseInt(selectedResidentId),
          tong_tien: parseFloat(amount),
          mo_ta: description.trim() || undefined // Gửi undefined nếu trống
        }),
      });
      const result = await response.json();
      if (!response.ok) throw result;
      
      setMessage(`Tạo hóa đơn ${result.bill?.so_hoa_don || ''} cho cư dân ID ${selectedResidentId} thành công!`);
      setSuccess(true);
      setSelectedResidentId(''); // Reset form
      setAmount('');
      setDescription('');
    } catch (err) {
      console.error("Lỗi tạo hóa đơn bảo trì:", err);
      setMessage(`Tạo hóa đơn thất bại: ${err.error || 'Lỗi không xác định'}`);
      setSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format số tiền
  const formatCurrency = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Tạo Hóa đơn Phí Quản lý/Bảo trì</h1>
        <p className="text-gray-600 mt-1">Tạo hóa đơn phí quản lý, bảo trì cho cư dân</p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Thông tin hóa đơn</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label htmlFor="residentSelect" className="block text-sm font-medium text-gray-700 mb-1">
                Chọn cư dân <span className="text-red-500">*</span>
              </label>
              <select
                id="residentSelect"
                value={selectedResidentId}
                onChange={(e) => setSelectedResidentId(e.target.value)}
                required
                disabled={loadingResidents || residents.length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500 disabled:bg-gray-100 text-sm"
              >
                <option value="">{loadingResidents ? "Đang tải..." : (residents.length === 0 ? "-- Không có cư dân --" : "-- Chọn cư dân --")}</option>
                {residents.map((res) => (
                  <option key={res.id_cu_dan} value={res.id_cu_dan}>
                    {res.ho_ten}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Số tiền <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="1"
                  step="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500 text-sm"
                  placeholder="Ví dụ: 1500000"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">VNĐ</span>
                </div>
              </div>
              {amount && (
                <p className="mt-1 text-xs text-gray-500">
                  {formatCurrency(amount)}
                </p>
              )}
            </div>

            <div className="col-span-2 md:col-span-1">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả (tùy chọn)
              </label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500 text-sm"
                placeholder="Ví dụ: Phí quản lý tháng 5/2025"
              />
            </div>
          </div>

          {message && (
            <div className={`mt-4 p-3 rounded-md ${success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}

          <div className="mt-6 flex items-center space-x-3">
            <button
              type="submit"
              disabled={isSubmitting || loadingResidents || !selectedResidentId || !amount}
              className={`px-6 py-2.5 font-medium rounded-md shadow-sm text-white ${
                isSubmitting || loadingResidents || !selectedResidentId || !amount
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
                <h3 className="text-sm font-medium text-blue-800">Thông tin về hóa đơn phí quản lý/bảo trì</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Phí quản lý/bảo trì thường được thu hàng tháng theo quy định của tòa nhà</li>
                    <li>Đối với các phí bất thường (phí sửa chữa, bảo trì đột xuất), cần có mô tả rõ ràng</li>
                    <li>Đảm bảo chọn đúng cư dân cần lập hóa đơn và số tiền chính xác</li>
                    <li>Sau khi tạo hóa đơn, hệ thống sẽ tự động gửi thông báo đến cư dân</li>
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

export default CreateMaintenanceBill;