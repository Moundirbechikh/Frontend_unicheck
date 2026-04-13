import React from 'react';
import { Outlet } from 'react-router-dom';
import ProfNav from '../components/ProfNav'; // Assure-toi que le chemin est correct

const ProfLayout = () => {
  return (
    <div className="min-h-screen bg-[#f1f4f2]">
              <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@700;800;900&family=Inter:wght@300;400;600&family=Noto+Sans+Arabic:wght@400;700&display=swap');
          .font-display { font-family: 'Manrope', sans-serif; }
          .font-body { font-family: 'Inter', 'Noto Sans Arabic', sans-serif; }
          .arabic-font { font-family: 'Noto Sans Arabic', sans-serif; }
          .glass-effect { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.3); }
        `}
      </style>
      {/* Barre de navigation unique (Top + Bottom Mobile) */}
      <ProfNav />

      {/* Zone de contenu dynamique */}
      <main className="max-w-7xl mx-auto">
        {/* On ne met pas de padding-top ici car il est déjà géré 
            dans les composants pages (comme ProfDashboard) 
            pour un contrôle plus précis du design.
        */}
        <Outlet />
      </main>

      {/* Note : Le ProfNav contient déjà le menu mobile fixe en bas, 
          donc pas besoin de l'ajouter ici. 
      */}
    </div>
  );
};

export default ProfLayout;