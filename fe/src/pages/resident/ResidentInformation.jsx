// filepath: d:\course\PTTKHTTT\PTTK\fe\src\pages\resident\ResidentInformation.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

// --- Bỏ hàm giả lập ---
// const fetchResidentInfo = async (residentId) => { ... };

const API_URL = 'https://mmncb6j3-5000.asse.devtunnels.ms/api'; // Thay IP nếu cần

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
        case 'Hiệu_lực': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Hiệu lực</span>;
        case 'Hết_hạn': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Hết hạn</span>;
        case 'Huỷ': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Đã huỷ</span>;
        default: return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
}

// Hàm định dạng trạng thái căn hộ
const formatApartmentStatus = (status) => {
    switch (status) {
        case 'Đang_ở': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Đang ở</span>;
        case 'Trống': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Trống</span>;
        case 'Đang_sửa': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Đang sửa</span>;
        default: return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">Đang tải thông tin cá nhân...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !info) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">Không có thông tin để hiển thị hoặc bạn chưa đăng nhập.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Tiêu đề trang */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Thông tin Cá nhân</h1>
        <p className="text-gray-600 mt-1">Xem và quản lý thông tin cá nhân của bạn</p>
      </div>
      
      {/* Phần tổng quan */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center text-blue-500 text-2xl font-bold border-4 border-white">
              {info.ho_ten ? info.ho_ten.charAt(0).toUpperCase() : "?"}
            </div>
            <div className="ml-4 text-white">
              <h2 className="text-xl font-semibold">{info.ho_ten}</h2>
              <p className="opacity-90">{info.email}</p>
              <p className="opacity-75 text-sm mt-1">Cư dân {info.can_ho ? `căn hộ ${info.can_ho.ma_can}` : ""}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Thông tin cá nhân */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Thông tin Cá nhân</h2>
          {/* Có thể thêm nút chỉnh sửa ở đây nếu cần */}
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Họ và tên</label>
                <div className="mt-1 text-gray-900">{info.ho_ten || "-"}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <div className="mt-1 text-gray-900">{info.email || "-"}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Số điện thoại</label>
                <div className="mt-1 text-gray-900">{info.so_dien_thoai || "-"}</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Ngày sinh</label>
                <div className="mt-1 text-gray-900">{formatDate(info.ngay_sinh)}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Giới tính</label>
                <div className="mt-1 text-gray-900">{formatGender(info.gioi_tinh)}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Địa chỉ thường trú</label>
                <div className="mt-1 text-gray-900">{info.dia_chi || "-"}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Ngày chuyển đến</label>
                <div className="mt-1 text-gray-900">{formatDate(info.ngay_chuyen_den)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thông tin căn hộ */}
      {info.can_ho ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Thông tin Căn hộ</h2>
            <div>{formatApartmentStatus(info.can_ho.trang_thai)}</div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Mã căn hộ</label>
                  <div className="mt-1 text-gray-900 font-medium">{info.can_ho.ma_can}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Tòa nhà</label>
                  <div className="mt-1 text-gray-900">{info.can_ho.toa_nha}</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Tầng</label>
                  <div className="mt-1 text-gray-900">{info.can_ho.tang}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Diện tích</label>
                  <div className="mt-1 text-gray-900">{info.can_ho.dien_tich} m²</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Số phòng ngủ</label>
                  <div className="mt-1 text-gray-900">{info.can_ho.so_phong_ngu}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Số phòng tắm</label>
                  <div className="mt-1 text-gray-900">{info.can_ho.so_phong_tam}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không có thông tin căn hộ</h3>
          <p className="mt-1 text-sm text-gray-500">Không tìm thấy thông tin căn hộ liên kết với tài khoản của bạn.</p>
        </div>
      )}

      {/* Thông tin hợp đồng */}
      {info.hop_dong ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Thông tin Hợp đồng</h2>
            <div>{formatContractStatus(info.hop_dong.trang_thai)}</div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Số hợp đồng</label>
                  <div className="mt-1 text-gray-900">{info.hop_dong.so_hop_dong}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Loại hợp đồng</label>
                  <div className="mt-1 text-gray-900">{info.hop_dong.loai_hop_dong}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Tiền đặt cọc</label>
                  <div className="mt-1 text-gray-900 font-medium">{formatCurrency(info.hop_dong.tien_dat_coc)}</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Ngày bắt đầu</label>
                  <div className="mt-1 text-gray-900">{formatDate(info.hop_dong.ngay_bat_dau)}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Ngày kết thúc</label>
                  <div className="mt-1 text-gray-900">{formatDate(info.hop_dong.ngay_ket_thuc)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không có thông tin hợp đồng</h3>
          <p className="mt-1 text-sm text-gray-500">Không tìm thấy thông tin hợp đồng liên kết với tài khoản của bạn.</p>
        </div>
      )}
    </div>
  );
}

export default ResidentInformation;