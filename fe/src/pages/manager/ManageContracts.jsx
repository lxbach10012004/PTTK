import React, { useState, useEffect, useCallback } from 'react';

const API_URL = 'http://172.21.92.186:5000/api'; // Thay IP nếu cần

// Helper function
const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
        return new Date(dateString).toLocaleDateString('vi-VN');
    } catch (e) { return dateString; }
};
const formatDateForInput = (dateString) => {
     if (!dateString) return '';
    try {
        return new Date(dateString).toISOString().split('T')[0];
    } catch (e) { return ''; }
}

function ManageContracts() {
    const [contracts, setContracts] = useState([]);
    const [apartments, setApartments] = useState([]);
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Form state
    const [isEditing, setIsEditing] = useState(false);
    const [currentContract, setCurrentContract] = useState(null);
    const [formData, setFormData] = useState({
        id_can_ho: '',
        id_cu_dan: '',
        ngay_bat_dau: '',
        ngay_ket_thuc: '',
        tien_dat_coc: '',
        loai_hop_dong: '',
        trang_thai: 'Hiệu_lực', // Enum: 'Hiệu_lực', 'Hết_hạn', 'Huỷ'
        ghi_chu: '',
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const [conRes, aptRes, resRes] = await Promise.all([
                fetch(`${API_URL}/hop-dong`), // Endpoint lấy hợp đồng
                fetch(`${API_URL}/can-ho`), // Lấy căn hộ để chọn
                fetch(`${API_URL}/nguoi-dung?vai_tro=CuDan`) // Lấy cư dân để chọn
            ]);

            let conData = [], aptData = [], resData = [];

            if (conRes.ok) {
                conData = await conRes.json();
                // Backend nên trả về cả ma_can và ho_ten cư dân để hiển thị
            } else {
                 const errData = await conRes.json().catch(() => ({ error: 'Không thể đọc phản hồi lỗi' }));
                 setError(prev => prev + ` Lỗi tải hợp đồng: ${errData.error || conRes.statusText}.`);
            }
            if (aptRes.ok) {
                 aptData = await aptRes.json();
            } else {
                 const errData = await aptRes.json().catch(() => ({ error: 'Không thể đọc phản hồi lỗi' }));
                 setError(prev => prev + ` Lỗi tải căn hộ: ${errData.error || aptRes.statusText}.`);
            }
            if (resRes.ok) {
                 resData = await resRes.json();
            } else {
                 const errData = await resRes.json().catch(() => ({ error: 'Không thể đọc phản hồi lỗi' }));
                 setError(prev => prev + ` Lỗi tải cư dân: ${errData.error || resRes.statusText}.`);
            }

            setContracts(conData);
            setApartments(aptData);
            setResidents(resData);

        } catch (err) {
            console.error("Lỗi fetch data:", err);
            setError(prev => prev + ` Lỗi mạng hoặc xử lý dữ liệu: ${err.message}.`);
            setContracts([]);
            setApartments([]);
            setResidents([]);
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
        setCurrentContract(null);
        setFormData({ id_can_ho: '', id_cu_dan: '', ngay_bat_dau: '', ngay_ket_thuc: '', tien_dat_coc: '', loai_hop_dong: '', trang_thai: 'Hiệu_lực', ghi_chu: '' });
        setMessage('');
        setError('');
    };

    const handleAddOrUpdate = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        const url = isEditing ? `${API_URL}/hop-dong/${currentContract.id_hop_dong}` : `${API_URL}/hop-dong`;
        const method = isEditing ? 'PUT' : 'POST';

        // Prepare data, convert types
        const dataToSend = {
            ...formData,
            id_can_ho: parseInt(formData.id_can_ho),
            id_cu_dan: parseInt(formData.id_cu_dan),
            tien_dat_coc: formData.tien_dat_coc ? parseFloat(formData.tien_dat_coc) : null,
            ngay_bat_dau: formData.ngay_bat_dau || null,
            ngay_ket_thuc: formData.ngay_ket_thuc || null,
        };

        if (!dataToSend.id_can_ho || !dataToSend.id_cu_dan || !dataToSend.ngay_bat_dau) {
            setError("Vui lòng chọn căn hộ, cư dân và nhập ngày bắt đầu.");
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
                throw new Error(result.error || `Lỗi ${isEditing ? 'cập nhật' : 'thêm'} hợp đồng`);
            }
            setMessage(result.message || `Hợp đồng đã được ${isEditing ? 'cập nhật' : 'thêm'} thành công.`);
            resetForm();
            fetchData(); // Refresh list
        } catch (err) {
            console.error(`Lỗi ${isEditing ? 'cập nhật' : 'thêm'} hợp đồng:`, err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (contract) => {
        setIsEditing(true);
        setCurrentContract(contract);
        setFormData({
            id_can_ho: String(contract.id_can_ho),
            id_cu_dan: String(contract.id_cu_dan),
            ngay_bat_dau: formatDateForInput(contract.ngay_bat_dau),
            ngay_ket_thuc: formatDateForInput(contract.ngay_ket_thuc),
            tien_dat_coc: contract.tien_dat_coc || '',
            loai_hop_dong: contract.loai_hop_dong || '',
            trang_thai: contract.trang_thai || 'Hiệu_lực',
            ghi_chu: contract.ghi_chu || '',
        });
        setMessage('');
        setError('');
        window.scrollTo(0, 0);
    };

    const handleDelete = async (contractId) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa hợp đồng ID ${contractId}?`)) {
            return;
        }
        setMessage('');
        setError('');
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/hop-dong/${contractId}`, { method: 'DELETE' });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Lỗi xóa hợp đồng');
            }
            setMessage(result.message || 'Xóa hợp đồng thành công.');
            fetchData(); // Refresh list
        } catch (err) {
            console.error("Lỗi xóa hợp đồng:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded shadow-md space-y-6">
            <h1 className="text-xl font-semibold">Quản lý Hợp đồng</h1>

            {/* Hiển thị lỗi fetch chung */}
            {error && !loading && <p className="text-sm text-red-600 bg-red-100 p-3 rounded mb-4">{error}</p>}

            {/* Form Add/Edit */}
            <form onSubmit={handleAddOrUpdate} className="p-4 border rounded bg-gray-50 space-y-3">
                <h2 className="text-lg font-medium">{isEditing ? `Sửa hợp đồng ID: ${currentContract?.id_hop_dong}` : 'Thêm Hợp đồng mới'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Chọn Căn hộ */}
                    <div>
                        <label htmlFor="id_can_ho" className="block text-sm font-medium text-gray-700">Căn hộ <span className="text-red-500">*</span></label>
                        <select name="id_can_ho" id="id_can_ho" value={formData.id_can_ho} onChange={handleInputChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" disabled={apartments.length === 0}>
                            <option value="">-- {apartments.length === 0 ? 'Đang tải/Lỗi' : 'Chọn căn hộ'} --</option>
                            {apartments.map(apt => (
                                <option key={apt.id_can_ho} value={apt.id_can_ho}>
                                    {apt.ma_can} ({apt.toa_nha || 'N/A'})
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Chọn Cư dân */}
                    <div>
                        <label htmlFor="id_cu_dan" className="block text-sm font-medium text-gray-700">Cư dân <span className="text-red-500">*</span></label>
                        <select name="id_cu_dan" id="id_cu_dan" value={formData.id_cu_dan} onChange={handleInputChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" disabled={residents.length === 0}>
                            <option value="">-- {residents.length === 0 ? 'Đang tải/Lỗi' : 'Chọn cư dân'} --</option>
                            {residents.map(res => (
                                <option key={res.id_nguoi_dung} value={res.id_nguoi_dung}>
                                    {res.ho_ten} (ID: {res.id_nguoi_dung})
                                </option>
                            ))}
                        </select>
                    </div>
                     {/* Loại hợp đồng */}
                     <div>
                        <label htmlFor="loai_hop_dong" className="block text-sm font-medium text-gray-700">Loại hợp đồng</label>
                        <input type="text" name="loai_hop_dong" id="loai_hop_dong" value={formData.loai_hop_dong} onChange={handleInputChange} placeholder="Mua bán, Cho thuê,..." className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    {/* Ngày bắt đầu */}
                    <div>
                        <label htmlFor="ngay_bat_dau" className="block text-sm font-medium text-gray-700">Ngày bắt đầu <span className="text-red-500">*</span></label>
                        <input type="date" name="ngay_bat_dau" id="ngay_bat_dau" value={formData.ngay_bat_dau} onChange={handleInputChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    {/* Ngày kết thúc */}
                    <div>
                        <label htmlFor="ngay_ket_thuc" className="block text-sm font-medium text-gray-700">Ngày kết thúc</label>
                        <input type="date" name="ngay_ket_thuc" id="ngay_ket_thuc" value={formData.ngay_ket_thuc} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    {/* Tiền đặt cọc */}
                    <div>
                        <label htmlFor="tien_dat_coc" className="block text-sm font-medium text-gray-700">Tiền đặt cọc</label>
                        <input type="number" step="1000" name="tien_dat_coc" id="tien_dat_coc" value={formData.tien_dat_coc} onChange={handleInputChange} placeholder="VNĐ" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    {/* Trạng thái */}
                    <div>
                        <label htmlFor="trang_thai" className="block text-sm font-medium text-gray-700">Trạng thái</label>
                        <select name="trang_thai" id="trang_thai" value={formData.trang_thai} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                            <option value="Hiệu_lực">Hiệu lực</option>
                            <option value="Hết_hạn">Hết hạn</option>
                            <option value="Huỷ">Huỷ</option>
                        </select>
                    </div>
                     {/* Ghi chú */}
                     <div className="md:col-span-3">
                        <label htmlFor="ghi_chu" className="block text-sm font-medium text-gray-700">Ghi chú</label>
                        <textarea name="ghi_chu" id="ghi_chu" rows="2" value={formData.ghi_chu} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
                    </div>
                </div>
                {/* Hiển thị lỗi/message của form */}
                {error && <p className="text-sm text-red-600">{error}</p>}
                {message && <p className="text-sm text-green-600">{message}</p>}
                <div className="flex items-center space-x-3">
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400">
                        {loading ? 'Đang xử lý...' : (isEditing ? 'Lưu thay đổi' : 'Thêm Hợp đồng')}
                    </button>
                    {isEditing && (
                        <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400">
                            Hủy sửa
                        </button>
                    )}
                </div>
            </form>

            {/* Contract List */}
            <div className="overflow-x-auto">
                <h2 className="text-lg font-semibold mb-3">Danh sách Hợp đồng</h2>
                {loading && !contracts.length ? <p>Đang tải...</p> : null}
                {!loading && !error && contracts.length === 0 ? <p>Không có hợp đồng nào.</p> : null}
                {contracts.length > 0 && (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mã Căn</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cư dân</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ngày BĐ</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ngày KT</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {contracts.map(contract => (
                                <tr key={contract.id_hop_dong}>
                                    <td className="px-4 py-2 text-sm">{contract.id_hop_dong}</td>
                                    {/* Backend cần trả về ma_can và ho_ten */}
                                    <td className="px-4 py-2 text-sm font-medium">{contract.ma_can || `(ID: ${contract.id_can_ho})`}</td>
                                    <td className="px-4 py-2 text-sm">{contract.ho_ten_cu_dan || `(ID: ${contract.id_cu_dan})`}</td>
                                    <td className="px-4 py-2 text-sm">{formatDate(contract.ngay_bat_dau)}</td>
                                    <td className="px-4 py-2 text-sm">{formatDate(contract.ngay_ket_thuc)}</td>
                                    <td className="px-4 py-2 text-sm">{contract.trang_thai?.replace('_', ' ')}</td>
                                    <td className="px-4 py-2 text-sm space-x-2">
                                        <button onClick={() => handleEdit(contract)} className="text-blue-600 hover:text-blue-800">Sửa</button>
                                        <button onClick={() => handleDelete(contract.id_hop_dong)} className="text-red-600 hover:text-red-800">Xóa</button>
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

export default ManageContracts;