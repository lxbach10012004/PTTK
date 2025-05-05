// filepath: d:\course\PTTKHTTT\PTTK\fe\src\pages\resident\ResidentBills.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

// --- Bỏ hàm giả lập ---
// const fetchResidentBills = async (residentId) => { ... };

const API_URL = 'http://172.21.92.186:5000/api'; // Thay IP nếu cần

// Hàm định dạng trạng thái thanh toán
const formatPaymentStatus = (status) => {
    switch (status) {
        case 'Chưa_thanh_toán': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Chưa thanh toán</span>;
        case 'Đã_thanh_toán': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Đã thanh toán</span>;
        case 'Quá_hạn': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Quá hạn</span>;
        default: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
};

// Hàm định dạng tiền tệ
const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '-';
    // API trả về Decimal dưới dạng string, cần chuyển thành number
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '-';
    return numAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

// Hàm định dạng ngày
const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
        // API trả về YYYY-MM-DD
        const date = new Date(dateString + 'T00:00:00'); // Thêm giờ để tránh lệch ngày do timezone
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
        return dateString;
    }
};

function ResidentBills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user && user.id_nguoi_dung) {
      setLoading(true);
      setError(null);
      fetch(`${API_URL}/hoa-don?id_cu_dan=${user.id_nguoi_dung}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Network response was not ok');
          }
          return res.json();
        })
        .then(data => {
          setBills(data);
        })
        .catch(err => {
          console.error("Lỗi fetch hóa đơn:", err);
          setError("Không thể tải danh sách hóa đơn.");
          setBills([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return <div className="text-center p-4">Đang tải danh sách hóa đơn...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600">{error}</div>;
  }

   if (!user) {
      return <div className="text-center p-4 text-orange-600">Vui lòng đăng nhập để xem hóa đơn.</div>;
  }

  return (
    <div className="bg-white p-6 rounded shadow-md">
      <h1 className="text-xl font-semibold mb-4">Danh sách Hóa đơn</h1>
      {bills.length === 0 ? (
        <p>Bạn không có hóa đơn nào.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số HĐ</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại hóa đơn</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày xuất</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bills.map((bill) => (
                // Key cần unique hơn, ví dụ kết hợp id và loại
                <tr key={`${bill.loai_hoa_don_goc}-${bill.id_hoa_don}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bill.so_hoa_don || `HD-${bill.id_hoa_don}`}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bill.loai_hoa_don}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(bill.ngay_xuat)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(bill.tong_tien)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{formatPaymentStatus(bill.trang_thai)}</td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline cursor-pointer">
                    Xem
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ResidentBills;