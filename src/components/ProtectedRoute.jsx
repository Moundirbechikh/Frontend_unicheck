// src/components/ProtectedRoute.js
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  // 1. Si pas de token, on dégage vers la page de connexion
  if (!token) {
    return <Navigate to="/connexion" replace />;
  }

  // 2. Si un rôle spécifique est requis et que l'utilisateur ne l'a pas
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // On le redirige vers sa page d'accueil par défaut selon son vrai rôle
    if (userRole === 'etudiant') return <Navigate to="/student/tableau" replace />;
    if (userRole === 'prof') return <Navigate to="/prof/tableau" replace />;
    if (userRole === 'admin') return <Navigate to="/admin/tableau" replace />;
    
    // Sécurité de secours
    return <Navigate to="/connexion" replace />;
  }

  // 3. Tout est bon, on affiche la page demandée (le Layout)
  return <Outlet />;
};

export default ProtectedRoute;