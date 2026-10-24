import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProjects } from "../context/ProjectContext";
import { ArrowLeft, Settings } from "lucide-react";
import { setPresence, clearPresence } from "../utils/presence";

import DeveloperDevWorkspace from "../components/development/DeveloperDevWorkspace";
import QADevWorkspace from "../components/development/QADevWorkspace";
import SMDevWorkspace from "../components/development/SMDevWorkspace";
import PODevWorkspace from "../components/development/PODevWorkspace";

const DevelopmentPhasePage = () => {
  const { user } = useAuth();
  const {
    projects,
    updateTaskDevFields,
    addSnippet,
    addSnippetComment,
    updateSnippetStatus,
  } = useProjects();

  const currentProject = projects[0];

  useEffect(() => {
    if (user && currentProject) {
      setPresence(user, currentProject.id, "develop");
      const interval = setInterval(
        () => setPresence(user, currentProject.id, "develop"),
        20000,
      );
      return () => {
        clearInterval(interval);
        clearPresence(user.id);
      };
    }
  }, [user, currentProject?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdateTask = (taskId, fields) => {
    if (currentProject) updateTaskDevFields(currentProject.id, taskId, fields);
  };

  const handleAddSnippet = (taskId, snippet) => {
    if (currentProject) addSnippet(currentProject.id, taskId, snippet);
  };

  const handleAddSnippetComment = (taskId, snippetId, comment) => {
    if (currentProject) addSnippetComment(currentProject.id, taskId, snippetId, comment);
  };

  const handleUpdateSnippetStatus = (taskId, snippetId, status) => {
    if (currentProject) updateSnippetStatus(currentProject.id, taskId, snippetId, status);
  };

  const handleFlagTask = (taskId, flag) => {
    if (currentProject) updateTaskDevFields(currentProject.id, taskId, { qaFlag: flag });
  };

  const handleFlagBlocked = (taskId) => {
    console.log("Task flagged as blocked:", taskId);
  };

  const handleOverridePhase = () => {
    console.log("SM override: advance to Testing phase");
  };

  const renderWorkspace = () => {
    switch (user?.role) {
      case "developer":
        return (
          <DeveloperDevWorkspace
            project={currentProject}
            currentUser={user}
            onUpdateTask={handleUpdateTask}
            onAddSnippet={handleAddSnippet}
            onAddSnippetComment={handleAddSnippetComment}
            onFlagBlocked={handleFlagBlocked}
          />
        );
      case "qa_engineer":
        return (
          <QADevWorkspace
            project={currentProject}
            currentUser={user}
            onFlagTask={handleFlagTask}
            onAddSnippetComment={handleAddSnippetComment}
            onUpdateSnippetStatus={handleUpdateSnippetStatus}
          />
        );
      case "scrum_master":
        return (
          <SMDevWorkspace
            project={currentProject}
            onOverridePhase={handleOverridePhase}
          />
        );
      case "product_owner":
        return (
          <PODevWorkspace project={currentProject} />
        );
      default:
        return (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <p className="text-slate-500">Please select a role to view the development workspace.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link
                to="/wheel"
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back to Wheel</span>
              </Link>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-base">⚒️</span> Development Phase
                </h1>
                <p className="text-xs text-slate-500">{currentProject?.name}</p>
              </div>
            </div>

            {/* CI badge in nav */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-green-700">Build: Passing</span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/settings"
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </Link>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500 capitalize">
                  {user?.role?.replace("_", " ")}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderWorkspace()}
      </div>
    </div>
  );
};

export default DevelopmentPhasePage;
