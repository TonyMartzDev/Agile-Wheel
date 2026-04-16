import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProjects } from "../context/ProjectContext";
import { ArrowLeft, Settings } from "lucide-react";

// Import role-specific workspaces
import POPlanningWorkspace from "../components/planning/POPlanningWorkspace";
import SMPlanningWorkspace from "../components/planning/SMPlanningWorkspace";
import DeveloperPlanningWorkspace from "../components/planning/DeveloperPlanningWorkspace";
import QAPlanningWorkspace from "../components/planning/QAPlanningWorkspace";
import PRDContextBanner from "../components/inception/PRDContextBanner";
import CreateStoryModal from "../components/planning/CreateStoryModal";
import { setPresence, clearPresence } from "../utils/presence";

const PlanningPhasePage = () => {
  const { user } = useAuth();
  const { projects, addTask, moveTaskToSprint } = useProjects();

  const currentProject = projects[0];

  useEffect(() => {
    if (user && currentProject) {
      setPresence(user, currentProject.id, "plan");
      const interval = setInterval(
        () => setPresence(user, currentProject.id, "plan"),
        20000,
      );
      return () => {
        clearInterval(interval);
        clearPresence(user.id);
      };
    }
  }, [user, currentProject?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeSprint = currentProject?.sprints?.find(
    (s) => s.status === "active",
  );

  const sprintBacklog =
    currentProject?.tasks?.filter(
      (t) => t.sprint === activeSprint?.id && t.status === "todo",
    ) || [];

  const productBacklog =
    currentProject?.tasks?.filter(
      (t) => !t.sprint && (t.status === "todo" || t.status === "draft"),
    ) || [];

  const teamSize = currentProject?.team?.length || 0;
  const totalStories = sprintBacklog.length;
  const estimatedStories = sprintBacklog.filter((s) => s.storyPoints).length;

  const gatekeeperMet =
    teamSize >= 1 && totalStories >= 2 && estimatedStories >= 2;

  const [readyVotes, setReadyVotes] = useState([]);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const developerCount =
    currentProject?.team?.filter((m) => m.role === "developer").length || 0;
  const readyPercentage =
    developerCount > 0 ? (readyVotes.length / developerCount) * 100 : 0;

  // Gatekeeper status for SM workspace
  const gatekeeperStatus = {
    met: gatekeeperMet,
    progress: Math.round(
      (teamSize >= 1 ? 33 : 0) +
        (totalStories >= 2 ? 33 : 0) +
        (estimatedStories >= 2 ? 34 : 0),
    ),
    requirements: [
      {
        label: "Team Size ≥ 1",
        status: `${teamSize} members`,
        met: teamSize >= 1,
      },
      {
        label: "Sprint Backlog ≥ 2 stories",
        status: `${totalStories} stories`,
        met: totalStories >= 2,
      },
      {
        label: "Estimated Stories ≥ 2",
        status: `${estimatedStories} estimated`,
        met: estimatedStories >= 2,
      },
    ],
  };

  const handleCreateStory = () => {
    setShowCreateStory(true);
  };

  const handleSaveStory = (storyData) => {
    if (currentProject) {
      addTask(currentProject.id, storyData);
    }
    setShowCreateStory(false);
  };

  const handleMoveToSprint = (taskId) => {
    if (currentProject && activeSprint) {
      moveTaskToSprint(currentProject.id, taskId, activeSprint.id);
    }
  };

  const handleApproveStory = (storyId) => {
    console.log("Approve story:", storyId);
  };

  const handleRejectStory = (storyId) => {
    console.log("Reject story:", storyId);
  };

  const handleReorderStories = (fromIndex, toIndex) => {
    console.log("Reorder stories:", fromIndex, toIndex);
  };

  const handleUpdateStoryValue = (storyId, value) => {
    console.log("Update story value:", storyId, value);
  };

  const handleLinkEpic = (storyId, epic) => {
    console.log("Link epic:", storyId, epic);
  };

  const handleSetCapacity = (capacity) => {
    console.log("Set capacity:", capacity);
  };

  const handleOverridePhase = () => {
    console.log("Override phase advancement");
  };

  const handleEstimateStory = (storyId, points) => {
    console.log("Estimate story:", storyId, points);
  };

  const handleAddTechnicalNotes = (storyId, notes) => {
    console.log("Add technical notes:", storyId, notes);
  };

  const handleAddComment = (storyId, comment) => {
    console.log("Add comment:", storyId, comment);
  };

  const handleMarkReady = () => {
    if (readyVotes.includes(user?.id)) {
      setReadyVotes(readyVotes.filter((id) => id !== user?.id));
    } else {
      setReadyVotes([...readyVotes, user?.id]);
    }
  };

  const handleFlagStory = (storyId, flag) => {
    console.log("Flag story:", storyId, flag);
  };

  const handleCreateTestChecklist = (storyId, checklist) => {
    console.log("Create test checklist:", storyId, checklist);
  };

  const handleAddTestingEffort = (storyId, effort) => {
    console.log("Add testing effort:", storyId, effort);
  };

  // Render role-specific workspace
  const renderWorkspace = () => {
    switch (user?.role) {
      case "product_owner":
        return (
          <POPlanningWorkspace
            sprintBacklog={sprintBacklog}
            productBacklog={productBacklog}
            onCreateStory={handleCreateStory}
            onApproveStory={handleApproveStory}
            onRejectStory={handleRejectStory}
            onReorderStories={handleReorderStories}
            onUpdateStoryValue={handleUpdateStoryValue}
            onLinkEpic={handleLinkEpic}
            onMoveToSprint={handleMoveToSprint}
            hasActiveSprint={!!activeSprint}
          />
        );

      case "scrum_master":
        return (
          <SMPlanningWorkspace
            sprintBacklog={sprintBacklog}
            teamMembers={currentProject?.team || []}
            teamVelocity={35}
            sprintCapacity={40}
            onSetCapacity={handleSetCapacity}
            onOverridePhase={handleOverridePhase}
            gatekeeperStatus={gatekeeperStatus}
          />
        );

      case "developer":
        return (
          <DeveloperPlanningWorkspace
            sprintBacklog={sprintBacklog}
            productBacklog={productBacklog}
            onCreateStory={handleCreateStory}
            onEstimateStory={handleEstimateStory}
            onAddTechnicalNotes={handleAddTechnicalNotes}
            onAddComment={handleAddComment}
            onMarkReady={handleMarkReady}
            isReady={readyVotes.includes(user?.id)}
            readyPercentage={readyPercentage}
            onMoveToSprint={handleMoveToSprint}
            hasActiveSprint={!!activeSprint}
          />
        );

      case "qa_engineer":
        return (
          <QAPlanningWorkspace
            sprintBacklog={sprintBacklog}
            productBacklog={productBacklog}
            onFlagStory={handleFlagStory}
            onCreateTestChecklist={handleCreateTestChecklist}
            onAddTestingEffort={handleAddTestingEffort}
            onCreateStory={handleCreateStory}
          />
        );

      default:
        return (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <p className="text-slate-500">
              Please select a role to view the planning workspace
            </p>
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
                <h1 className="text-lg font-bold text-slate-900">
                  Planning Phase
                </h1>
                <p className="text-xs text-slate-500">{currentProject?.name}</p>
              </div>
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
                <p className="text-sm font-medium text-slate-900">
                  {user?.name}
                </p>
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
        <PRDContextBanner project={currentProject} />
        {renderWorkspace()}
      </div>

      {showCreateStory && (
        <CreateStoryModal
          onClose={() => setShowCreateStory(false)}
          onSave={handleSaveStory}
          epics={currentProject?.prd?.epics || []}
        />
      )}
    </div>
  );
};

export default PlanningPhasePage;
