// filepath: d:\course\PTTKHTTT\PTTK\fe\src\pages\resident\ResidentDashboard.jsx
import React, { useContext } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

import SidebarLayout from "../../components/SidebarLayout";
import {
  Sidebar,
  SidebarHeader,
  SidebarBody,
  SidebarFooter,
  SidebarSection,
  SidebarItem,
  SidebarLabel,
} from "../../components/Sidebar";
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
  DropdownDivider,
} from "../../components/Dropdown";
import { Avatar } from "../../components/Avatar";

function ResidentDashboard() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  // Lấy thông tin cư dân từ user trong context
  const residentInfo = user || { ho_ten: "Cư dân" };

  // Hàm tách tên khỏi vai trò trong ngoặc đơn
  const extractName = (fullString) => {
    if (!fullString) return "Cư dân"; // Trả về "Cư dân" nếu không có tên
    // Tách tên khỏi phần trong ngoặc đơn (nếu có)
    return fullString.split(" (")[0];
  };


  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    {
      path: "/resident/services",
      label: "Yêu cầu dịch vụ",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      path: "/resident/requests",
      label: "Xem yêu cầu",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
    },
    {
      path: "/resident/bills",
      label: "Xem hóa đơn",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      path: "/resident/information",
      label: "Thông tin cá nhân",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      path: "/resident/notifications",
      label: "Xem thông báo",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
    },
    {
      path: "/resident/feedback",
      label: "Gửi phản hồi",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          />
        </svg>
      ),
    },
  ];

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <SidebarLayout
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <Link to="/resident" className="flex items-center px-3 py-3">
              <div className="text-lg font-bold text-blue-600 flex items-center">
                <img
                  src="/src/assets/uet_logo.svg"
                  alt="Chung Cư Logo"
                  className="h-8 w-8 mr-2"
                />
                <span>Chung Cư</span>
              </div>
            </Link>
          </SidebarHeader>

          <SidebarBody>
            <SidebarSection>
              {menuItems.map((item) => (
                <SidebarItem
                  key={item.path}
                  href={item.path}
                  active={isActive(item.path)}
                >
                  <span className="text-lg">{item.icon}</span>
                  <SidebarLabel>{item.label}</SidebarLabel>
                </SidebarItem>
              ))}
            </SidebarSection>
          </SidebarBody>

          <SidebarFooter>
            <div className="px-3 py-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <Dropdown>
                  <DropdownButton>
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar
                          initials={
                            residentInfo.ho_ten
                              ? residentInfo.ho_ten.charAt(0)
                              : "C"
                          }
                          className="ring-2 ring-blue-500"
                        />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {extractName(residentInfo.ho_ten)}
                        </p>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full w-fit">
                          Cư dân
                        </span>
                      </div>
                    </div>
                  </DropdownButton>
                  <DropdownMenu
                    anchor="top start"
                    className="w-56 p-1 bg-white shadow-lg border border-gray-200 rounded-md"
                  >
                    <DropdownItem
                      href="/resident/information"
                      className="flex items-center p-2 hover:bg-blue-50 rounded-md"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <DropdownLabel>Thông tin cá nhân</DropdownLabel>
                    </DropdownItem>
                    <DropdownItem
                      href="/resident/notifications"
                      className="flex items-center p-2 hover:bg-blue-50 rounded-md"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                      <DropdownLabel>Thông báo</DropdownLabel>
                    </DropdownItem>
                    <DropdownDivider className="my-1 border-gray-200" />
                    <DropdownItem
                      onClick={handleLogout}
                      className="flex items-center p-2 hover:bg-red-50 rounded-md"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <DropdownLabel>Đăng xuất</DropdownLabel>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
      }
    >
      {/* Main Content */}
      {location.pathname === "/resident" ||
      location.pathname === "/resident/" ? (
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Chào mừng, {extractName(residentInfo.ho_ten)}
            </h1>
            <p className="mt-2 text-gray-600">
              Chào mừng bạn đến với hệ thống quản lý Chung cư. Vui lòng chọn một
              chức năng để tiếp tục.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-6">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex flex-col h-full p-4 rounded-lg border border-gray-100 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:shadow-md transition-all"
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <span className="text-blue-600">{item.icon}</span>
                    </div>
                    <h3 className="font-medium text-lg text-blue-600">
                      {item.label}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-auto">
                    Truy cập nhanh vào {item.label.toLowerCase()}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <Outlet />
      )}
    </SidebarLayout>
  );
}

export default ResidentDashboard;
