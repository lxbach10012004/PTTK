import React from 'react';
import { Link } from 'react-router-dom';

export function Navbar({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-between h-14 px-4 ${className}`}>
      {children}
    </div>
  );
}

export function NavbarSection({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-between space-x-4 ${className}`}>
      {children}
    </div>
  );
}

export function NavbarItem({ children, href, onClick, className = '', as: Component = 'button', ...props }) {
  const baseClasses = "flex items-center justify-center w-8 h-8 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500";
  const classes = `${baseClasses} ${className}`;

  if (href) {
    return (
      <Link to={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  if (Component !== 'button') {
    return (
      <Component className={classes} {...props}>
        {children}
      </Component>
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick} {...props}>
      {children}
    </button>
  );
}

export function NavbarSpacer() {
  return <div className="flex-grow" />;
}

export default Navbar;