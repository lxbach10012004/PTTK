import Navbar from "../Navbar";

const Info = ({ selected }) => {
  return (
    <>
      <div>
        {selected === "Hoá đơn hàng tháng" && (
          <div>
            <table>
              <thead>
                <tr className=" flex gap-2">
                  <th>Số hoá đơn</th>
                  <th>Ngày xuất</th>
                  <th>Tổng tiền</th>
                  <th>Thuế Vat</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {selected === "Hoá đơn dịch vụ" && (
          <div>
            <table>
              <thead>
                <tr className=" flex gap-2">
                  <th>Số hoá đơn</th>
                  <th>Ngày xuất</th>
                  <th>Tổng tiền</th>
                  <th>Thuế Vat</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default Info;
