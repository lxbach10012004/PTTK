// filepath: d:\course\PTTKHTTT\PTTK\fe\src\pages\resident\ResidentDashboard.jsx
import React, { useContext } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

import SidebarLayout from '../../components/SidebarLayout';
import { Sidebar, SidebarHeader, SidebarBody, SidebarFooter, SidebarSection, SidebarItem, SidebarLabel } from '../../components/Sidebar';
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '../../components/Navbar';
import { Dropdown, DropdownButton, DropdownItem, DropdownLabel, DropdownMenu, DropdownDivider } from '../../components/Dropdown';
import { Avatar } from '../../components/Avatar';

function ResidentDashboard() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  // Lấy thông tin cư dân từ user trong context
  const residentInfo = user || { ho_ten: "Cư dân" };

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { path: '/resident/services', label: 'Yêu cầu dịch vụ', icon: '🛎️' },
    { path: '/resident/requests', label: 'Xem yêu cầu', icon: '📋' },
    { path: '/resident/bills', label: 'Xem hóa đơn', icon: '💰' },
    { path: '/resident/information', label: 'Thông tin cá nhân', icon: '👤' },
    { path: '/resident/notifications', label: 'Xem thông báo', icon: '🔔' },
    { path: '/resident/feedback', label: 'Gửi phản hồi', icon: '📝' },
  ];

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          {/* Mobile menu button - Visible on small screens */}
          <NavbarSection className="lg:hidden">
            <NavbarItem aria-label="Menu">☰</NavbarItem>
          </NavbarSection>
          
          <NavbarSpacer />
          
          {/* Right section with controls - Always visible */}
          <NavbarSection>
            <NavbarItem aria-label="Thông báo">
              🔔
            </NavbarItem>
            <Dropdown>
              <DropdownButton as={NavbarItem}>
                <Avatar initials={residentInfo.ho_ten ? residentInfo.ho_ten.charAt(0) : "C"} />
              </DropdownButton>
              <DropdownMenu anchor="bottom end">
                <DropdownItem href="/resident/information">
                  👤
                  <DropdownLabel>Thông tin cá nhân</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem onClick={handleLogout}>
                  🚪
                  <DropdownLabel>Đăng xuất</DropdownLabel>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <Link to="/resident" className="flex items-center px-3 py-2">
              <div className="text-xl font-bold text-blue-600">🏢 Chung Cư</div>
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
            <div className="px-3 py-2">
              <div className="flex items-center space-x-3">
                <Avatar initials={residentInfo.ho_ten ? residentInfo.ho_ten.charAt(0) : "C"} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{residentInfo.ho_ten}</p>
                  <p className="text-xs text-gray-500">Cư dân</p>
                </div>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
      }
    >
      {/* Main Content */}
      {location.pathname === '/resident' || location.pathname === '/resident/' ? (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-8 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">Chào mừng, {residentInfo.ho_ten}</h1>
              <p className="mt-2 text-gray-600">Chào mừng bạn đến với Hệ thống Quản lý Chung cư. Vui lòng chọn một chức năng từ thanh điều hướng.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="p-4 rounded-md border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center mb-2">
                    <span className="text-lg mr-2">{item.icon}</span>
                    <h3 className="font-medium text-blue-600">{item.label}</h3>
                  </div>
                  <p className="text-sm text-gray-500">Truy cập nhanh vào {item.label.toLowerCase()}</p>
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