// filepath: d:\course\PTTKHTTT\PTTK\fe\src\pages\staff\StaffDashboard.jsx
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

function StaffDashboard() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  // Lấy thông tin nhân viên từ user trong context
  const staffInfo = user || { ho_ten: "Nhân viên" };

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    {
      path: "/staff/handle-requests",
      label: "Xử lý yêu cầu",
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
      path: "/staff/create-service-bill",
      label: "Tạo hóa đơn dịch vụ",
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
      path: "/staff/create-maintenance-bill",
      label: "Tạo hóa đơn bảo trì",
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
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      path: "/staff/create-financial-report",
      label: "Báo cáo tài chính",
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
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      path: "/staff/send-notification",
      label: "Gửi thông báo",
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
      path: "/staff/view-feedback",
      label: "Xem phản hồi",
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
            <Link to="/staff" className="flex items-center px-3 py-3">
              <div className="text-lg font-bold text-rose-600 flex items-center">
                <img
                  src="/src/assets/uet_logo.svg"
                  alt="Nhân Viên Chung Cư Logo"
                  className="h-8 w-8 mr-2"
                />
                <span>Quản lý Chung Cư</span>
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
                            staffInfo.ho_ten ? staffInfo.ho_ten.charAt(0) : "S"
                          }
                          className="ring-2 ring-rose-500"
                        />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            {staffInfo.ho_ten}
                          </p>
                          <span className="bg-rose-100 text-rose-800 text-xs font-medium px-2 py-0.5 rounded-full">
                            Nhân viên
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 text-left">
                          Nhân viên phụ trách
                        </p>
                      </div>
                    </div>
                  </DropdownButton>
                  <DropdownMenu
                    anchor="top start"
                    className="w-56 p-1 bg-white shadow-lg border border-gray-200 rounded-md"
                  >
                    <DropdownItem
                      href="/staff"
                      className="flex items-center p-2 hover:bg-rose-50 rounded-md"
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
                      href="/staff/send-notification"
                      className="flex items-center p-2 hover:bg-rose-50 rounded-md"
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
                      <DropdownLabel>Gửi thông báo</DropdownLabel>
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
      {location.pathname === "/staff" || location.pathname === "/staff/" ? (
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Chào mừng, {staffInfo.ho_ten}
            </h1>
            <p className="mt-2 text-gray-600">
              Chào mừng bạn đến với hệ thống Quản lý Chung cư. Vui lòng chọn một
              chức năng để tiếp tục.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-6">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex flex-col h-full p-4 rounded-lg border border-gray-100 shadow-sm hover:border-rose-300 hover:bg-rose-50 hover:shadow-md transition-all"
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-rose-100 p-2 rounded-lg mr-3">
                      <span className="text-rose-600">{item.icon}</span>
                    </div>
                    <h3 className="font-medium text-lg text-rose-500">
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

export default StaffDashboard;
