import { Link } from "react-router-dom";
import {
  Target,
  LogOut,
  Settings,
  Bell,
  Crown,
  Users,
  Code,
  Bug,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ProductOwnerDashboard from "../components/dashboards/ProductOwnerDashboard";
import ScrumMasterDashboard from "../components/dashboards/ScrumMasterDashboard";
import DeveloperDashboard from "../components/dashboards/DeveloperDashboard";
import QADashboard from "../components/dashboards/QADashboard";

const roleLabels = {
  product_owner: {
    label: "Product Owner",
    icon: Crown,
    color: "text-purple-600",
  },
  scrum_master: { label: "Scrum Master", icon: Users, color: "text-blue-600" },
  developer: { label: "Developer", icon: Code, color: "text-green-600" },
  qa_engineer: { label: "QA Engineer", icon: Bug, color: "text-orange-600" },
};

const Dashboard = () => {
  const { user, logout } = useAuth();

  const getRoleDashboard = () => {
    switch (user?.role) {
      case "product_owner":
        return <ProductOwnerDashboard />;
      case "scrum_master":
        return <ScrumMasterDashboard />;
      case "qa_engineer":
        return <QADashboard />;
      case "developer":
      default:
        return <DeveloperDashboard />;
    }
  };

  const roleInfo = roleLabels[user?.role] || roleLabels.developer;
  const RoleIcon = roleInfo.icon;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">
                AgileWheel
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <div className="h-8 w-px bg-slate-200" />
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {user?.role || "Developer"}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome back, {user?.name?.split(" ")[0] || "there"}! 👋
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <RoleIcon className={`w-5 h-5 ${roleInfo.color}`} />
            <p className="text-slate-600">{roleInfo.label} Dashboard</p>
          </div>
        </div>

        {/* Role-specific Dashboard Content */}
        {getRoleDashboard()}
      </div>
    </div>
  );
};

export default Dashboard;
