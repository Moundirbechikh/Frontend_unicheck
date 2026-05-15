import React from 'react';
import { Check, X, Clock, Shield, AlertCircle } from 'lucide-react';

const CalendarDay = ({ day, isSelected, isToday, status, onClick, isEmpty }) => {
  if (isEmpty) return <div className="w-full aspect-square" />;

  const getStatusIcon = () => {
    switch (status) {
      case 'present':
        return <Check size={10} strokeWidth={4} className="text-[#006c49]" />;
      case 'absent':
        return <X size={10} strokeWidth={4} className="text-red-500" />;
      case 'justif_attente':
        return <Clock size={10} strokeWidth={3} className="text-orange-500" />;
      case 'justif_accepte':
        return <Check size={10} strokeWidth={4} className="text-[#006c49]" />;
      case 'justif_refuse':
        return <X size={10} strokeWidth={4} className="text-red-500" />;
      case 'upcoming':
        return <Clock size={10} strokeWidth={3} className="text-blue-400" />;
      default:
        return null;
    }
  };

  // Couleur du badge icône selon statut
  const getBadgeBg = () => {
    switch (status) {
      case 'present':
      case 'justif_accepte':
        return 'bg-[#d1f4e0]';
      case 'absent':
      case 'justif_refuse':
        return 'bg-red-50';
      case 'justif_attente':
        return 'bg-orange-50';
      case 'upcoming':
        return 'bg-blue-50';
      default:
        return 'bg-white';
    }
  };

  return (
    <div className="relative p-0.5 sm:p-1 w-full">
      <button
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center w-full aspect-square
                    rounded-xl sm:rounded-2xl transition-all duration-300 active:scale-75 touch-manipulation
          ${isSelected
            ? 'bg-[#006c49] text-white shadow-lg shadow-[#006c49]/30 scale-105 z-20'
            : isToday
              ? 'bg-[#d1f4e0] text-[#006c49] font-black z-10'
              : 'bg-white text-[#1a1c1e] font-bold border border-gray-50'
          }`}
      >
        <span className={`text-[13px] sm:text-[15px] font-display tracking-tighter
                          ${isSelected ? 'font-black' : ''}`}>
          {day}
        </span>

        {status && (
          <div className={`absolute bottom-1 sm:bottom-1.5 flex items-center justify-center
                           rounded-full p-[1px] shadow-sm ${getBadgeBg()}`}>
            {getStatusIcon()}
          </div>
        )}
      </button>
    </div>
  );
};

export default CalendarDay;