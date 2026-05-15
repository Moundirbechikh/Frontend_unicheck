import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Connexion from './components/Connexion';
import StudentLayout from './Pages/StudentLayout';
import ProfLayout from './Pages/ProfLayout'; // Nouveau Layout
import HistoryPage from './components/HistoryPage';
import LandingPage from './Pages/Landingpage';
import Dashboard from './components/Dashboard'; 
import Justificatif from './components/Justificatif';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';
// Importations Professeur
import ProfDashboard from './components/ProfDashboard';
import ProfStudentsList from './components/ProfStudentsList'; // À créer (Placeholder ou composant)
import ProfJustificatifs from './components/ProfJustificatifs'; // À créer (Placeholder ou composant)
import ProfAgenda from './components/ProfAgenda';
import AdminLayout from './Pages/AdminLayout';
import AdminDashboard from './components/AdminDashboard';
import AdminSchedulePlanner from './components/AdminSchedulePlanner';
import AdminStudentManager from './components/AdminStudentManager';
import AdminProfManager from './components/AdminProfManager';
import Auth from './components/Auth';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/connexion" element={<Auth />} />

        {/* ESPACE ÉTUDIANT SÉCURISÉ */}
        <Route element={<ProtectedRoute allowedRoles={['etudiant']} />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="tableau" element={<Dashboard />} />
            <Route path="cours" element={<HistoryPage />} />
            <Route path="justificatifs" element={<Justificatif/>} />
            <Route path="profil" element={<Profile/>} />
          </Route>
        </Route>

        {/* ESPACE PROFESSEUR SÉCURISÉ */}
        <Route element={<ProtectedRoute allowedRoles={['prof']} />}>
          <Route path="/prof" element={<ProfLayout />}>
            <Route index element={<ProfDashboard />} />
            <Route path="tableau" element={<ProfDashboard />} />
            <Route path="etudiants" element={<ProfStudentsList />} />
            <Route path="cours" element={<ProfAgenda />} />
            <Route path="justificatifs" element={<ProfJustificatifs />} />
            <Route path="profil" element={<Profile />} />
          </Route>
        </Route>

        {/* ESPACE ADMIN SÉCURISÉ */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="tableau" element={<AdminDashboard />} />
            <Route path="etudiants" element={<AdminStudentManager />} />
            <Route path="professeurs" element={<AdminProfManager />} />
            <Route path="planning" element={<AdminSchedulePlanner />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;