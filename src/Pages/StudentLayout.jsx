import { Outlet } from 'react-router-dom';
import StudentBottomNav from '../components/StudentBottomNav';

const StudentLayout = () => {
  return (
    <div className="min-h-screen bg-[#f8faf9] pb-24 font-['Inter']">
            <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@700;800;900&family=Inter:wght@300;400;600&family=Noto+Sans+Arabic:wght@400;700&display=swap');
          .font-display { font-family: 'Manrope', sans-serif; }
          .font-body { font-family: 'Inter', 'Noto Sans Arabic', sans-serif; }
          .arabic-font { font-family: 'Noto Sans Arabic', sans-serif; }
          .glass-effect { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.3); }
        `}
      </style>
      {/* Contenu dynamique (HistoryPage ou autre page selon l'URL) */}
      <main className="animate-in fade-in duration-500">
        <Outlet /> 
      </main>
      
      {/* Ta barre de navigation reste fixe en bas */}
      <StudentBottomNav />
    </div>
  );
};

export default StudentLayout;