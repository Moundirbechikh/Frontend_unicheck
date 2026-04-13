import React from 'react';
import { Check, X, Minus } from 'lucide-react';

const CalendarDay = ({ day, isSelected, isToday, status, onClick, isEmpty }) => {
  if (isEmpty) return <div className="w-full aspect-square"></div>;

  const getStatusIcon = () => {
    if (isSelected) return null;
    switch (status) {
      case 'present': return <Check size={10} strokeWidth={4} className="text-[#006c49]" />;
      case 'absent': return <X size={10} strokeWidth={4} className="text-red-500" />;
      case 'upcoming': return <Minus size={10} strokeWidth={4} className="text-gray-300" />;
      default: return null;
    }
  };

  return (
    <div className="relative p-0.5 sm:p-1 w-full">
      <button
        onClick={onClick}
        // Suppression du hover classique qui pose problème sur mobile
        // Utilisation de z-20 quand sélectionné pour éviter que l'ombre ne bave sur les voisins
        className={`relative flex flex-col items-center justify-center w-full aspect-square rounded-xl sm:rounded-2xl transition-all duration-300 active:scale-75 touch-manipulation
          ${isSelected 
            ? 'bg-[#006c49] text-white shadow-lg shadow-[#006c49]/30 scale-105 z-20' 
            : isToday 
              ? 'bg-[#d1f4e0] text-[#006c49] font-black z-10' 
              : 'bg-white text-[#1a1c1e] font-bold border border-gray-50'
          }
        `}
      >
        <span className={`text-[13px] sm:text-[15px] font-display tracking-tighter ${isSelected ? 'font-black' : ''}`}>
          {day}
        </span>
        
        {!isSelected && status && (
          <div className="absolute bottom-1 sm:bottom-1.5 flex items-center justify-center">
            {getStatusIcon()}
          </div>
        )}

        {isSelected && (
          <div className="absolute bottom-1 sm:bottom-1.5 w-1 h-1 bg-white rounded-full"></div>
        )}
      </button>
    </div>
  );
};

export default CalendarDay;