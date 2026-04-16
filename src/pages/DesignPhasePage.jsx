import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Settings } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useProjects } from "../context/ProjectContext";
import DesignPhaseWorkspace from "../components/design/DesignPhaseWorkspace";
import { setPresence, clearPresence } from "../utils/presence";

const DesignPhasePage = () => {
  const { user } = useAuth();
  const { projects } = useProjects();
  const [searchParams] = useSearchParams();

  const projectId = searchParams.get("project");
  const currentProject = projectId
    ? projects.find((p) => p.id === projectId) || projects[0]
    : projects[0];

  useEffect(() => {
    if (user && currentProject) {
      setPresence(user, currentProject.id, "design");
      const interval = setInterval(
        () => setPresence(user, currentProject.id, "design"),
        20000,
      );
      return () => {
        clearInterval(interval);
        clearPresence(user.id);
      };
    }
  }, [user, currentProject?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            No Project Found
          </h2>
          <p className="text-slate-600 mb-4">
            Please select a project to access the Design Phase
          </p>
          <Link
            to="/dashboard"
            className="text-purple-600 hover:text-purple-700 font-semibold"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Top Navigation */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to={`/wheel?project=${currentProject.id}`}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {currentProject.name} - Design Phase
            </h1>
            <p className="text-sm text-slate-500">
              Create wireframes, mockups, and UML diagrams
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-500 capitalize">
              {user?.role?.replace("_", " ")}
            </p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <Link
            to="/settings"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Design Workspace */}
      <div className="flex-1 overflow-hidden">
        <DesignPhaseWorkspace />
      </div>
    </div>
  );
};

export default DesignPhasePage;
