import React, { useState, useEffect } from 'react';

const API_URL = 'https://mmncb6j3-5000.asse.devtunnels.ms/api'; // Thay IP nếu cần

// Helper functions for formatting (reuse or create in a utils file)
const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    try {
        const date = new Date(dateTimeString);
        return date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
    } catch (e) { return dateTimeString; }
};

const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '-';
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

const formatRequestStatus = (status) => {
    // Tùy chỉnh màu sắc/text theo trạng thái
    const statusMap = {
        'Mới': 'bg-blue-100 text-blue-800',
        'Đang_xử_lý': 'bg-yellow-100 text-yellow-800',
        'Hoàn_thành': 'bg-green-100 text-green-800',
        'Đã_hủy': 'bg-red-100 text-red-800',
        'Chờ_thanh_toán': 'bg-purple-100 text-purple-800',
    };
    const classes = statusMap[status] || 'bg-gray-100 text-gray-800';
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${classes}`}>{status.replace('_', ' ')}</span>;
};

const formatFeedbackStatus = (status) => {
    // Tương tự formatRequestStatus
    const statusMap = {
        'Mới': 'bg-blue-100 text-blue-800',
        'Đã_xem': 'bg-yellow-100 text-yellow-800',
        'Đã_phản_hồi': 'bg-green-100 text-green-800',
    };
     const classes = statusMap[status] || 'bg-gray-100 text-gray-800';
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${classes}`}>{status || 'N/A'}</span>;
};


function ViewReports() {
    const [requests, setRequests] = useState([]);
    const [feedback, setFeedback] = useState([]);
    const [financialReports, setFinancialReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('requests'); // 'requests', 'feedback', 'financial'

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch all data concurrently
                const [reqRes, fbRes, finRes] = await Promise.all([
                    fetch(`${API_URL}/yeu-cau-dich-vu`), // Manager gets all by default
                    fetch(`${API_URL}/phan-hoi-cu-dan`),
                    fetch(`${API_URL}/bao-cao/thu-chi`)
                ]);

                if (!reqRes.ok) throw new Error('Không tải được yêu cầu dịch vụ');
                if (!fbRes.ok) throw new Error('Không tải được phản hồi');
                if (!finRes.ok) throw new Error('Không tải được báo cáo tài chính');

                const reqData = await reqRes.json();
                const fbData = await fbRes.json();
                const finData = await finRes.json();

                setRequests(reqData);
                setFeedback(fbData);
                setFinancialReports(finData);

            } catch (err) {
                console.error("Lỗi fetch báo cáo:", err);
                setError(err.message || 'Lỗi không xác định khi tải báo cáo.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const renderContent = () => {
        if (loading) return <div className="p-4 text-center">Đang tải dữ liệu...</div>;
        if (error) return <div className="p-4 text-center text-red-600">{error}</div>;

        switch (activeTab) {
            case 'requests':
                return (
                    <div className="overflow-x-auto">
                        <h2 className="text-lg font-semibold mb-3">Danh sách Yêu cầu Dịch vụ (Tất cả)</h2>
                        {requests.length === 0 ? <p>Không có yêu cầu nào.</p> : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tiêu đề</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dịch vụ</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Người YC</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">NV Phụ trách</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {requests.map(req => (
                                        <tr key={req.id_yeu_cau}>
                                            <td className="px-4 py-2 text-sm">{req.id_yeu_cau}</td>
                                            <td className="px-4 py-2 text-sm">{req.hien_thi_cho_cu_dan ? 'Cư dân' : 'Nội bộ'}</td>
                                            <td className="px-4 py-2 text-sm font-medium">{req.tieu_de}</td>
                                            <td className="px-4 py-2 text-sm">{req.ten_dich_vu}</td>
                                            <td className="px-4 py-2 text-sm">{req.ten_cu_dan || '-'}</td>
                                            <td className="px-4 py-2 text-sm">{req.ten_nhan_vien || '-'}</td>
                                            <td className="px-4 py-2 text-sm">{formatDateTime(req.ngay_tao)}</td>
                                            <td className="px-4 py-2 text-sm">{formatRequestStatus(req.trang_thai)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                );
            case 'feedback':
                return (
                    <div className="overflow-x-auto">
                        <h2 className="text-lg font-semibold mb-3">Danh sách Phản hồi từ Cư dân</h2>
                         {feedback.length === 0 ? <p>Không có phản hồi nào.</p> : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cư dân</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tiêu đề</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nội dung</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ngày gửi</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {feedback.map(fb => (
                                        <tr key={fb.id_phan_hoi}>
                                            <td className="px-4 py-2 text-sm">{fb.id_phan_hoi}</td>
                                            <td className="px-4 py-2 text-sm">{fb.ten_cu_dan || `ID: ${fb.id_cu_dan}`}</td>
                                            <td className="px-4 py-2 text-sm font-medium">{fb.tieu_de}</td>
                                            <td className="px-4 py-2 text-sm">{fb.noi_dung}</td>
                                            <td className="px-4 py-2 text-sm">{formatDateTime(fb.ngay_gui)}</td>
                                            <td className="px-4 py-2 text-sm">{formatFeedbackStatus(fb.trang_thai)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         )}
                    </div>
                );
            case 'financial':
                return (
                    <div className="overflow-x-auto">
                        <h2 className="text-lg font-semibold mb-3">Danh sách Báo cáo Tài chính</h2>
                         {financialReports.length === 0 ? <p>Không có báo cáo tài chính nào.</p> : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tiêu đề</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Người lập</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ngày lập</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Tổng thu</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Tổng chi</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Chênh lệch</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {financialReports.map(report => (
                                        <tr key={report.id_bao_cao_thu_chi}>
                                            <td className="px-4 py-2 text-sm">{report.id_bao_cao_thu_chi}</td>
                                            <td className="px-4 py-2 text-sm font-medium">{report.tieu_de}</td>
                                            <td className="px-4 py-2 text-sm">{report.ten_nhan_vien_lap || `ID: ${report.id_nhan_vien_lap}`}</td>
                                            <td className="px-4 py-2 text-sm">{formatDateTime(report.ngay_lap)}</td>
                                            <td className="px-4 py-2 text-sm text-right text-green-600">{formatCurrency(report.tong_thu)}</td>
                                            <td className="px-4 py-2 text-sm text-right text-red-600">{formatCurrency(report.tong_chi)}</td>
                                            <td className={`px-4 py-2 text-sm text-right font-semibold ${report.tong_thu - report.tong_chi >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                                {formatCurrency(report.tong_thu - report.tong_chi)}
                                            </td>
                                            <td className="px-4 py-2 text-sm">{report.trang_thai}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-white p-6 rounded shadow-md">
            <h1 className="text-xl font-semibold mb-4">Xem Báo cáo</h1>

            {/* Tabs */}
            <div className="mb-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'requests'
                                ? 'border-purple-500 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Yêu cầu Dịch vụ
                    </button>
                    <button
                        onClick={() => setActiveTab('feedback')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'feedback'
                                ? 'border-purple-500 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Phản hồi Cư dân
                    </button>
                    <button
                        onClick={() => setActiveTab('financial')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'financial'
                                ? 'border-purple-500 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Tài chính
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div>
                {renderContent()}
            </div>
        </div>
    );
}

export default ViewReports;