import React, { useState, useEffect, useCallback } from 'react';

const API_URL = 'https://mmncb6j3-5000.asse.devtunnels.ms/api'; // Thay IP nếu cần

function ManageApartments() {
    const [apartments, setApartments] = useState([]);
    // const [residents, setResidents] = useState([]); // Bỏ state residents nếu không dùng nữa
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Form state - Bỏ id_chu_ho
    const [isEditing, setIsEditing] = useState(false);
    const [currentApartment, setCurrentApartment] = useState(null);
    const [formData, setFormData] = useState({
        ma_can: '',
        toa_nha: '',
        tang: '',
        dien_tich: '',
        so_phong_ngu: '',
        so_phong_tam: '',
        trang_thai: 'Trống',
        // id_chu_ho: '', // <-- Bỏ trường này
    });

    // Chỉ fetch căn hộ
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            // Chỉ fetch căn hộ, backend cần trả về thông tin chủ hộ hiện tại (ten_chu_ho) qua join
            const aptRes = await fetch(`${API_URL}/can-ho`);

            if (!aptRes.ok) {
                 const errData = await aptRes.json().catch(() => ({ error: 'Không thể đọc phản hồi lỗi' }));
                 throw new Error(`Lỗi tải căn hộ: ${errData.error || aptRes.statusText}`);
            }
            const aptData = await aptRes.json();
            setApartments(aptData);

        } catch (err) {
            console.error("Lỗi fetch căn hộ:", err);
            setError(err.message);
            setApartments([]);
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setIsEditing(false);
        setCurrentApartment(null);
        // Bỏ id_chu_ho khỏi reset
        setFormData({ ma_can: '', toa_nha: '', tang: '', dien_tich: '', so_phong_ngu: '', so_phong_tam: '', trang_thai: 'Trống' });
        setMessage('');
        setError('');
    };

    const handleAddOrUpdate = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        const url = isEditing ? `${API_URL}/can-ho/${currentApartment.id_can_ho}` : `${API_URL}/can-ho`;
        const method = isEditing ? 'PUT' : 'POST';

        // Prepare data - Bỏ id_chu_ho
        const dataToSend = {
            ...formData,
            tang: formData.tang ? parseInt(formData.tang) : null,
            dien_tich: formData.dien_tich ? parseFloat(formData.dien_tich) : null,
            so_phong_ngu: formData.so_phong_ngu ? parseInt(formData.so_phong_ngu) : null,
            so_phong_tam: formData.so_phong_tam ? parseInt(formData.so_phong_tam) : null,
            // id_chu_ho: formData.id_chu_ho ? parseInt(formData.id_chu_ho) : null, // <-- Bỏ dòng này
        };
         if (!dataToSend.ma_can) {
             setError("Mã căn hộ là bắt buộc.");
             setLoading(false);
             return;
         }

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || `Lỗi ${isEditing ? 'cập nhật' : 'thêm'} căn hộ`);
            }
            setMessage(result.message || `Căn hộ đã được ${isEditing ? 'cập nhật' : 'thêm'} thành công.`);
            resetForm();
            fetchData();
        } catch (err) {
            console.error(`Lỗi ${isEditing ? 'cập nhật' : 'thêm'} căn hộ:`, err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (apt) => {
        setIsEditing(true);
        setCurrentApartment(apt);
        // Bỏ id_chu_ho khỏi form data
        setFormData({
            ma_can: apt.ma_can || '',
            toa_nha: apt.toa_nha || '',
            tang: apt.tang || '',
            dien_tich: apt.dien_tich || '',
            so_phong_ngu: apt.so_phong_ngu || '',
            so_phong_tam: apt.so_phong_tam || '',
            trang_thai: apt.trang_thai || 'Trống',
            // id_chu_ho: apt.id_chu_ho ? String(apt.id_chu_ho) : '', // <-- Bỏ dòng này
        });
        setMessage('');
        setError('');
        window.scrollTo(0, 0);
    };

    const handleDelete = async (aptId) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa căn hộ ID ${aptId}? Việc này có thể ảnh hưởng đến hợp đồng liên quan.`)) {
            return;
        }
        setMessage('');
        setError('');
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/can-ho/${aptId}`, { method: 'DELETE' });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Lỗi xóa căn hộ');
            }
            setMessage(result.message || 'Xóa căn hộ thành công.');
            fetchData();
        } catch (err) {
             console.error("Lỗi xóa căn hộ:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded shadow-md space-y-6">
            <h1 className="text-xl font-semibold">Quản lý Căn hộ</h1>

             {/* Hiển thị lỗi fetch chung */}
             {error && !loading && <p className="text-sm text-red-600 bg-red-100 p-3 rounded mb-4">{error}</p>}


            {/* Form Add/Edit */}
            <form onSubmit={handleAddOrUpdate} className="p-4 border rounded bg-gray-50 space-y-3">
                <h2 className="text-lg font-medium">{isEditing ? `Sửa căn hộ: ${currentApartment?.ma_can}` : 'Thêm Căn hộ mới'}</h2>
                {/* Giữ nguyên các input khác */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div>
                        <label htmlFor="ma_can" className="block text-sm font-medium text-gray-700">Mã căn hộ <span className="text-red-500">*</span></label>
                        <input type="text" name="ma_can" id="ma_can" value={formData.ma_can} onChange={handleInputChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                     <div>
                        <label htmlFor="toa_nha" className="block text-sm font-medium text-gray-700">Tòa nhà</label>
                        <input type="text" name="toa_nha" id="toa_nha" value={formData.toa_nha} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div>
                        <label htmlFor="tang" className="block text-sm font-medium text-gray-700">Tầng</label>
                        <input type="number" name="tang" id="tang" value={formData.tang} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div>
                        <label htmlFor="dien_tich" className="block text-sm font-medium text-gray-700">Diện tích (m²)</label>
                        <input type="number" step="0.01" name="dien_tich" id="dien_tich" value={formData.dien_tich} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                     <div>
                        <label htmlFor="so_phong_ngu" className="block text-sm font-medium text-gray-700">Số phòng ngủ</label>
                        <input type="number" name="so_phong_ngu" id="so_phong_ngu" value={formData.so_phong_ngu} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                     <div>
                        <label htmlFor="so_phong_tam" className="block text-sm font-medium text-gray-700">Số phòng tắm</label>
                        <input type="number" name="so_phong_tam" id="so_phong_tam" value={formData.so_phong_tam} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div>
                        <label htmlFor="trang_thai" className="block text-sm font-medium text-gray-700">Trạng thái</label>
                        <select name="trang_thai" id="trang_thai" value={formData.trang_thai} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                            <option value="Trống">Trống</option>
                            <option value="Đang_ở">Đang ở</option>
                            <option value="Đang_sửa">Đang sửa</option>
                        </select>
                    </div>
                    {/* Bỏ dropdown chọn chủ hộ */}
                    {/* <div className="md:col-span-2"> ... </div> */}
                </div>
                 {/* Hiển thị lỗi/message của form */}
                 {error && <p className="text-sm text-red-600">{error}</p>}
                 {message && <p className="text-sm text-green-600">{message}</p>}
                <div className="flex items-center space-x-3">
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400">
                        {loading ? 'Đang xử lý...' : (isEditing ? 'Lưu thay đổi' : 'Thêm Căn hộ')}
                    </button>
                    {isEditing && (
                        <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400">
                            Hủy sửa
                        </button>
                    )}
                </div>
            </form>

            {/* Apartment List - Cập nhật cột Chủ hộ */}
            <div className="overflow-x-auto">
                <h2 className="text-lg font-semibold mb-3">Danh sách Căn hộ</h2>
                {loading && !apartments.length ? <p>Đang tải...</p> : null}
                {!loading && !error && apartments.length === 0 ? <p>Không có căn hộ nào.</p> : null}
                {apartments.length > 0 && (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mã Căn</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tòa nhà</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tầng</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Diện tích</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                {/* Cập nhật tên cột */}
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cư dân (HĐ hiệu lực)</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {apartments.map(apt => (
                                <tr key={apt.id_can_ho}>
                                    <td className="px-4 py-2 text-sm font-medium">{apt.ma_can}</td>
                                    <td className="px-4 py-2 text-sm">{apt.toa_nha || '-'}</td>
                                    <td className="px-4 py-2 text-sm">{apt.tang || '-'}</td>
                                    <td className="px-4 py-2 text-sm">{apt.dien_tich ? `${apt.dien_tich} m²` : '-'}</td>
                                    <td className="px-4 py-2 text-sm">{apt.trang_thai?.replace('_', ' ')}</td>
                                    {/* Hiển thị tên cư dân từ backend (join từ hợp đồng hiệu lực) */}
                                    <td className="px-4 py-2 text-sm">{apt.ten_cu_dan_hien_tai || '-'}</td>
                                    <td className="px-4 py-2 text-sm space-x-2">
                                        <button onClick={() => handleEdit(apt)} className="text-blue-600 hover:text-blue-800">Sửa</button>
                                        <button onClick={() => handleDelete(apt.id_can_ho)} className="text-red-600 hover:text-red-800">Xóa</button>
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

export default ManageApartments;