import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

export function Dropdown({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {React.Children.map(children, child => {
        if (child.type === DropdownButton) {
          return React.cloneElement(child, {
            onClick: () => setIsOpen(!isOpen),
            isOpen
          });
        }
        if (child.type === DropdownMenu) {
          return React.cloneElement(child, {
            isOpen
          });
        }
        return child;
      })}
    </div>
  );
}

export function DropdownButton({ children, onClick, isOpen, as: Component = 'button', className = '', ...props }) {
  return (
    <Component
      onClick={onClick}
      className={`inline-flex items-center ${className}`}
      aria-expanded={isOpen}
      {...props}
    >
      {children}
    </Component>
  );
}

export function DropdownMenu({ children, isOpen, anchor = 'bottom start', className = '' }) {
  if (!isOpen) return null;

  const anchorClasses = {
    'bottom start': 'top-full left-0',
    'bottom end': 'top-full right-0',
    'top start': 'bottom-full left-0',
    'top end': 'bottom-full right-0'
  };

  return (
    <div className={`absolute z-50 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 ${anchorClasses[anchor]} ${className}`}>
      {children}
    </div>
  );
}

export function DropdownItem({ children, href, onClick, className = '' }) {
  const baseClasses = "flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100";
  const classes = `${baseClasses} ${className}`;

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

export function DropdownLabel({ children, className = '' }) {
  return (
    <span className={`ml-3 ${className}`}>{children}</span>
  );
}

export function DropdownDivider({ className = '' }) {
  return (
    <div className={`my-1 h-px bg-gray-200 ${className}`} />
  );
}

export default Dropdown;