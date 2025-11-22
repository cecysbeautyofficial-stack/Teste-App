
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex items-center justify-center select-none ${className || ''}`}>
      <img 
        src="https://lh3.googleusercontent.com/d/1sOwYdoOunLfOpdoa0ycGyc2L-tDD15Qn" 
        alt="Logo" 
        className="h-8 md:h-10 object-contain" 
      />
    </div>
  );
};

export default Logo;
