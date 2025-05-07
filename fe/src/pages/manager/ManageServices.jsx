import React, { useState, useEffect, useCallback } from 'react';

const API_URL = 'https://mmncb6j3-5000.asse.devtunnels.ms/api'; // Thay IP nếu cần

// Helper function (reuse)
const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '-';
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

function ManageServices() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Form state
    const [isEditing, setIsEditing] = useState(false);
    const [currentService, setCurrentService] = useState(null);
    const [formData, setFormData] = useState({
        ten_dich_vu: '',
        don_gia: '',
        don_vi_tinh: '',
        mo_ta: '',
        trang_thai: 1, // 1: Hoạt động, 0: Không hoạt động
        hien_thi_cho_cu_dan: 0, // 1: Có, 0: Không (Nội bộ)
    });

    const fetchServices = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_URL}/dich-vu`); // Lấy tất cả dịch vụ
            if (!response.ok) throw new Error('Không tải được danh sách dịch vụ');
            const data = await response.json();
            setServices(data);
        } catch (err) {
            setError(err.message);
            setServices([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
        }));
    };

     const handleSelectChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: parseInt(value) // Ensure trang_thai and hien_thi are numbers
        }));
    };


    const resetForm = () => {
        setIsEditing(false);
        setCurrentService(null);
        setFormData({ ten_dich_vu: '', don_gia: '', don_vi_tinh: '', mo_ta: '', trang_thai: 1, hien_thi_cho_cu_dan: 0 });
        setMessage('');
        setError('');
    };

    const handleAddOrUpdate = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        const url = isEditing ? `${API_URL}/dich-vu/${currentService.id_dich_vu}` : `${API_URL}/dich-vu`;
        const method = isEditing ? 'PUT' : 'POST';

        // Prepare data, convert types
        const dataToSend = {
            ...formData,
            don_gia: formData.don_gia ? parseFloat(formData.don_gia) : 0,
            trang_thai: parseInt(formData.trang_thai),
            hien_thi_cho_cu_dan: parseInt(formData.hien_thi_cho_cu_dan),
        };
         if (!dataToSend.ten_dich_vu || !dataToSend.don_vi_tinh) {
             setError("Tên dịch vụ và Đơn vị tính là bắt buộc.");
             setLoading(false);
             return;
         }
         if (isNaN(dataToSend.don_gia)) {
             setError("Đơn giá phải là một số.");
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
                throw new Error(result.error || `Lỗi ${isEditing ? 'cập nhật' : 'thêm'} dịch vụ`);
            }
            setMessage(result.message || `Dịch vụ đã được ${isEditing ? 'cập nhật' : 'thêm'} thành công.`);
            resetForm();
            fetchServices();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (service) => {
        setIsEditing(true);
        setCurrentService(service);
        setFormData({
            ten_dich_vu: service.ten_dich_vu,
            don_gia: service.don_gia || '',
            don_vi_tinh: service.don_vi_tinh,
            mo_ta: service.mo_ta || '',
            trang_thai: service.trang_thai, // Should be 0 or 1
            hien_thi_cho_cu_dan: service.hien_thi_cho_cu_dan, // Should be 0 or 1
        });
        setMessage('');
        setError('');
        window.scrollTo(0, 0);
    };

    const handleDelete = async (serviceId) => {
        // Soft delete (set trang_thai = 0)
        if (!window.confirm(`Bạn có chắc chắn muốn ẩn dịch vụ ID ${serviceId}? Dịch vụ này sẽ không thể được chọn cho yêu cầu mới.`)) {
            return;
        }
        setMessage('');
        setError('');
        setLoading(true);
        try {
            // API uses DELETE method, but backend service performs an update (soft delete)
            const response = await fetch(`${API_URL}/dich-vu/${serviceId}`, { method: 'DELETE' });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Lỗi ẩn dịch vụ');
            }
            setMessage(result.message || 'Ẩn dịch vụ thành công.');
            fetchServices(); // Refresh list to show updated status
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="bg-white p-6 rounded shadow-md space-y-6">
            <h1 className="text-xl font-semibold">Quản lý Dịch vụ</h1>

            {/* Form Add/Edit */}
            <form onSubmit={handleAddOrUpdate} className="p-4 border rounded bg-gray-50 space-y-3">
                <h2 className="text-lg font-medium">{isEditing ? `Sửa dịch vụ: ${currentService?.ten_dich_vu}` : 'Thêm Dịch vụ mới'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label htmlFor="ten_dich_vu" className="block text-sm font-medium text-gray-700">Tên dịch vụ <span className="text-red-500">*</span></label>
                        <input type="text" name="ten_dich_vu" id="ten_dich_vu" value={formData.ten_dich_vu} onChange={handleInputChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                     <div>
                        <label htmlFor="don_vi_tinh" className="block text-sm font-medium text-gray-700">Đơn vị tính <span className="text-red-500">*</span></label>
                        <input type="text" name="don_vi_tinh" id="don_vi_tinh" value={formData.don_vi_tinh} onChange={handleInputChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div>
                        <label htmlFor="don_gia" className="block text-sm font-medium text-gray-700">Đơn giá (VNĐ)</label>
                        <input type="number" step="1" name="don_gia" id="don_gia" value={formData.don_gia} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                     <div>
                        <label htmlFor="trang_thai" className="block text-sm font-medium text-gray-700">Trạng thái</label>
                        <select name="trang_thai" id="trang_thai" value={formData.trang_thai} onChange={handleSelectChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                            <option value={1}>Hoạt động</option>
                            <option value={0}>Không hoạt động</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="hien_thi_cho_cu_dan" className="block text-sm font-medium text-gray-700">Phân loại</label>
                        <select name="hien_thi_cho_cu_dan" id="hien_thi_cho_cu_dan" value={formData.hien_thi_cho_cu_dan} onChange={handleSelectChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                            <option value={0}>Nội bộ (Quản lý/NV)</option>
                            <option value={1}>Cho Cư dân</option>
                        </select>
                    </div>
                    <div className="md:col-span-3">
                        <label htmlFor="mo_ta" className="block text-sm font-medium text-gray-700">Mô tả</label>
                        <textarea name="mo_ta" id="mo_ta" rows="2" value={formData.mo_ta} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
                    </div>
                </div>
                 {error && <p className="text-sm text-red-600">{error}</p>}
                 {message && <p className="text-sm text-green-600">{message}</p>}
                <div className="flex items-center space-x-3">
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400">
                        {loading ? 'Đang xử lý...' : (isEditing ? 'Lưu thay đổi' : 'Thêm Dịch vụ')}
                    </button>
                    {isEditing && (
                        <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400">
                            Hủy sửa
                        </button>
                    )}
                </div>
            </form>

            {/* Service List */}
            <div className="overflow-x-auto">
                <h2 className="text-lg font-semibold mb-3">Danh sách Dịch vụ</h2>
                 {loading && !services.length ? <p>Đang tải...</p> : null}
                {!loading && error && !services.length ? <p className="text-red-600">{error}</p> : null}
                {!loading && !error && services.length === 0 ? <p>Không có dịch vụ nào.</p> : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tên dịch vụ</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Đơn giá</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ĐVT</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {services.map(service => (
                                <tr key={service.id_dich_vu} className={service.trang_thai === 0 ? 'bg-gray-100 opacity-60' : ''}>
                                    <td className="px-4 py-2 text-sm">{service.id_dich_vu}</td>
                                    <td className="px-4 py-2 text-sm font-medium">{service.ten_dich_vu}</td>
                                    <td className="px-4 py-2 text-sm text-right">{formatCurrency(service.don_gia)}</td>
                                    <td className="px-4 py-2 text-sm">{service.don_vi_tinh}</td>
                                    <td className="px-4 py-2 text-sm">{service.hien_thi_cho_cu_dan ? 'Cư dân' : 'Nội bộ'}</td>
                                    <td className="px-4 py-2 text-sm">
                                        {service.trang_thai === 1 ?
                                            <span className="text-green-600">Hoạt động</span> :
                                            <span className="text-red-600">Không HĐ</span>
                                        }
                                    </td>
                                    <td className="px-4 py-2 text-sm space-x-2">
                                        <button onClick={() => handleEdit(service)} className="text-blue-600 hover:text-blue-800">Sửa</button>
                                        {/* Chỉ hiển thị nút ẩn nếu đang hoạt động */}
                                        {service.trang_thai === 1 && (
                                            <button onClick={() => handleDelete(service.id_dich_vu)} className="text-red-600 hover:text-red-800">Ẩn</button>
                                        )}
                                         {/* Có thể thêm nút "Hiện lại" nếu cần */}
                                         {service.trang_thai === 0 && (
                                             <button onClick={() => handleEdit(service)} className="text-green-600 hover:text-green-800">Hiện lại</button> // Dùng form Sửa để đổi trạng thái
                                         )}
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

export default ManageServices;