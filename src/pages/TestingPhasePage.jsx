import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProjects } from "../context/ProjectContext";
import { ArrowLeft, Settings } from "lucide-react";
import { setPresence, clearPresence } from "../utils/presence";

import DeveloperTestWorkspace from "../components/testing/DeveloperTestWorkspace";
import QATestWorkspace from "../components/testing/QATestWorkspace";
import SMPOTestWorkspace from "../components/testing/SMPOTestWorkspace";

const TestingPhasePage = () => {
  const { user } = useAuth();
  const {
    projects,
    addTestRun,
    promoteFailedTestToBug,
    updateTaskTestFields,
    deferBugToNextSprint,
    signOffQAVisual,
    addQAChallenge,
  } = useProjects();

  const currentProject = projects[0];

  useEffect(() => {
    if (user && currentProject) {
      setPresence(user, currentProject.id, "test");
      const interval = setInterval(
        () => setPresence(user, currentProject.id, "test"),
        20000,
      );
      return () => {
        clearInterval(interval);
        clearPresence(user.id);
      };
    }
  }, [user, currentProject?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddTestRun = (taskId, run) => {
    if (currentProject) addTestRun(currentProject.id, taskId, run);
  };

  const handlePromoteBug = (taskId, bugData) => {
    if (currentProject) promoteFailedTestToBug(currentProject.id, taskId, bugData);
  };

  const handleUpdateTask = (taskId, fields) => {
    if (currentProject) updateTaskTestFields(currentProject.id, taskId, fields);
  };

  const handleDefer = (taskId, note, poSignOff) => {
    if (currentProject) deferBugToNextSprint(currentProject.id, taskId, note, poSignOff);
  };

  const handleVisualApprove = (taskId, qaUser) => {
    if (currentProject) signOffQAVisual(currentProject.id, taskId, qaUser);
  };

  const handleSendChallenge = (taskId, challenge) => {
    if (currentProject) addQAChallenge(currentProject.id, taskId, challenge);
  };

  const handleOverridePhase = () => {
    console.log("SM override: advance to Review phase");
  };

  // Count open critical bugs for nav badge
  const criticalBugs = (currentProject?.tasks || []).filter(
    t => t.type === "bug" && t.priority === "critical" && t.status !== "done"
  ).length;

  const renderWorkspace = () => {
    switch (user?.role) {
      case "developer":
        return (
          <DeveloperTestWorkspace
            project={currentProject}
            currentUser={user}
            onAddTestRun={handleAddTestRun}
            onPromoteBug={handlePromoteBug}
            onUpdateTask={handleUpdateTask}
          />
        );
      case "qa_engineer":
        return (
          <QATestWorkspace
            project={currentProject}
            currentUser={user}
            onSendChallenge={handleSendChallenge}
            onPromoteBug={handlePromoteBug}
            onVisualApprove={handleVisualApprove}
            onDefer={handleDefer}
            onUpdateTask={handleUpdateTask}
          />
        );
      case "scrum_master":
      case "product_owner":
        return (
          <SMPOTestWorkspace
            project={currentProject}
            currentUser={user}
            onOverridePhase={handleOverridePhase}
          />
        );
      default:
        return (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <p className="text-slate-500">Please select a role to view the testing workspace.</p>
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
                  <span className="text-base">🧪</span> Testing Phase
                </h1>
                <p className="text-xs text-slate-500">{currentProject?.name}</p>
              </div>
            </div>

            {/* Quality badges in nav */}
            <div className="hidden sm:flex items-center gap-2">
              {criticalBugs > 0 ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-semibold text-red-700">{criticalBugs} Critical Bug{criticalBugs > 1 ? "s" : ""}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-700">No Critical Bugs</span>
                </div>
              )}
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

export default TestingPhasePage;
