import React from 'react';
import { Link } from 'react-router-dom';

export function Sidebar({ children, className = '' }) {
  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {children}
    </div>
  );
}

export function SidebarHeader({ children, className = '' }) {
  return (
    <div className={`flex flex-col h-14 justify-center px-3 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

export function SidebarBody({ children, className = '' }) {
  return (
    <div className={`flex-1 overflow-y-auto py-4 ${className}`}>
      {children}
    </div>
  );
}

export function SidebarFooter({ children, className = '' }) {
  return (
    <div className={`border-t border-gray-200 p-3 ${className}`}>
      {children}
    </div>
  );
}

export function SidebarSection({ children, className = '' }) {
  return (
    <div className={`space-y-1 px-3 mb-5 ${className}`}>
      {children}
    </div>
  );
}

export function SidebarHeading({ children, className = '' }) {
  return (
    <h3 className={`text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-1.5 ${className}`}>
      {children}
    </h3>
  );
}

export function SidebarItem({ children, href, onClick, className = '', active = false }) {
  const baseClasses = "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors";
  const activeClasses = "bg-gray-100 text-gray-900";
  const inactiveClasses = "text-gray-700 hover:bg-gray-50 hover:text-gray-900";
  
  const classes = `${baseClasses} ${active ? activeClasses : inactiveClasses} ${className}`;
  
  if (href) {
    return (
      <Link to={href} className={classes}>
        {children}
      </Link>
    );
  }
  
  return (
    <button type="button" className={classes} onClick={onClick}>
      {children}
    </button>
  );
}

export function SidebarLabel({ children, className = '' }) {
  return (
    <span className={`ml-3 ${className}`}>{children}</span>
  );
}

export function SidebarSpacer() {
  return <div className="flex-1" />;
}

export default Sidebar;