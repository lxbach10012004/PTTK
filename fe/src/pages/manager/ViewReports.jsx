import React, { useState, useEffect } from "react";

const API_URL = "https://mmncb6j3-5000.asse.devtunnels.ms/api"; // Thay IP nếu cần

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
  const [financialReports, setFinancialReports] = useState([]);
  const [serviceReports, setServiceReports] = useState([]);
  const [feedbackReports, setFeedbackReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedServiceType, setSelectedServiceType] = useState(""); // Cư dân/Nội bộ
  const [selectedFeedbackStatus, setSelectedFeedbackStatus] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - i
  );

  useEffect(() => {
    const fetchAllReports = async () => {
      setLoading(true);
      setError("");
      try {
        const [financialRes, serviceRes, feedbackRes] = await Promise.all([
          fetch(`${API_URL}/bao-cao/thu-chi`),
          fetch(`${API_URL}/yeu-cau-dich-vu`),
          fetch(`${API_URL}/phan-hoi-cu-dan`),
        ]);
        if (!financialRes.ok)
          throw new Error("Không thể tải báo cáo tài chính");
        if (!serviceRes.ok) throw new Error("Không thể tải báo cáo dịch vụ");
        if (!feedbackRes.ok) throw new Error("Không thể tải báo cáo phản hồi");
        const [financial, service, feedback] = await Promise.all([
          financialRes.json(),
          serviceRes.json(),
          feedbackRes.json(),
        ]);
        setFinancialReports(financial);
        setServiceReports(service);
        setFeedbackReports(feedback);
      } catch (err) {
        setError(err.message || "Lỗi không xác định");
      } finally {
        setLoading(false);
      }
    };
    fetchAllReports();
  }, []);

  const matchMonthYear = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const monthOk =
      !selectedMonth || d.getMonth() + 1 === Number(selectedMonth);
    const yearOk = !selectedYear || d.getFullYear() === Number(selectedYear);
    return monthOk && yearOk;
  };

  const filteredFinancial = financialReports.filter((rp) => {
    const dateOk = matchMonthYear(rp.ngay_lap);
    const statusOk = !selectedType || rp.trang_thai === selectedType;
    return dateOk && statusOk;
  });
  const filteredService = serviceReports.filter((req) => {
    const dateOk = matchMonthYear(req.ngay_tao);
    const typeOk = !selectedType || req.trang_thai === selectedType;
    const serviceTypeOk =
      !selectedServiceType ||
      (selectedServiceType === "Cư dân"
        ? req.hien_thi_cho_cu_dan
        : !req.hien_thi_cho_cu_dan);
    return dateOk && typeOk && serviceTypeOk;
  });
  const filteredFeedback = feedbackReports.filter((fb) => {
    const dateOk = matchMonthYear(fb.ngay_gui);
    const statusOk =
      !selectedFeedbackStatus || fb.trang_thai === selectedFeedbackStatus;
    return dateOk && statusOk;
  });

  let reports = [];
  if (activeTab === "financial") reports = filteredFinancial;
  else if (activeTab === "service") reports = filteredService;
  else if (activeTab === "feedback") reports = filteredFeedback;

  const stats = {
    financial: filteredFinancial.length,
    service: filteredService.length,
    feedback: filteredFeedback.length,
  };

  const statusBadge = (status) => {
    if (!status) return null;
    const map = {
      Mới: { text: "Mới", color: "bg-blue-100 text-blue-800" },
      Đang_xử_lý: {
        text: "Đang xử lý",
        color: "bg-yellow-100 text-yellow-800",
      },
      Đã_gửi: { text: "Đã gửi", color: "bg-green-100 text-green-800" },
      Hoàn_thành: { text: "Hoàn thành", color: "bg-green-100 text-green-800" },
      Đã_xem: { text: "Đã xem", color: "bg-yellow-100 text-yellow-800" },
      Đã_phản_hồi: {
        text: "Đã phản hồi",
        color: "bg-green-100 text-green-800",
      },
      Từ_chối: { text: "Từ chối", color: "bg-red-100 text-red-800" },
    };
    const m = map[status] || {
      text: status.replace(/_/g, " "),
      color: "bg-gray-100 text-gray-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${m.color}`}>
        {m.text}
      </span>
    );
  };
  const renderReportTable = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-600"></div>
          <span className="ml-3 text-gray-600">Đang tải...</span>
        </div>
      );
    }
    if (error) {
      return (
        <div className="p-4 text-red-600 bg-red-50">
          <p>{error}</p>
        </div>
      );
    }
    if (activeTab === "service") {
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Loại
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Tiêu đề
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Dịch vụ
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Người yêu cầu
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  NV phụ trách
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Ngày tạo
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredService.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    Không có yêu cầu nào.
                  </td>
                </tr>
              ) : (
                filteredService.map((req) => (
                  <tr key={req.id_yeu_cau} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">{req.id_yeu_cau}</td>
                    <td className="px-4 py-2 text-sm">
                      {req.hien_thi_cho_cu_dan ? "Cư dân" : "Nội bộ"}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium">
                      {req.tieu_de}
                    </td>
                    <td className="px-4 py-2 text-sm">{req.ten_dich_vu}</td>
                    <td className="px-4 py-2 text-sm">
                      {req.ten_cu_dan || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {req.ten_nhan_vien || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {formatDateTime(req.ngay_tao)}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {statusBadge(req.trang_thai)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      );
    }
    if (activeTab === "feedback") {
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Cư dân
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Tiêu đề
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Nội dung
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Ngày gửi
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFeedback.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    Không có phản hồi nào.
                  </td>
                </tr>
              ) : (
                filteredFeedback.map((fb) => (
                  <tr key={fb.id_phan_hoi} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">{fb.id_phan_hoi}</td>
                    <td className="px-4 py-2 text-sm">
                      {fb.ten_cu_dan || `ID: ${fb.id_cu_dan}`}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium">
                      {fb.tieu_de}
                    </td>
                    <td className="px-4 py-2 text-sm">{fb.noi_dung}</td>
                    <td className="px-4 py-2 text-sm">
                      {formatDateTime(fb.ngay_gui)}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {statusBadge(fb.trang_thai)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      );
    }
    if (activeTab === "financial") {
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Tiêu đề
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Người lập
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Ngày lập
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  Tổng thu
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  Tổng chi
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  Chênh lệch
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFinancial.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    Không có báo cáo tài chính nào.
                  </td>
                </tr>
              ) : (
                filteredFinancial.map((report) => (
                  <tr
                    key={report.id_bao_cao_thu_chi}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-2 text-sm">
                      {report.id_bao_cao_thu_chi}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium">
                      {report.tieu_de}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {report.ten_nhan_vien_lap ||
                        `ID: ${report.id_nhan_vien_lap}`}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {formatDateTime(report.ngay_lap)}
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-green-600">
                      {formatCurrency(report.tong_thu)}
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-red-600">
                      {formatCurrency(report.tong_chi)}
                    </td>
                    <td
                      className={`px-4 py-2 text-sm text-right font-semibold ${
                        report.tong_thu - report.tong_chi >= 0
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {formatCurrency(report.tong_thu - report.tong_chi)}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {statusBadge(report.trang_thai)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      );
    }
    return null;
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
  };

  const handleDownload = (reportId) => {
    console.log(`Downloading report with ID: ${reportId}`);
  };

  // const getTabTitle = () => {
  //   switch (activeTab) {
  //     case "financial":
  //       return "Báo cáo tài chính";
  //     case "service":
  //       return "Báo cáo yêu cầu dịch vụ";
  //     case "feedback":
  //       return "Báo cáo phản hồi cư dân";
  //     default:
  //       return "Báo cáo";
  //   }
  // };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                Xem báo cáo
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

            {activeTab === "service" && (
              <>
                <div className="flex-1 min-w-[200px]">
                  <label
                    htmlFor="loai-dv"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Loại yêu cầu
                  </label>
                  <select
                    id="loai-dv"
                    value={selectedServiceType}
                    onChange={(e) => setSelectedServiceType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
                  >
                    <option value="">Tất cả</option>
                    <option value="Cư dân">Cư dân</option>
                    <option value="Nội bộ">Nội bộ</option>
                  </select>
                </div>
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
                    <option value="Mới">Mới</option>
                    <option value="Đang_xử_lý">Đang xử lý</option>
                    <option value="Hoàn_thành">Hoàn thành</option>
                    <option value="Từ_chối">Từ chối</option>
                  </select>
                </div>
              </>
            )}
            {activeTab === "feedback" && (
              <div className="flex-1 min-w-[200px]">
                <label
                  htmlFor="trang-thai-fb"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Trạng thái
                </label>
                <select
                  id="trang-thai-fb"
                  value={selectedFeedbackStatus}
                  onChange={(e) => setSelectedFeedbackStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
                >
                  <option value="">Tất cả</option>
                  <option value="Mới">Mới</option>
                  <option value="Đã_xem">Đã xem</option>
                  <option value="Đã_trả_lời">Đã trả lời</option>
                </select>
              </div>
            )}
            {activeTab === "financial" && (
              <div className="flex-1 min-w-[200px]">
                <label
                  htmlFor="trang-thai-tc"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Trạng thái
                </label>
                <select
                  id="trang-thai-tc"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
                >
                  <option value="">Tất cả</option>
                  <option value="Mới">Mới</option>
                  <option value="Đã_xem">Đã xem</option>
                  <option value="Đã_hủy">Đã gửi</option>
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Danh sách báo cáo
            </h2>
          </div>
          {renderReportTable()}
        </div>

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
