import React, { useState, useEffect } from "react";

const API_URL = "http://172.21.92.186:5000/api";

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return "-";
  try {
    const date = new Date(dateTimeString);
    return date.toLocaleString("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch (e) {
    return dateTimeString;
  }
};

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "-";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

function ViewReports() {
  const [activeTab, setActiveTab] = useState("financial");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - i
  );

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError("");
      try {
        let endpoint = "";
        switch (activeTab) {
          case "financial":
            endpoint = "/bao-cao/thu-chi";
            break;
          case "service":
            endpoint = "/bao-cao/dich-vu";
            break;
          case "feedback":
            endpoint = "/bao-cao/phan-hoi";
            break;
          default:
            endpoint = "/bao-cao/thu-chi";
        }
        const response = await fetch(`${API_URL}${endpoint}`);
        if (!response.ok) {
          throw new Error(`Không thể tải báo cáo ${activeTab}`);
        }
        const data = await response.json();
        setReports(data);
      } catch (err) {
        setError(err.message || "Lỗi không xác định");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [activeTab]);

  const handleViewDetails = (report) => {
    setSelectedReport(report);
  };

  const handleDownload = (reportId) => {
    console.log(`Downloading report with ID: ${reportId}`);
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case "financial":
        return "Báo cáo tài chính";
      case "service":
        return "Báo cáo yêu cầu dịch vụ";
      case "feedback":
        return "Báo cáo phản hồi cư dân";
      default:
        return "Báo cáo";
    }
  };

  const [stats, setStats] = useState({
    financial: 0,
    service: 0,
    feedback: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [financialRes, serviceRes, feedbackRes] = await Promise.all([
          fetch(`${API_URL}/bao-cao/thu-chi/count`),
          fetch(`${API_URL}/bao-cao/dich-vu/count`),
          fetch(`${API_URL}/bao-cao/phan-hoi/count`),
        ]);

        const financial = await financialRes.json();
        const service = await serviceRes.json();
        const feedback = await feedbackRes.json();

        setStats({
          financial: financial.count || 0,
          service: service.count || 0,
          feedback: feedback.count || 0,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                {getTabTitle()}
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Xem và quản lý các báo cáo của chung cư
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">
                Báo cáo tài chính
              </div>
              <div className="text-2xl font-semibold text-blue-700">
                {stats.financial}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Yêu cầu dịch vụ</div>
              <div className="text-2xl font-semibold text-green-700">
                {stats.service}
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Phản hồi cư dân</div>
              <div className="text-2xl font-semibold text-red-700">
                {stats.feedback}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex px-6">
            <button
              onClick={() => setActiveTab("financial")}
              className={`py-3 px-4 text-sm font-medium border-b-2 ${
                activeTab === "financial"
                  ? "border-rose-500 text-rose-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Tài chính
            </button>
            <button
              onClick={() => setActiveTab("service")}
              className={`py-3 px-4 text-sm font-medium border-b-2 ${
                activeTab === "service"
                  ? "border-rose-500 text-rose-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Yêu cầu dịch vụ
            </button>
            <button
              onClick={() => setActiveTab("feedback")}
              className={`py-3 px-4 text-sm font-medium border-b-2 ${
                activeTab === "feedback"
                  ? "border-rose-500 text-rose-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Phản hồi cư dân
            </button>
          </nav>
        </div>

        {/* Filter Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label
                htmlFor="thang"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tháng
              </label>
              <select
                id="thang"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
              >
                <option value="">Tất cả</option>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label
                htmlFor="nam"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Năm
              </label>
              <select
                id="nam"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
              >
                <option value="">Tất cả</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            {activeTab === "financial" && (
              <div className="flex-1 min-w-[200px]">
                <label
                  htmlFor="loai"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Loại báo cáo
                </label>
                <select
                  id="loai"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
                >
                  <option value="">Tất cả</option>
                  <option value="Thu">Thu</option>
                  <option value="Chi">Chi</option>
                </select>
              </div>
            )}
            {activeTab === "service" && (
              <div className="flex-1 min-w-[200px]">
                <label
                  htmlFor="trang-thai"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Trạng thái
                </label>
                <select
                  id="trang-thai"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
                >
                  <option value="">Tất cả</option>
                  <option value="pending">Đang chờ</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Reports List */}
        <div className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Danh sách báo cáo
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-600"></div>
              <span className="ml-3 text-gray-600">Đang tải...</span>
            </div>
          ) : error ? (
            <div className="p-4 text-red-600 bg-red-50">
              <p>{error}</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Không có báo cáo nào.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Thời gian
                    </th>
                    {activeTab === "financial" && (
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Loại
                      </th>
                    )}
                    {activeTab === "service" && (
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Trạng thái
                      </th>
                    )}
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      {activeTab === "financial" ? "Tổng tiền" : "Số lượng"}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Nhân viên
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report.id_bao_cao} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">{report.id_bao_cao}</td>
                      <td className="px-4 py-2 text-sm">
                        {formatDateTime(report.thoi_gian)}
                      </td>
                      {activeTab === "financial" && (
                        <td className="px-4 py-2 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              report.loai === "Thu"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {report.loai}
                          </span>
                        </td>
                      )}
                      {activeTab === "service" && (
                        <td className="px-4 py-2 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              report.trang_thai === "completed"
                                ? "bg-green-100 text-green-800"
                                : report.trang_thai === "processing"
                                ? "bg-blue-100 text-blue-800"
                                : report.trang_thai === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {report.trang_thai === "completed"
                              ? "Hoàn thành"
                              : report.trang_thai === "processing"
                              ? "Đang xử lý"
                              : report.trang_thai === "pending"
                              ? "Đang chờ"
                              : "Đã hủy"}
                          </span>
                        </td>
                      )}
                      <td className="px-4 py-2 text-sm font-medium">
                        {activeTab === "financial"
                          ? formatCurrency(report.tong_tien)
                          : report.so_luong}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {report.ten_nhan_vien || "-"}
                      </td>
                      <td className="px-4 py-2 text-sm whitespace-nowrap">
                        <button
                          onClick={() => handleViewDetails(report)}
                          className="text-rose-600 hover:text-rose-800 focus:outline-none focus:underline mr-3"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => handleDownload(report.id_bao_cao)}
                          className="text-rose-600 hover:text-rose-800 focus:outline-none focus:underline"
                        >
                          Tải xuống
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Report Details Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Chi tiết báo cáo #{selectedReport.id_bao_cao}
                </h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Đóng</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="px-6 py-4">
                <dl className="grid grid-cols-1 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Thời gian
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDateTime(selectedReport.thoi_gian)}
                    </dd>
                  </div>
                  {activeTab === "financial" && (
                    <>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Loại báo cáo
                        </dt>
                        <dd className="mt-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              selectedReport.loai === "Thu"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {selectedReport.loai}
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Tổng tiền
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-gray-900">
                          {formatCurrency(selectedReport.tong_tien)}
                        </dd>
                      </div>
                    </>
                  )}
                  {activeTab === "service" && (
                    <>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Trạng thái
                        </dt>
                        <dd className="mt-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              selectedReport.trang_thai === "completed"
                                ? "bg-green-100 text-green-800"
                                : selectedReport.trang_thai === "processing"
                                ? "bg-blue-100 text-blue-800"
                                : selectedReport.trang_thai === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {selectedReport.trang_thai === "completed"
                              ? "Hoàn thành"
                              : selectedReport.trang_thai === "processing"
                              ? "Đang xử lý"
                              : selectedReport.trang_thai === "pending"
                              ? "Đang chờ"
                              : "Đã hủy"}
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Số lượng yêu cầu
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-gray-900">
                          {selectedReport.so_luong}
                        </dd>
                      </div>
                    </>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Nhân viên lập báo cáo
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {selectedReport.ten_nhan_vien || "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Ghi chú
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {selectedReport.ghi_chu || "-"}
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={() => handleDownload(selectedReport.id_bao_cao)}
                  className="w-full px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                >
                  Tải xuống báo cáo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewReports;
