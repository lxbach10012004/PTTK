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

function ManagerDashboard() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  // Lấy thông tin quản lý từ user trong context
  const managerInfo = user || { ho_ten: "Quản lý" };

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    {
      path: "/manager/create-request",
      label: "Tạo yêu cầu",
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
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      ),
    },
    {
      path: "/manager/view-reports",
      label: "Xem báo cáo",
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
      path: "/manager/manage-staff",
      label: "Quản lý nhân viên",
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      path: "/manager/manage-residents",
      label: "Quản lý cư dân",
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
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      path: "/manager/manage-contracts",
      label: "Quản lý hợp đồng",
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      path: "/manager/manage-apartments",
      label: "Quản lý căn hộ",
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
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
    {
      path: "/manager/manage-services",
      label: "Quản lý dịch vụ",
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
  ];

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <SidebarLayout
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <Link to="/manager" className="flex items-center px-3 py-3">
              <div className="text-lg font-bold text-rose-500 flex items-center">
                <img 
                  src="/src/assets/uet_logo.svg" 
                  alt="Quản Lý Chung Cư Logo" 
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
                            managerInfo.ho_ten
                              ? managerInfo.ho_ten.charAt(0)
                              : "M"
                          }
                          className="ring-2 ring-purple-500"
                        />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            {managerInfo.ho_ten}
                          </p>
                          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded-full">
                            Quản lý
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 text-left">
                          Ban quản trị tòa nhà
                        </p>
                      </div>
                    </div>
                  </DropdownButton>
                  <DropdownMenu
                    anchor="top start"
                    className="w-56 p-1 bg-white shadow-lg border border-gray-200 rounded-md"
                  >
                    <DropdownItem
                      href="/manager"
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
                      href="/manager/manage-staff"
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
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <DropdownLabel>Quản lý nhân viên</DropdownLabel>
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
      {location.pathname === "/manager" || location.pathname === "/manager/" ? (
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Chào mừng, {managerInfo.ho_ten}
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

export default ManagerDashboard;
