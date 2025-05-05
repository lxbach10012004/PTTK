import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const API_URL = 'http://172.21.92.186:5000/api'; // Thay IP nếu cần

function ManagerCreateRequest() {
  const [internalServices, setInternalServices] = useState([]);
  // const [staffList, setStaffList] = useState([]); // Bỏ state nhân viên
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [tieuDe, setTieuDe] = useState('');
  const [moTa, setMoTa] = useState('');
  // const [selectedStaffId, setSelectedStaffId] = useState(''); // Bỏ state chọn nhân viên
  const [mucDoUuTien, setMucDoUuTien] = useState('Trung_bình'); // Giữ nguyên enum từ schema

  const { user } = useContext(AuthContext);

  // Fetch dịch vụ nội bộ
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError('');
      try {
        // Lấy tất cả dịch vụ
        const servicesRes = await fetch(`${API_URL}/dich-vu`);

        if (!servicesRes.ok) throw new Error('Không tải được danh sách dịch vụ');

        const servicesData = await servicesRes.json();

        // Lọc ra dịch vụ nội bộ (hien_thi_cho_cu_dan = 0)
        const internal = servicesData.filter(s => s.hien_thi_cho_cu_dan === 0 && s.trang_thai === 1); // Chỉ lấy dịch vụ nội bộ đang hoạt động
        setInternalServices(internal);

      } catch (err) {
        console.error("Lỗi fetch dịch vụ:", err);
        setError(err.message || 'Lỗi không xác định khi tải dịch vụ.');
        setInternalServices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Tự động điền tiêu đề khi chọn dịch vụ
  useEffect(() => {
    if (selectedServiceId) {
      const service = internalServices.find(s => s.id_dich_vu === parseInt(selectedServiceId));
      if (service && !tieuDe) {
        setTieuDe(`Yêu cầu nội bộ: ${service.ten_dich_vu}`);
      }
    }
  }, [selectedServiceId, internalServices, tieuDe]);


  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitMessage('');
    setError('');

    if (!user || user.vai_tro !== 'QuanLyToaNha') {
      setError("Bạn không có quyền thực hiện hành động này.");
      return;
    }
    if (!selectedServiceId || !tieuDe) {
      setError("Vui lòng chọn dịch vụ và nhập tiêu đề.");
      return;
    }

    setIsSubmitting(true);

    const requestData = {
      tieu_de: tieuDe.trim(),
      mo_ta: moTa.trim() || null,
      id_dich_vu: parseInt(selectedServiceId),
      // id_nhan_vien_phu_trach: null, // Bỏ gửi id nhân viên phụ trách
      muc_do_uu_tien: mucDoUuTien,
      id_quan_ly: user.id_nguoi_dung, // Gửi id của quản lý tạo yêu cầu
      // id_cu_dan sẽ là NULL (backend xử lý)
    };

    console.log('Dữ liệu yêu cầu nội bộ gửi đi:', requestData);

    try {
      // Gửi đến route POST /yeu-cau-dich-vu (Backend sẽ tự xác định là internal dựa vào id_quan_ly và id_dich_vu)
      // Hoặc nếu có route riêng cho manager tạo thì dùng route đó
      const response = await fetch(`${API_URL}/yeu-cau-dich-vu/manager`, { // Giả sử vẫn dùng route này
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
      const result = await response.json();
      if (response.ok) {
        setSubmitMessage(`Đã tạo yêu cầu nội bộ #${result.request?.id_yeu_cau || ''} thành công!`);
        // Reset form
        setSelectedServiceId(''); setTieuDe(''); setMoTa(''); setMucDoUuTien('Trung_bình');
      } else {
        setError(`Tạo yêu cầu thất bại: ${result.error || 'Lỗi không xác định'}`);
      }
    } catch (error) {
      console.error('Lỗi gửi yêu cầu API:', error);
      setError('Đã xảy ra lỗi mạng khi gửi yêu cầu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && internalServices.length === 0) return <div className="p-4 text-center">Đang tải dịch vụ...</div>;

  return (
    <div className="bg-white p-6 rounded shadow-md">
      <h1 className="text-xl font-semibold mb-4">Tạo Yêu cầu Nội bộ</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Chọn dịch vụ nội bộ */}
        <div>
          <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
            Chọn dịch vụ nội bộ <span className="text-red-500">*</span>
          </label>
          <select
            id="service"
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            required
            disabled={internalServices.length === 0 || loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
          >
            <option value="">{loading ? "Đang tải..." : (internalServices.length === 0 ? "-- Không có dịch vụ nội bộ nào đang hoạt động --" : "-- Chọn dịch vụ --")}</option>
            {internalServices.map((service) => (
              <option key={service.id_dich_vu} value={service.id_dich_vu}>
                {service.ten_dich_vu}
              </option>
            ))}
          </select>
        </div>

        {/* Tiêu đề */}
        <div>
          <label htmlFor="tieuDe" className="block text-sm font-medium text-gray-700 mb-1">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="tieuDe"
            value={tieuDe}
            onChange={(e) => setTieuDe(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Mô tả */}
        <div>
          <label htmlFor="moTa" className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả chi tiết (tùy chọn)
          </label>
          <textarea
            id="moTa"
            rows="3"
            value={moTa}
            onChange={(e) => setMoTa(e.target.value)}
            placeholder="Ví dụ: Vệ sinh khu vực hành lang tầng 3, block A..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          ></textarea>
        </div>

        {/* Bỏ phần Giao cho nhân viên */}
        {/* <div> ... </div> */}

        {/* Mức độ ưu tiên */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Mức độ ưu tiên
          </label>
          <select
            id="priority"
            value={mucDoUuTien}
            onChange={(e) => setMucDoUuTien(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="Thấp">Thấp</option>
            <option value="Trung_bình">Trung bình</option> {/* Giữ nguyên dấu gạch dưới nếu enum là vậy */}
            <option value="Cao">Cao</option>
            {/* <option value="Khẩn_cấp">Khẩn cấp</option> */} {/* Bỏ nếu schema không có */}
          </select>
        </div>

        {/* Thông báo lỗi/thành công */}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {submitMessage && <p className="text-sm text-green-600">{submitMessage}</p>}

        {/* Nút Submit */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting || !user || user.vai_tro !== 'QuanLyToaNha'}
            className={`w-full py-2 px-4 font-semibold rounded-md shadow text-white ${
              isSubmitting || !user || user.vai_tro !== 'QuanLyToaNha'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isSubmitting ? 'Đang tạo...' : 'Tạo Yêu Cầu'}
          </button>
           {(!user || user.vai_tro !== 'QuanLyToaNha') && <p className="text-xs text-red-500 mt-1">Chỉ quản lý mới có thể tạo yêu cầu.</p>}
        </div>
      </form>
    </div>
  );
}

export default ManagerCreateRequest;