const Sidebar = ({ onSelect, selected }) => {
    return (
      <ul>
        <li
          style={{ fontWeight: selected === "Hoá đơn hàng tháng" ? "bold" : "normal", cursor: "pointer" }}
          onClick={() => onSelect("Hoá đơn hàng tháng")}
        >
          Hoá đơn hàng tháng
        </li>
        <li
          style={{ fontWeight: selected === "Hoá đơn dịch vụ" ? "bold" : "normal", cursor: "pointer" }}
          onClick={() => onSelect("Hoá đơn dịch vụ")}
        >
          Hoá đơn dịch vụ
        </li>
      </ul>
    );
  };
  
  export default Sidebar;