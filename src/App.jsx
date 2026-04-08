import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProjectProvider } from "./context/ProjectContext";
import { ChatProvider } from "./context/ChatContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import WheelPage from "./pages/WheelPage";
import PlanningPhasePage from "./pages/PlanningPhasePage";
import DesignPhasePage from "./pages/DesignPhasePage";
import SettingsPage from "./pages/SettingsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatWindow from "./components/ChatWindow";

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <ChatProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wheel"
                element={
                  <ProtectedRoute>
                    <WheelPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/planning"
                element={
                  <ProtectedRoute>
                    <PlanningPhasePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/design"
                element={
                  <ProtectedRoute>
                    <DesignPhasePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <ChatWindow />
          </Router>
        </ChatProvider>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;
