import { useState } from "react";
import Sidebar from "../components/bill/Sidebar";
import Info from "../components/bill/Info";
import Navbar from "../components/Navbar";

const Bill = () => {
  const [selectedTab, setSelectedTab] = useState("Hoá đơn hàng tháng");
  return (
    <>
      <div>
        <Navbar />
        <Sidebar onSelect={setSelectedTab} selected={selectedTab} />
        <Info selected={selectedTab} />
      </div>
    </>
  );
};

export default Bill;
