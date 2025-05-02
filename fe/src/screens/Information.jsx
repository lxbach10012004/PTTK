import { useState } from "react";
import Sidebar from "../components/information/Sidebar";
import Info from "../components/information/Info";
import Navbar from "../components/Navbar";

const Information = () => {
  const [selectedTab, setSelectedTab] = useState("Thông tin hợp đồng");

  return (
    <>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar onSelect={setSelectedTab} selected={selectedTab} />
        <Info selected={selectedTab} />
      </div>
    </>
  );
};

export default Information;
