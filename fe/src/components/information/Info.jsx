const Info = ({ selected }) => {
  return (
    <div className="w-2/3">
      {selected === "Thông tin hợp đồng" && (<div>
        <table>
            <thead>
                <tr>
                    <th>Ngày bắt đầu</th>
                    <th>Ngày kết thúc</th>
                    <th>Tiền đặt cọc</th>
                    <th>Trạng thái</th>
                    <th>Ghi chú</th>
                </tr>
            </thead>
        </table>
      </div>)}
      {selected === "Thông tin căn hộ" && (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>Mã căn</th>
                        <th>Toà nhà</th>
                        <th>Tầng</th>
                        <th>Diện tích</th>
                        <th>Số phòng ngủ</th>
                        <th>Số phòng tắm</th>
                        <th>Trạng thái</th>
                    </tr>
                </thead>
            </table>
        </div>
      )}
    </div>
  );
};

export default Info;
