// filepath: d:\course\PTTKHTTT\PTTK\fe\src\pages\resident\ResidentFeedback.jsx
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';

const API_URL = 'https://mmncb6j3-5000.asse.devtunnels.ms/api'; // Thay IP nếu cần

// Danh sách loại phản hồi
const FEEDBACK_TYPES = [
  { id: 'dichvu', label: 'Dịch vụ' },
  { id: 'csvc', label: 'Cơ sở vật chất' },
  { id: 'anninh', label: 'An ninh' },
  { id: 'vesinh', label: 'Vệ sinh' },
  { id: 'khac', label: 'Khác' }
];

function ResidentFeedback() {
  const [tieuDe, setTieuDe] = useState('');
  const [noiDung, setNoiDung] = useState('');
  const [loaiPhanHoi, setLoaiPhanHoi] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [sentFeedbacks, setSentFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Nếu đã đăng nhập, tải danh sách phản hồi đã gửi
    if (user && user.id_nguoi_dung) {
      setLoadingFeedbacks(true);
      fetch(`${API_URL}/phan-hoi-cu-dan?id_cu_dan=${user.id_nguoi_dung}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Network response was not ok');
          }
          return res.json();
        })
        .then(data => {
          // Sắp xếp phản hồi theo thời gian giảm dần (mới nhất lên đầu)
          const sortedData = data.sort((a, b) => 
            new Date(b.ngay_tao || '1970-01-01') - new Date(a.ngay_tao || '1970-01-01')
          );
          setSentFeedbacks(sortedData);
        })
        .catch(err => {
          console.error("Lỗi fetch phản hồi đã gửi:", err);
        })
        .finally(() => {
          setLoadingFeedbacks(false);
        });
    } else {
      setLoadingFeedbacks(false);
    }
  }, [user, success]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitMessage(''); // Reset thông báo
    setSuccess(false);

    if (!user || !user.id_nguoi_dung) {
        setSubmitMessage('Lỗi: Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
        return;
    }
    
    if (!tieuDe.trim() || !noiDung.trim() || !loaiPhanHoi) {
        setSubmitMessage('Vui lòng điền đầy đủ thông tin phản hồi.');
        return;
    }

    setIsSubmitting(true);

    const feedbackData = {
      id_cu_dan: user.id_nguoi_dung,
      tieu_de: tieuDe.trim(),
      noi_dung: noiDung.trim(),
      loai_phan_hoi: loaiPhanHoi
    };

    try {
        const response = await fetch(`${API_URL}/phan-hoi-cu-dan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(feedbackData),
        });
        const result = await response.json();

        if (response.ok) {
            setSubmitMessage(`Phản hồi của bạn đã được gửi thành công!`);
            setSuccess(true);
            setTieuDe(''); // Reset form
            setNoiDung('');
            setLoaiPhanHoi('');
        } else {
             setSubmitMessage(`Gửi phản hồi thất bại: ${result.error || 'Lỗi không xác định'}`);
        }
    } catch (error) {
        console.error("Lỗi gửi phản hồi API:", error);
        setSubmitMessage('Đã xảy ra lỗi mạng khi gửi phản hồi.');
    } finally {
        setIsSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  // Format trạng thái phản hồi
  const formatStatus = (status) => {
    switch(status) {
      case 'Đã_tiếp_nhận':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Đã tiếp nhận</span>;
      case 'Đang_xử_lý':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Đang xử lý</span>;
      case 'Đã_xử_lý':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Đã xử lý</span>;
      case 'Từ_chối':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Từ chối</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Mới gửi</span>;
    }
  };

  // // Kiểm tra xem người dùng đã đăng nhập hay chưa
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
  //           <p className="text-sm text-yellow-700">Vui lòng đăng nhập để gửi và xem phản hồi.</p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Gửi Phản Hồi & Góp Ý</h1>
        <p className="text-gray-600 mt-1">Chia sẻ ý kiến của bạn để chúng tôi cải thiện dịch vụ tốt hơn</p>
      </div>

      {/* Form gửi phản hồi */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Tạo phản hồi mới</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1">
              <label htmlFor="tieuDe" className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="tieuDe"
                value={tieuDe}
                onChange={(e) => setTieuDe(e.target.value)}
                required
                maxLength="200"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Ví dụ: Góp ý về vệ sinh hành lang"
              />
            </div>

            <div className="col-span-1">
              <label htmlFor="loaiPhanHoi" className="block text-sm font-medium text-gray-700 mb-1">
                Loại phản hồi <span className="text-red-500">*</span>
              </label>
              <select
                id="loaiPhanHoi"
                value={loaiPhanHoi}
                onChange={(e) => setLoaiPhanHoi(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">-- Chọn loại phản hồi --</option>
                {FEEDBACK_TYPES.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label htmlFor="noiDung" className="block text-sm font-medium text-gray-700 mb-1">
                Nội dung phản hồi <span className="text-red-500">*</span>
              </label>
              <textarea
                id="noiDung"
                rows="5"
                value={noiDung}
                onChange={(e) => setNoiDung(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Mô tả chi tiết phản hồi của bạn..."
              ></textarea>
            </div>
          </div>

          {submitMessage && (
            <div className={`mt-4 p-3 rounded-md ${success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {submitMessage}
            </div>
          )}

          <div className="mt-6">
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
                  Đang gửi...
                </span>
              ) : 'Gửi Phản hồi'}
            </button>
          </div>
        </form>
      </div>

      {/* Lịch sử phản hồi */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Phản hồi đã gửi</h2>
        </div>

        {loadingFeedbacks ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3">Đang tải phản hồi...</span>
          </div>
        ) : sentFeedbacks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có phản hồi nào</h3>
            <p className="mt-1 text-sm text-gray-500">Bạn chưa gửi phản hồi nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phản hồi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sentFeedbacks.map((feedback) => (
                  <tr key={feedback.id_phan_hoi} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{feedback.id_phan_hoi}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate">{feedback.tieu_de}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(feedback.ngay_tao)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{formatStatus(feedback.trang_thai)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate">
                        {feedback.phan_hoi || '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResidentFeedback;