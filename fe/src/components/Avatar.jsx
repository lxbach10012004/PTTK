import React from 'react';

export function Avatar({ src, alt = '', initials, className = '', square = false }) {
  const baseClasses = "flex items-center justify-center overflow-hidden bg-gray-100 text-gray-500";
  const sizeClasses = "h-8 w-8";
  const shapeClasses = square ? "rounded-md" : "rounded-full";
  
  const combinedClasses = `${baseClasses} ${sizeClasses} ${shapeClasses} ${className}`;
  
  if (src) {
    return (
      <div className={combinedClasses}>
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      </div>
    );
  }
  
  if (initials) {
    return (
      <div className={combinedClasses}>
        <span className="text-sm font-medium">{initials}</span>
      </div>
    );
  }
  
  return (
    <div className={combinedClasses}>
      <span className="text-lg">👤</span>
    </div>
  );
}

export default Avatar;