import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

// --- Mock API Functions ---
// Giả lập danh sách nhân viên để phân công
const MOCK_STAFF_DB = [
    { id_nhan_vien: 10, ho_ten: "Trần Thị B (Nhân viên)", chuc_vu: "Nhân viên CSKH" },
    { id_nhan_vien: 11, ho_ten: "Nguyễn Văn E (Lao công)", chuc_vu: "Lao công" },
    { id_nhan_vien: 12, ho_ten: "Lê Văn F (Bảo vệ)", chuc_vu: "Bảo vệ" },
    { id_nhan_vien: 13, ho_ten: "Phạm Thị G (Kỹ thuật)", chuc_vu: "Nhân viên Kỹ thuật" },
];

const fetchStaffList = async (roleFilter = null) => {
    console.log(`API: Fetching staff list ${roleFilter ? `with role ${roleFilter}` : ''}`);
    // TODO: Replace with actual API: GET /api/nhan-vien?chuc_vu=...
    await new Promise(res => setTimeout(res, 200));
    if (!roleFilter) return [...MOCK_STAFF_DB];
    // Giả lập lọc theo chức vụ (cần chuẩn hóa tên chức vụ)
    return MOCK_STAFF_DB.filter(staff => staff.chuc_vu.toLowerCase().includes(roleFilter.toLowerCase()));
};

const createInternalRequestAPI = async (requestData) => {
    console.log("API: Creating internal request:", requestData);
    // TODO: Replace with actual API: POST /api/yeu-cau-noi-bo (hoặc endpoint tương ứng)
    // Body cần chứa: id_nguoi_tao, loai_yeu_cau, mo_ta, vi_tri, id_nhan_vien_duoc_giao, deadline (nếu có), ...
    await new Promise(res => setTimeout(res, 500));
    const newRequestId = Math.floor(Math.random() * 10000) + 1000;
    return { success: true, request: { ...requestData, id: newRequestId, trang_thai: 'Mới' } };
};
// --- End Mock API Functions ---

function ManagerInternalRequest() {
    const { user } = useContext(AuthContext);
    const [requestType, setRequestType] = useState('BaoTri'); // BaoTri, VeSinh, AnNinh, PCCC
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [assignedStaffId, setAssignedStaffId] = useState('');
    const [staffList, setStaffList] = useState([]);
    const [loadingStaff, setLoadingStaff] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');

    // Load danh sách nhân viên phù hợp khi loại yêu cầu thay đổi
    useEffect(() => {
        let roleFilter = null;
        switch (requestType) {
            case 'BaoTri': roleFilter = 'Kỹ thuật'; break;
            case 'VeSinh': roleFilter = 'Lao công'; break;
            case 'AnNinh': roleFilter = 'Bảo vệ'; break;
            case 'PCCC': roleFilter = 'Bảo vệ'; break; // Hoặc Kỹ thuật PCCC riêng
            default: roleFilter = null;
        }

        if (roleFilter) {
            setLoadingStaff(true);
            setStaffList([]); // Clear previous list
            setAssignedStaffId(''); // Reset selection
            fetchStaffList(roleFilter)
                .then(data => setStaffList(data))
                .catch(err => console.error("Failed to fetch staff:", err))
                .finally(() => setLoadingStaff(false));
        } else {
            setStaffList([]); // Clear list if no specific role needed (hoặc load tất cả?)
            setAssignedStaffId('');
        }
    }, [requestType]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description.trim() || !user || !user.id_nguoi_dung) {
            setSubmitMessage("Vui lòng nhập mô tả yêu cầu và đảm bảo bạn đã đăng nhập.");
            return;
        }
        // Kiểm tra xem có cần bắt buộc chọn nhân viên không tùy loại yêu cầu
        if (['BaoTri', 'VeSinh', 'AnNinh', 'PCCC'].includes(requestType) && !assignedStaffId) {
             setSubmitMessage("Vui lòng chọn nhân viên để phân công.");
             return;
        }

        setIsSubmitting(true);
        setSubmitMessage('');

        const requestData = {
            id_nguoi_tao: user.id_nguoi_dung,
            loai_yeu_cau: requestType,
            mo_ta: description.trim(),
            vi_tri: location.trim() || null, // Vị trí có thể không bắt buộc
            id_nhan_vien_duoc_giao: assignedStaffId ? parseInt(assignedStaffId) : null,
            ngay_tao: new Date().toISOString(),
            // Có thể thêm deadline, mức độ ưu tiên...
        };

        try {
            const result = await createInternalRequestAPI(requestData);
            if (result.success) {
                setSubmitMessage(`Tạo yêu cầu nội bộ #${result.request.id} (${requestType}) thành công!`);
                // Reset form
                setDescription('');
                setLocation('');
                setAssignedStaffId('');
                // Giữ lại requestType để tiện tạo tiếp? Hoặc reset cả nó.
                // setRequestType('BaoTri');
            } else {
                setSubmitMessage("Tạo yêu cầu thất bại.");
            }
        } catch (error) {
            console.error("Lỗi tạo yêu cầu nội bộ:", error);
            setSubmitMessage("Đã xảy ra lỗi khi tạo yêu cầu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded shadow-md max-w-lg mx-auto">
            <h1 className="text-xl font-semibold mb-4">Tạo Yêu cầu Nội bộ / Phân công</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Loại yêu cầu */}
                <div>
                    <label htmlFor="requestType" className="block text-sm font-medium text-gray-700 mb-1">Loại yêu cầu <span className="text-red-500">*</span></label>
                    <select id="requestType" value={requestType} onChange={e => setRequestType(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="BaoTri">Bảo trì / Sửa chữa</option>
                        <option value="VeSinh">Phân công Vệ sinh</option>
                        <option value="AnNinh">Phân công An ninh / Bảo vệ</option>
                        <option value="PCCC">Kiểm tra PCCC</option>
                        {/* Thêm các loại khác nếu cần */}
                    </select>
                </div>

                {/* Mô tả */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết <span className="text-red-500">*</span></label>
                    <textarea id="description" rows="4" value={description} onChange={e => setDescription(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Nội dung công việc, vấn đề cần xử lý..."></textarea>
                </div>

                {/* Vị trí (nếu cần) */}
                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Vị trí (nếu có)</label>
                    <input type="text" id="location" value={location} onChange={e => setLocation(e.target.value)} maxLength="150" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Ví dụ: Căn hộ A101, Hành lang tầng 5, Khu vực sảnh..." />
                </div>

                {/* Phân công nhân viên */}
                {['BaoTri', 'VeSinh', 'AnNinh', 'PCCC'].includes(requestType) && (
                    <div>
                        <label htmlFor="assignedStaff" className="block text-sm font-medium text-gray-700 mb-1">Phân công cho <span className="text-red-500">*</span></label>
                        <select
                            id="assignedStaff"
                            value={assignedStaffId}
                            onChange={e => setAssignedStaffId(e.target.value)}
                            required
                            disabled={loadingStaff || staffList.length === 0}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                        >
                            <option value="">{loadingStaff ? "Đang tải NV..." : (staffList.length === 0 ? "-- Không tìm thấy NV phù hợp --" : "-- Chọn nhân viên --")}</option>
                            {staffList.map(staff => (
                                <option key={staff.id_nhan_vien} value={staff.id_nhan_vien}>
                                    {staff.ho_ten} ({staff.chuc_vu})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                 {/* Có thể thêm Deadline, Mức độ ưu tiên... */}

                {submitMessage && (
                    <p className={`text-sm ${submitMessage.includes('thành công') ? 'text-green-600' : 'text-red-600'}`}>
                        {submitMessage}
                    </p>
                )}

                <div>
                    <button
                        type="submit"
                        disabled={isSubmitting || !user}
                        className={`w-full py-2 px-4 font-semibold rounded-md shadow text-white ${
                            isSubmitting || !user
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                        }`}
                    >
                        {isSubmitting ? 'Đang tạo...' : 'Tạo Yêu cầu / Phân công'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ManagerInternalRequest;