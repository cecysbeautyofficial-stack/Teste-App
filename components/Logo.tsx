
import React from 'react';
import { useAppContext } from '../contexts/AppContext';

const Logo: React.FC<{ className?: string }> = ({ className }) => {
  const { theme } = useAppContext();
  
  const lightLogo = "https://lh3.googleusercontent.com/d/1sOwYdoOunLfOpdoa0ycGyc2L-tDD15Qn";
  const darkLogo = "https://lh3.googleusercontent.com/d/1yITvJMG3aRnR9BnRQTSzHyNNx36yhyXz";

  return (
    <div className={`flex items-center justify-center select-none ${className || ''}`}>
      <img 
        src={theme === 'dark' ? darkLogo : lightLogo} 
        alt="Logo" 
        className="h-8 md:h-10 object-contain" 
      />
    </div>
  );
};

export default Logo;
