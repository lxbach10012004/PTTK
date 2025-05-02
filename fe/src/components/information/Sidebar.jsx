const Sidebar = ({ onSelect, selected }) => {
  return (
    <>
      <div className="w-1/3">
        <ul>
          <li
            style={{
              fontWeight: selected === "Thông tin hợp đồng" ? "bold" : "normal",
              cursor: "pointer",
            }}
            onClick={() => onSelect("Thông tin hợp đồng")}
          >
            Thông tin hợp đồng
          </li>
          <li
            style={{
              fontWeight: selected === "Thông tin căn hộ" ? "bold" : "normal",
              cursor: "pointer",
            }}
            onClick={() => onSelect("Thông tin căn hộ")}
          >
            Thông tin căn hộ
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
