import React, { useState, useEffect, useCallback } from 'react'; // Thêm useCallback

const API_URL = 'http://172.21.92.186:5000/api'; // Thay IP nếu cần

// --- Hàm Format ---
const formatTrangThai = (status) => {
    const statusText = status?.replace('_', ' ') || 'Không xác định';
    switch (status) {
        case 'Mới': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{statusText}</span>;
        case 'Đang_xử_lý': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">{statusText}</span>;
        case 'Hoàn_thành': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{statusText}</span>;
        case 'Từ_chối': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">{statusText}</span>;
        default: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{statusText}</span>;
    }
};

const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    try {
        const date = new Date(dateTimeString);
        if (isNaN(date.getTime())) {
            return dateTimeString;
        }
        return date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
    } catch (e) { return dateTimeString; }
};

// *** Hàm mới: Format tên người yêu cầu (đơn giản hóa) ***
const formatSimpleRequesterName = (req) => {
    // Nếu có tên cư dân thì hiển thị tên
    if (req?.ten_cu_dan) {
        return req.ten_cu_dan;
    }
    // Nếu không có tên cư dân VÀ id_cu_dan là null/undefined, thì là quản lý
    else if (req?.id_cu_dan === null || req?.id_cu_dan === undefined) {
        return "Quản lý tòa nhà";
    }
    // Nếu không có tên nhưng có id_cu_dan, hiển thị ID (dự phòng)
    else if (req?.id_cu_dan) {
         return `ID Cư dân: ${req.id_cu_dan}`;
    }
    // Trường hợp không xác định
    return 'Không xác định';
};


function HandleRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch requests từ API - dùng useCallback
  const fetchRequests = useCallback((statusFilter = 'Mới,Đang_xử_lý') => {
    setLoading(true);
    setError(null);
    setMessage('');
    // *** Vẫn dùng endpoint cũ theo yêu cầu ***
    fetch(`${API_URL}/yeu-cau-dich-vu?status=${statusFilter}`)
      .then(res => {
        if (!res.ok) {
          return res.json().then(errData => {
              throw new Error(errData.error || `Lỗi ${res.status}`);
          }).catch(() => {
              throw new Error(`Lỗi ${res.status}`);
          });
        }
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return res.json();
        } else {
          return res.text().then(text => { throw new Error("Phản hồi từ API không phải JSON: " + text.substring(0, 100)) });
        }
      })
      .then(data => {
        if (Array.isArray(data)) {
            setRequests(data);
        } else {
            console.error("Dữ liệu API trả về không phải mảng:", data);
            throw new Error("Định dạng dữ liệu không hợp lệ từ API.");
        }
      })
      .catch(err => {
        console.error("Lỗi fetch yêu cầu:", err);
        setError(`Không thể tải yêu cầu: ${err.message || 'Lỗi không xác định'}`);
        setRequests([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Hàm xử lý cập nhật trạng thái
  const handleUpdateStatus = async (requestId) => {
    if (!updateStatus) {
      setMessage('Vui lòng chọn trạng thái mới.');
      return;
    }
    setIsUpdating(true);
    setMessage('');
    try {
      // *** Vẫn dùng endpoint cũ ***
      const response = await fetch(`${API_URL}/yeu-cau-dich-vu/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trang_thai: updateStatus }),
      });
      const result = await response.json();
      if (!response.ok) throw (result || new Error(`Lỗi ${response.status}`));
      setMessage(`Cập nhật yêu cầu #${requestId} thành công!`);
      setSelectedRequest(null);
      fetchRequests();
    } catch (err) {
      console.error("Lỗi cập nhật yêu cầu:", err);
      setMessage(`Cập nhật thất bại: ${err.error || err.message || 'Lỗi không xác định'}`);
    } finally {
      setIsUpdating(false);
      setUpdateStatus('');
    }
  };

   // Hàm xử lý thêm báo cáo
  const handleAddReport = async (requestId) => {
    if (!reportContent.trim()) {
      setMessage('Vui lòng nhập nội dung báo cáo.');
      return;
    }
    setIsReporting(true);
    setMessage('');
    try {
      // *** Vẫn dùng endpoint cũ ***
      const response = await fetch(`${API_URL}/yeu-cau-dich-vu/${requestId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            noi_dung: reportContent.trim(),
            // id_nhan_vien: staffId // Nhớ gửi ID nhân viên nếu backend cần
        }),
      });
      const result = await response.json();
      if (!response.ok) throw (result || new Error(`Lỗi ${response.status}`));
      setMessage(`Thêm báo cáo cho yêu cầu #${requestId} thành công!`);
      setSelectedRequest(null);
    } catch (err) {
      console.error("Lỗi thêm báo cáo:", err);
      setMessage(`Thêm báo cáo thất bại: ${err.error || err.message || 'Lỗi không xác định'}`);
    } finally {
      setIsReporting(false);
      setReportContent('');
    }
  };


  // --- Render UI ---
  if (loading) return <div className="p-4 text-center">Đang tải danh sách yêu cầu...</div>;
  if (error) return <div className="p-4 text-center text-red-600 bg-red-100 border border-red-400 rounded">{error}</div>;

  return (
    <div className="bg-white p-6 rounded shadow-md">
      {/* Giữ tiêu đề cũ */}
      <h1 className="text-xl font-semibold mb-4">Xử lý Yêu cầu Dịch vụ</h1>
      {message && <p className={`mb-4 text-sm p-3 rounded ${message.includes('thất bại') || message.includes('Lỗi') ? 'text-red-700 bg-red-100 border border-red-300' : 'text-green-700 bg-green-100 border border-green-300'}`}>{message}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                {/* Giữ tên cột Người dùng */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người dùng</th>
                {/* Giữ tên cột Dịch vụ */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dịch vụ/Tiêu đề</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày hẹn</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NV Phụ trách</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.isArray(requests) && requests.map((req) => (
              <tr key={req.id_yeu_cau}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.id_yeu_cau}</td>
                {/* *** Sử dụng hàm format tên người yêu cầu đơn giản *** */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatSimpleRequesterName(req)}</td>
                {/* Hiển thị tên dịch vụ hoặc tiêu đề */}
                <td className="px-6 py-4 text-sm text-gray-500 break-words min-w-[150px]">{req.ten_dich_vu || req.tieu_de || 'Không có'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(req.ngay_tao)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(req.ngay_hen)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTrangThai(req.trang_thai)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.ten_nhan_vien || (req.id_nhan_vien_phu_trach ? `ID: ${req.id_nhan_vien_phu_trach}`: 'Chưa gán')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => setSelectedRequest(req)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Xem/Xử lý
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!Array.isArray(requests) || requests.length === 0) && !loading && <p className="text-center py-4 text-gray-500">Không có yêu cầu nào phù hợp.</p>}
      </div>

      {/* Modal chi tiết và cập nhật */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
          <div className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Chi tiết Yêu cầu #{selectedRequest.id_yeu_cau}</h2>
            <button onClick={() => setSelectedRequest(null)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl leading-none font-semibold p-1">&times;</button>

            {/* *** Cập nhật hiển thị thông tin chi tiết (đơn giản) *** */}
            <div className="space-y-2 mb-4">
                {/* Sử dụng hàm format đơn giản */}
                <p><strong>Người yêu cầu:</strong> {formatSimpleRequesterName(selectedRequest)}</p>
                {/* Chỉ hiển thị SĐT nếu là cư dân (có sdt_cu_dan) */}
                {selectedRequest.sdt_cu_dan && <p><strong>SĐT:</strong> {selectedRequest.sdt_cu_dan}</p>}
                {/* Giữ nguyên các thông tin khác */}
                <p><strong>Dịch vụ/Tiêu đề:</strong> {selectedRequest.ten_dich_vu || selectedRequest.tieu_de || '(Không có)'}</p>
                <p><strong>Mô tả:</strong> {selectedRequest.mo_ta || '(Không có)'}</p>
                <p><strong>Ngày tạo:</strong> {formatDateTime(selectedRequest.ngay_tao)}</p>
                <p><strong>Ngày hẹn:</strong> {formatDateTime(selectedRequest.ngay_hen)}</p>
                <p><strong>Trạng thái hiện tại:</strong> {formatTrangThai(selectedRequest.trang_thai)}</p>
                <p><strong>NV Phụ trách:</strong> {selectedRequest.ten_nhan_vien || (selectedRequest.id_nhan_vien_phu_trach ? `ID: ${selectedRequest.id_nhan_vien_phu_trach}`: 'Chưa gán')}</p>
            </div>
            <hr className="my-4"/>

            {/* Cập nhật trạng thái (giữ nguyên) */}
            <div className="mb-4">
              <label htmlFor="statusUpdate" className="block text-sm font-medium text-gray-700 mb-1">Cập nhật trạng thái:</label>
              <select
                id="statusUpdate"
                value={updateStatus}
                onChange={(e) => setUpdateStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">-- Chọn trạng thái mới --</option>
                <option value="Đang_xử_lý">Đang xử lý</option>
                <option value="Hoàn_thành">Hoàn thành</option>
                <option value="Từ_chối">Từ chối</option>
              </select>
              <button
                onClick={() => handleUpdateStatus(selectedRequest.id_yeu_cau)}
                disabled={isUpdating || !updateStatus}
                className={`mt-2 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${isUpdating || !updateStatus ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
              >
                {isUpdating ? 'Đang cập nhật...' : 'Cập nhật Trạng thái'}
              </button>
            </div>

            {/* Thêm báo cáo (giữ nguyên) */}
            <div>
               <label htmlFor="reportContent" className="block text-sm font-medium text-gray-700 mb-1">Thêm báo cáo/ghi chú xử lý:</label>
               <textarea
                 id="reportContent"
                 rows="3"
                 value={reportContent}
                 onChange={(e) => setReportContent(e.target.value)}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                 placeholder="Nhập nội dung báo cáo..."
               ></textarea>
               <button
                 onClick={() => handleAddReport(selectedRequest.id_yeu_cau)}
                 disabled={isReporting || !reportContent.trim()}
                 className={`mt-2 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${isReporting || !reportContent.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'}`}
               >
                 {isReporting ? 'Đang gửi...' : 'Thêm Báo cáo'}
               </button>
            </div>
             {message && <p className={`mt-4 text-sm ${message.includes('thất bại') || message.includes('Lỗi') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default HandleRequests;