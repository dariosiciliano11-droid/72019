import React from 'react';

export const Logo: React.FC<{ size?: number }> = ({ size = 40 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="rounded-lg overflow-hidden"
    >
      {/* Background Square (Dark Blue) */}
      <rect width="100" height="100" fill="#002B3D" />
      
      {/* Outer Yellow Circle */}
      <circle cx="50" cy="45" r="35" fill="#FFB800" />
      
      {/* Inner White Circle */}
      <circle cx="50" cy="45" r="18" fill="white" />
      
      {/* Text 72019 */}
      <text 
        x="50" 
        y="49" 
        textAnchor="middle" 
        fill="#002B3D" 
        style={{ fontSize: '14px', fontWeight: '900', fontFamily: 'sans-serif' }}
      >
        72019
      </text>
      
      {/* Bottom Text */}
      <text 
        x="50" 
        y="92" 
        textAnchor="middle" 
        fill="white" 
        style={{ fontSize: '5px', fontWeight: 'bold', fontFamily: 'sans-serif', letterSpacing: '0.5px' }}
      >
        SANVITO DEINORMANNI
      </text>
    </svg>
  );
};
