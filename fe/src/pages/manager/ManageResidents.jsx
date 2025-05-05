import React, { useState, useEffect, useCallback } from 'react';

const API_URL = 'http://172.21.92.186:5000/api'; // Thay IP nếu cần

// Helper function (reuse)
const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    try {
        const date = new Date(dateTimeString);
         // Giả sử schema không có cột ngay_tao cho nguoi_dung, bỏ format nếu không cần
        // return date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
         return date.toLocaleDateString('vi-VN'); // Chỉ hiển thị ngày nếu cần
    } catch (e) { return dateTimeString; }
};

function ManageResidents() {
    const [residentList, setResidentList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Form state
    const [isEditing, setIsEditing] = useState(false);
    const [currentResident, setCurrentResident] = useState(null);
    const [formData, setFormData] = useState({
        ho_ten: '',
        email: '',
        so_dien_thoai: '',
        mat_khau: '', // Only for adding
        // Các trường khác của cư dân nếu cần thêm vào form (ví dụ: ngay_chuyen_den)
        ngay_chuyen_den: '',
    });

    const fetchResidents = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // Sử dụng endpoint lấy người dùng theo vai trò
            const response = await fetch(`${API_URL}/nguoi-dung?vai_tro=CuDan`);
             if (!response.ok) {
                 const errData = await response.json().catch(() => ({ error: 'Không thể đọc phản hồi lỗi' }));
                 throw new Error(errData.error || `Lỗi ${response.status}: Không tải được danh sách cư dân`);
            }
            const data = await response.json();
             // Backend cần trả về thông tin join từ nguoi_dung và cu_dan
            setResidentList(data);
        } catch (err) {
            console.error("Lỗi fetch cư dân:", err);
            setError(err.message);
            setResidentList([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchResidents();
    }, [fetchResidents]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setIsEditing(false);
        setCurrentResident(null);
        setFormData({ ho_ten: '', email: '', so_dien_thoai: '', mat_khau: '', ngay_chuyen_den: '' });
        setMessage('');
        setError('');
    };

    const handleAddOrUpdate = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        // Endpoint xử lý người dùng (backend sẽ tự phân vai trò)
        // Hoặc cần endpoint riêng cho việc tạo/sửa cư dân
        const url = isEditing ? `${API_URL}/nguoi-dung/resident/${currentResident.id_nguoi_dung}` : `${API_URL}/nguoi-dung/resident`; // Giả định endpoint này tồn tại
        const method = isEditing ? 'PUT' : 'POST';

        const dataToSend = { ...formData };
        if (isEditing) {
            delete dataToSend.mat_khau;
        } else if (!dataToSend.mat_khau) {
             setError("Mật khẩu là bắt buộc khi thêm mới.");
             setLoading(false);
             return;
        }
         if (!dataToSend.ho_ten || !dataToSend.email) {
             setError("Họ tên và Email là bắt buộc.");
             setLoading(false);
             return;
         }
         // Gửi cả vai trò để backend biết
         dataToSend.vai_tro = 'CuDan';
         // Format lại ngày nếu cần trước khi gửi
         if (dataToSend.ngay_chuyen_den === '') {
            dataToSend.ngay_chuyen_den = null; // Gửi null nếu trống
         }


        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || `Lỗi ${isEditing ? 'cập nhật' : 'thêm'} cư dân`);
            }
            setMessage(result.message || `Cư dân đã được ${isEditing ? 'cập nhật' : 'thêm'} thành công.`);
            resetForm();
            fetchResidents();
        } catch (err) {
            console.error(`Lỗi ${isEditing ? 'cập nhật' : 'thêm'} cư dân:`, err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (resident) => {
        setIsEditing(true);
        setCurrentResident(resident);
        // Format ngày về yyyy-MM-dd cho input type="date"
        const ngayChuyenDenFormatted = resident.ngay_chuyen_den ? new Date(resident.ngay_chuyen_den).toISOString().split('T')[0] : '';
        setFormData({
            ho_ten: resident.ho_ten,
            email: resident.email,
            so_dien_thoai: resident.so_dien_thoai || '',
            mat_khau: '',
            ngay_chuyen_den: ngayChuyenDenFormatted,
        });
        setMessage('');
        setError('');
        window.scrollTo(0, 0);
    };

    const handleDelete = async (residentId) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa cư dân ID ${residentId}? Việc này có thể ảnh hưởng đến các bản ghi liên quan (căn hộ, hóa đơn...).`)) {
            return;
        }
        setMessage('');
        setError('');
        setLoading(true);
        try {
            // Endpoint xóa người dùng (backend xử lý cascade hoặc logic liên quan)
            const response = await fetch(`${API_URL}/nguoi-dung/${residentId}`, { method: 'DELETE' }); // Dùng endpoint chung
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Lỗi xóa cư dân');
            }
            setMessage(result.message || 'Xóa cư dân thành công.');
            fetchResidents();
        } catch (err) {
            console.error("Lỗi xóa cư dân:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded shadow-md space-y-6">
            <h1 className="text-xl font-semibold">Quản lý Cư dân</h1>

            {/* Form Add/Edit */}
            <form onSubmit={handleAddOrUpdate} className="p-4 border rounded bg-gray-50 space-y-3">
                <h2 className="text-lg font-medium">{isEditing ? `Sửa thông tin CĐ: ${currentResident?.ho_ten}` : 'Thêm Cư dân mới'}</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="ho_ten" className="block text-sm font-medium text-gray-700">Họ tên <span className="text-red-500">*</span></label>
                        <input type="text" name="ho_ten" id="ho_ten" value={formData.ho_ten} onChange={handleInputChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div>
                        <label htmlFor="so_dien_thoai" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                        <input type="tel" name="so_dien_thoai" id="so_dien_thoai" value={formData.so_dien_thoai} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                     <div>
                        <label htmlFor="ngay_chuyen_den" className="block text-sm font-medium text-gray-700">Ngày chuyển đến</label>
                        <input type="date" name="ngay_chuyen_den" id="ngay_chuyen_den" value={formData.ngay_chuyen_den} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    {!isEditing && (
                        <div>
                            <label htmlFor="mat_khau" className="block text-sm font-medium text-gray-700">Mật khẩu <span className="text-red-500">*</span></label>
                            <input type="password" name="mat_khau" id="mat_khau" value={formData.mat_khau} onChange={handleInputChange} required={!isEditing} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                        </div>
                    )}
                </div>
                 {error && <p className="text-sm text-red-600">{error}</p>}
                 {message && <p className="text-sm text-green-600">{message}</p>}
                <div className="flex items-center space-x-3">
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400">
                        {loading ? 'Đang xử lý...' : (isEditing ? 'Lưu thay đổi' : 'Thêm Cư dân')}
                    </button>
                    {isEditing && (
                        <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400">
                            Hủy sửa
                        </button>
                    )}
                </div>
            </form>

            {/* Resident List */}
            <div className="overflow-x-auto">
                <h2 className="text-lg font-semibold mb-3">Danh sách Người dùng</h2>
                {loading && !residentList.length ? <p>Đang tải...</p> : null}
                {!loading && error && !residentList.length ? <p className="text-red-600">{error}</p> : null}
                {!loading && !error && residentList.length === 0 ? <p>Không có cư dân nào.</p> : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                {/* <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SĐT</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ngày chuyển đến</th> */}
                                {/* <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th> */}
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {residentList.map(resident => (
                                <tr key={resident.id_nguoi_dung}>
                                    <td className="px-4 py-2 text-sm">{resident.id_nguoi_dung}</td>
                                    <td className="px-4 py-2 text-sm font-medium">{resident.ho_ten}</td>
                                    <td className="px-4 py-2 text-sm">{resident.email}</td>
                                    {/* <td className="px-4 py-2 text-sm">{resident.so_dien_thoai || '-'}</td>
                                    <td className="px-4 py-2 text-sm">{resident.ngay_chuyen_den ? formatDateTime(resident.ngay_chuyen_den) : '-'}</td> */}
                                    {/* <td className="px-4 py-2 text-sm">{formatDateTime(resident.ngay_tao)}</td> */} {/* Bỏ nếu không có */}
                                    <td className="px-4 py-2 text-sm space-x-2">
                                        <button onClick={() => handleEdit(resident)} className="text-blue-600 hover:text-blue-800">Sửa</button>
                                        <button onClick={() => handleDelete(resident.id_nguoi_dung)} className="text-red-600 hover:text-red-800">Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default ManageResidents;