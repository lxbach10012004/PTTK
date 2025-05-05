// filepath: d:\course\PTTKHTTT\PTTK\fe\src\pages\resident\ResidentRequests.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

// --- Bỏ hàm giả lập ---
// const fetchResidentRequests = async (residentId) => { ... };

const API_URL = 'http://172.21.92.186:5000/api'; // Thay IP nếu cần

// Hàm định dạng trạng thái
const formatTrangThai = (status) => {
    switch (status) {
        case 'Mới': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Mới</span>;
        case 'Đang_xử_lý': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Đang xử lý</span>;
        case 'Hoàn_thành': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Hoàn thành</span>;
        case 'Từ_chối': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Từ chối</span>;
        default: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
};

// Hàm định dạng ngày giờ
const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    try {
        const date = new Date(dateTimeString);
        return date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
    } catch (e) {
        return dateTimeString;
    }
};

function ResidentRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user && user.id_nguoi_dung) {
      setLoading(true);
      setError(null); // Reset lỗi trước khi fetch
      fetch(`${API_URL}/yeu-cau-dich-vu?id_cu_dan=${user.id_nguoi_dung}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Network response was not ok');
          }
          return res.json();
        })
        .then(data => {
          setRequests(data);
        })
        .catch(err => {
          console.error("Lỗi fetch yêu cầu:", err);
          setError("Không thể tải danh sách yêu cầu.");
          setRequests([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
      // Không cần set lỗi nếu user chưa load xong, chỉ không fetch
    }
  }, [user]);

  if (loading) {
    return <div className="text-center p-4">Đang tải danh sách yêu cầu...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600">{error}</div>;
  }

  if (!user) {
      return <div className="text-center p-4 text-orange-600">Vui lòng đăng nhập để xem yêu cầu.</div>;
  }

  return (
    <div className="bg-white p-6 rounded shadow-md">
      <h1 className="text-xl font-semibold mb-4">Danh sách Yêu cầu Dịch vụ Đã Gửi</h1>
      {requests.length === 0 ? (
        <p>Bạn chưa gửi yêu cầu nào.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Yêu cầu</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dịch vụ</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày hẹn</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((req) => (
                <tr key={req.id_yeu_cau}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.id_yeu_cau}</td>
                  {/* API đã join để lấy ten_dich_vu */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.ten_dich_vu || req.tieu_de}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(req.ngay_tao)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(req.ngay_hen)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTrangThai(req.trang_thai)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline cursor-pointer">
                    {/* <Link to={`/resident/requests/${req.id_yeu_cau}`}>Xem</Link> */}
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

export default ResidentRequests;