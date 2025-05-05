// filepath: d:\course\PTTKHTTT\PTTK\fe\src\pages\staff\CreateMaintenanceBill.jsx
import React, { useState, useEffect } from 'react';

const API_URL = 'http://172.21.92.186:5000/api'; // Thay IP nếu cần

function CreateMaintenanceBill() {
  const [residents, setResidents] = useState([]); // Cần API lấy danh sách cư dân
  const [loadingResidents, setLoadingResidents] = useState(true);
  const [selectedResidentId, setSelectedResidentId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState(''); // Mô tả tùy chọn
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch danh sách cư dân (Cần API mới: GET /api/cu-dan)
  useEffect(() => {
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
        setResidents([]);
      })
      .finally(() => setLoadingResidents(false));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedResidentId || !amount || parseFloat(amount) <= 0) {
      setMessage('Vui lòng chọn cư dân và nhập số tiền hợp lệ (> 0).');
      return;
    }
    setIsSubmitting(true);
    setMessage('');
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
      setSelectedResidentId(''); // Reset form
      setAmount('');
      setDescription('');
    } catch (err) {
      console.error("Lỗi tạo hóa đơn bảo trì:", err);
      setMessage(`Tạo hóa đơn thất bại: ${err.error || 'Lỗi không xác định'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">Tạo Hóa đơn Phí Quản lý/Bảo trì</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="residentSelect" className="block text-sm font-medium text-gray-700 mb-1">
            Chọn cư dân <span className="text-red-500">*</span>
          </label>
          <select
            id="residentSelect"
            value={selectedResidentId}
            onChange={(e) => setSelectedResidentId(e.target.value)}
            required
            disabled={loadingResidents || residents.length === 0}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
          >
            <option value="">{loadingResidents ? "Đang tải..." : (residents.length === 0 ? "-- Không có cư dân --" : "-- Chọn cư dân --")}</option>
            {residents.map((res) => (
              <option key={res.id_cu_dan} value={res.id_cu_dan}>
                {res.ho_ten}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Số tiền (VNĐ) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="1"
            step="1000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ví dụ: 1500000"
          />
        </div>

         <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả (tùy chọn)
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ví dụ: Phí quản lý tháng 5/2025"
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
            disabled={isSubmitting || loadingResidents || !selectedResidentId || !amount}
            className={`w-full py-2 px-4 font-semibold rounded-md shadow text-white ${
              isSubmitting || loadingResidents || !selectedResidentId || !amount
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isSubmitting ? 'Đang tạo...' : 'Tạo Hóa đơn'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateMaintenanceBill;