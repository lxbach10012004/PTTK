// filepath: d:\course\PTTKHTTT\PTTK\fe\src\pages\resident\ResidentRequests.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const API_URL = 'https://mmncb6j3-5000.asse.devtunnels.ms/api'; // Thay IP nếu cần

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
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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
    }
  }, [user]);

  const filteredRequests = requests.filter(req => {
    const statusMatch = filterStatus ? req.trang_thai === filterStatus : true;
    const searchMatch = searchTerm.trim() === '' || 
      (req.ten_dich_vu && req.ten_dich_vu.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (req.tieu_de && req.tieu_de.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (req.id_yeu_cau && req.id_yeu_cau.toString().includes(searchTerm));
    return statusMatch && searchMatch;
  });

  const handleCreateNewRequest = () => {
    window.location.href = '/resident/services';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">Đang tải danh sách yêu cầu...</span>
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

  // if (!user) {
  //   return (
  //     <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
  //       <div className="flex">
  //         <div className="flex-shrink-0">
  //           <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
  //             <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
  //           </svg>
  //         </div>
  //         <div className="ml-3">
  //           <p className="text-sm text-yellow-700">Vui lòng đăng nhập để xem yêu cầu.</p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">Danh sách Yêu cầu Dịch vụ</h1>
          <button 
            onClick={handleCreateNewRequest}
            className="ml-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
          >
            Tạo yêu cầu mới
          </button>
        </div>
        
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex-grow max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Tìm kiếm yêu cầu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Mới">Mới</option>
              <option value="Đang_xử_lý">Đang xử lý</option>
              <option value="Hoàn_thành">Hoàn thành</option>
              <option value="Từ_chối">Từ chối</option>
            </select>
          </div>
        </div>
      </div>
      
      {filteredRequests.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy yêu cầu nào</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.' : 'Bạn chưa gửi yêu cầu nào.'}
          </p>
          {(!searchTerm && !filterStatus) && (
            <div className="mt-6">
              <button
                onClick={handleCreateNewRequest}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Tạo yêu cầu mới
              </button>
            </div>
          )}
        </div>
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
              {filteredRequests.map((req) => (
                <tr key={req.id_yeu_cau} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.id_yeu_cau}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="max-w-xs truncate">{req.ten_dich_vu || req.tieu_de || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(req.ngay_tao)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(req.ngay_hen)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTrangThai(req.trang_thai)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link 
                      to={`/resident/requests/${req.id_yeu_cau}`} 
                      className="text-blue-600 hover:text-blue-900 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                    >
                      <div className="inline-flex items-center">
                        <span>Xem</span>
                        <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
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