// filepath: d:\course\PTTKHTTT\PTTK\fe\src\pages\resident\ResidentBills.jsx
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const API_URL = 'https://mmncb6j3-5000.asse.devtunnels.ms/api'; // Thay IP nếu cần

// Hàm định dạng trạng thái thanh toán
const formatPaymentStatus = (status) => {
  switch (status) {
    case "Chưa_thanh_toán":
      return (
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
          Chưa thanh toán
        </span>
      );
    case "Đã_thanh_toán":
      return (
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          Đã thanh toán
        </span>
      );
    case "Quá_hạn":
      return (
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Quá hạn
        </span>
      );
    default:
      return (
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
          {status}
        </span>
      );
  }
};

// Hàm định dạng tiền tệ
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "-";
  // API trả về Decimal dưới dạng string, cần chuyển thành number
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return "-";
  return numAmount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
};

// Hàm định dạng ngày
const formatDate = (dateString) => {
  if (!dateString) return "-";
  try {
    // API trả về YYYY-MM-DD
    const date = new Date(dateString + "T00:00:00"); // Thêm giờ để tránh lệch ngày do timezone
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (e) {
    return dateString;
  }
};

function ResidentBills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user && user.id_nguoi_dung) {
      setLoading(true);
      setError(null);
      fetch(`${API_URL}/hoa-don?id_cu_dan=${user.id_nguoi_dung}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Network response was not ok");
          }
          return res.json();
        })
        .then((data) => {
          setBills(data);
        })
        .catch((err) => {
          console.error("Lỗi fetch hóa đơn:", err);
          setError("Không thể tải danh sách hóa đơn.");
          setBills([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  // Lọc danh sách hóa đơn dựa trên các tiêu chí
  const filteredBills = bills.filter((bill) => {
    const statusMatch = filterStatus ? bill.trang_thai === filterStatus : true;
    const typeMatch = filterType ? bill.loai_hoa_don === filterType : true;
    const searchMatch =
      searchTerm.trim() === "" ||
      (bill.so_hoa_don &&
        bill.so_hoa_don.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bill.id_hoa_don && bill.id_hoa_don.toString().includes(searchTerm));

    return statusMatch && typeMatch && searchMatch;
  });

  // Tính tổng tiền của tất cả hóa đơn và hóa đơn chưa thanh toán
  const totalAmount = filteredBills.reduce((sum, bill) => {
    const amount =
      typeof bill.tong_tien === "string"
        ? parseFloat(bill.tong_tien)
        : bill.tong_tien || 0;
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const unpaidAmount = filteredBills
    .filter(
      (bill) =>
        bill.trang_thai === "Chưa_thanh_toán" || bill.trang_thai === "Quá_hạn"
    )
    .reduce((sum, bill) => {
      const amount =
        typeof bill.tong_tien === "string"
          ? parseFloat(bill.tong_tien)
          : bill.tong_tien || 0;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

  // Lấy danh sách các loại hóa đơn để hiển thị trong bộ lọc
  const billTypes = [...new Set(bills.map((bill) => bill.loai_hoa_don))].filter(
    Boolean
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">Đang tải danh sách hóa đơn...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

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
  //           <p className="text-sm text-yellow-700">Vui lòng đăng nhập để xem hóa đơn.</p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-800">
          Danh sách Hóa đơn
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Quản lý và theo dõi các hóa đơn của bạn
        </p>
      </div>

      {/* Thống kê nhanh */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Tổng số hóa đơn</div>
            <div className="text-2xl font-semibold text-blue-700">
              {filteredBills.length}
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Tổng tiền</div>
            <div className="text-2xl font-semibold text-green-700">
              {formatCurrency(totalAmount)}
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">
              Số tiền chưa thanh toán
            </div>
            <div className="text-2xl font-semibold text-red-700">
              {formatCurrency(unpaidAmount)}
            </div>
          </div>
        </div>
      </div>

      {/* Bộ lọc và tìm kiếm */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Tìm kiếm hóa đơn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Tất cả loại hóa đơn</option>
              {billTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Đã_thanh_toán">Đã thanh toán</option>
              <option value="Chưa_thanh_toán">Chưa thanh toán</option>
              <option value="Quá_hạn">Quá hạn</option>
            </select>
          </div>
        </div>
      </div>

      {/* Danh sách hóa đơn */}
      {filteredBills.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Không tìm thấy hóa đơn nào
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus || filterType
              ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
              : "Bạn chưa có hóa đơn nào."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Số HĐ
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Loại hóa đơn
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Ngày xuất
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Ngày hết hạn
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Tổng tiền
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Trạng thái
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Chi tiết
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBills.map((bill) => (
                <tr
                  key={`${bill.loai_hoa_don_goc}-${bill.id_hoa_don}`}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {bill.so_hoa_don || `HD-${bill.id_hoa_don}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {bill.loai_hoa_don}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(bill.ngay_xuat)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(bill.ngay_het_han)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                    {formatCurrency(bill.tong_tien)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {formatPaymentStatus(bill.trang_thai)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => {
                        /* Thêm xử lý xem chi tiết tại đây */
                      }}
                      className="text-blue-600 hover:text-blue-900 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                    >
                      <div className="inline-flex items-center">
                        <span>Xem</span>
                        <svg
                          className="ml-1 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Phân trang có thể được thêm vào đây nếu cần */}
    </div>
  );
}

export default ResidentBills;
