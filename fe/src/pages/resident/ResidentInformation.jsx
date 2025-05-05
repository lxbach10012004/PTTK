// filepath: d:\course\PTTKHTTT\PTTK\fe\src\pages\resident\ResidentInformation.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

// --- Bỏ hàm giả lập ---
// const fetchResidentInfo = async (residentId) => { ... };

const API_URL = 'http://172.21.92.186:5000/api'; // Thay IP nếu cần

// Hàm định dạng giới tính
const formatGender = (gender) => {
    if (!gender) return '-';
    return gender === 'Nu' ? 'Nữ' : gender;
}

// Hàm định dạng ngày
const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) { return dateString; }
};

// Hàm định dạng tiền tệ
const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '-';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '-';
    return numAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

// Hàm định dạng trạng thái hợp đồng
const formatContractStatus = (status) => {
    switch (status) {
        case 'Hiệu_lực': return <span className="text-green-600 font-semibold">Hiệu lực</span>;
        case 'Hết_hạn': return <span className="text-red-600 font-semibold">Hết hạn</span>;
        case 'Huỷ': return <span className="text-gray-500 font-semibold">Đã huỷ</span>;
        default: return status;
    }
}

// Hàm định dạng trạng thái căn hộ
const formatApartmentStatus = (status) => {
    switch (status) {
        case 'Đang_ở': return <span className="text-green-600">Đang ở</span>;
        case 'Trống': return <span className="text-blue-600">Trống</span>;
        case 'Đang_sửa': return <span className="text-yellow-600">Đang sửa</span>;
        default: return status;
    }
}


function ResidentInformation() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user && user.id_nguoi_dung) {
      setLoading(true);
      setError(null);
      fetch(`${API_URL}/cu-dan/${user.id_nguoi_dung}/thong-tin`)
        .then(res => {
          if (!res.ok) {
             if (res.status === 404) throw new Error('Không tìm thấy thông tin chi tiết.');
             throw new Error('Network response was not ok');
          }
          return res.json();
        })
        .then(data => {
          setInfo(data);
        })
        .catch(err => {
          console.error("Lỗi fetch thông tin:", err);
          setError(err.message || "Không thể tải thông tin cá nhân.");
          setInfo(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return <div className="text-center p-4">Đang tải thông tin...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600">{error}</div>;
  }

  if (!user || !info) {
      return <div className="text-center p-4 text-orange-600">Không có thông tin để hiển thị hoặc bạn chưa đăng nhập.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Thông tin cá nhân */}
      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Thông tin Cá nhân</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><span className="font-medium text-gray-600">Họ tên:</span> {info.ho_ten}</div>
          <div><span className="font-medium text-gray-600">Email:</span> {info.email}</div>
          <div><span className="font-medium text-gray-600">Số điện thoại:</span> {info.so_dien_thoai || '-'}</div>
          <div><span className="font-medium text-gray-600">Ngày sinh:</span> {formatDate(info.ngay_sinh)}</div>
          <div><span className="font-medium text-gray-600">Giới tính:</span> {formatGender(info.gioi_tinh)}</div>
          <div><span className="font-medium text-gray-600">Địa chỉ thường trú:</span> {info.dia_chi || '-'}</div>
          <div><span className="font-medium text-gray-600">Ngày chuyển đến:</span> {formatDate(info.ngay_chuyen_den)}</div>
        </div>
      </div>

      {/* Thông tin căn hộ */}
      {info.can_ho ? (
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Thông tin Căn hộ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span className="font-medium text-gray-600">Mã căn:</span> {info.can_ho.ma_can}</div>
            <div><span className="font-medium text-gray-600">Tòa nhà:</span> {info.can_ho.toa_nha}</div>
            <div><span className="font-medium text-gray-600">Tầng:</span> {info.can_ho.tang}</div>
            <div><span className="font-medium text-gray-600">Diện tích:</span> {info.can_ho.dien_tich} m²</div>
            <div><span className="font-medium text-gray-600">Số phòng ngủ:</span> {info.can_ho.so_phong_ngu}</div>
            <div><span className="font-medium text-gray-600">Số phòng tắm:</span> {info.can_ho.so_phong_tam}</div>
            <div><span className="font-medium text-gray-600">Trạng thái căn hộ:</span> {formatApartmentStatus(info.can_ho.trang_thai)}</div>
          </div>
        </div>
      ) : (
         <div className="bg-white p-6 rounded shadow-md text-sm text-gray-500">Không tìm thấy thông tin căn hộ liên kết.</div>
      )}

      {/* Thông tin hợp đồng */}
      {info.hop_dong ? (
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Thông tin Hợp đồng</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span className="font-medium text-gray-600">Số hợp đồng:</span> {info.hop_dong.so_hop_dong}</div>
            <div><span className="font-medium text-gray-600">Loại hợp đồng:</span> {info.hop_dong.loai_hop_dong}</div>
            <div><span className="font-medium text-gray-600">Ngày bắt đầu:</span> {formatDate(info.hop_dong.ngay_bat_dau)}</div>
            <div><span className="font-medium text-gray-600">Ngày kết thúc:</span> {formatDate(info.hop_dong.ngay_ket_thuc)}</div>
            <div><span className="font-medium text-gray-600">Tiền đặt cọc:</span> {formatCurrency(info.hop_dong.tien_dat_coc)}</div>
            <div><span className="font-medium text-gray-600">Trạng thái hợp đồng:</span> {formatContractStatus(info.hop_dong.trang_thai)}</div>
          </div>
        </div>
       ) : (
         <div className="bg-white p-6 rounded shadow-md text-sm text-gray-500">Không tìm thấy thông tin hợp đồng liên kết.</div>
      )}
    </div>
  );
}

export default ResidentInformation;