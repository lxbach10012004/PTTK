import React from 'react';

function SidebarLayout({ navbar, sidebar, children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200">
          {sidebar}
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navbar */}
        <div className="relative z-10 flex-shrink-0 flex h-14 bg-white border-b border-gray-200">
          {navbar}
        </div>
        
        {/* Content area */}
        <main className="flex-1 overflow-auto focus:outline-none">
          <div className="p-4 sm:p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default SidebarLayout;