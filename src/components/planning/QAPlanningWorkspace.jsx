import { useState } from "react";
import {
  Bug,
  Plus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ListChecks,
  FileWarning,
  Target,
  Clock,
} from "lucide-react";

const QAPlanningWorkspace = ({
  sprintBacklog,
  productBacklog,
  onFlagStory,
  onCreateTestChecklist,
  onAddTestingEffort,
  onCreateStory,
}) => {
  const [selectedBacklog, setSelectedBacklog] = useState("sprint");
  const [selectedStory, setSelectedStory] = useState(null);
  const [newChecklistItem, setNewChecklistItem] = useState("");

  // Analyze stories for testability
  const insufficientACStories = [...sprintBacklog, ...productBacklog].filter(
    (s) => !s.acceptanceCriteria || s.acceptanceCriteria.length < 2,
  );

  const handleGenerateChecklist = () => {
    if (selectedStory && selectedStory.acceptanceCriteria) {
      const checklist = selectedStory.acceptanceCriteria.map((ac, index) => ({
        id: `test-${index}`,
        criterion: ac.text,
        testCase: `Verify that ${ac.text.toLowerCase()}`,
        status: "pending",
      }));
      onCreateTestChecklist(selectedStory.id, checklist);
    }
  };

  const handleAddChecklistItem = () => {
    if (selectedStory && newChecklistItem.trim()) {
      onCreateTestChecklist(selectedStory.id, [
        {
          id: `test-${Date.now()}`,
          criterion: "Custom",
          testCase: newChecklistItem,
          status: "pending",
        },
      ]);
      setNewChecklistItem("");
    }
  };

  const testingEffortLevels = [
    {
      id: "small",
      label: "Small",
      color: "bg-green-100 text-green-700 border-green-300",
      hours: "1-2h",
    },
    {
      id: "medium",
      label: "Medium",
      color: "bg-yellow-100 text-yellow-700 border-yellow-300",
      hours: "3-5h",
    },
    {
      id: "large",
      label: "Large",
      color: "bg-orange-100 text-orange-700 border-orange-300",
      hours: "6-8h",
    },
    {
      id: "xlarge",
      label: "X-Large",
      color: "bg-red-100 text-red-700 border-red-300",
      hours: "8+h",
    },
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left Column - Story List with Testability Flags */}
      <div className="lg:col-span-2 space-y-6">
        {/* Testability Warnings */}
        {insufficientACStories.length > 0 && (
          <div className="bg-red-50 rounded-xl shadow-sm border-2 border-red-300">
            <div className="border-b border-red-200 p-4">
              <div className="flex items-center gap-2">
                <FileWarning className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  Not Testable ({insufficientACStories.length})
                </h2>
              </div>
              <p className="text-sm text-red-700 mt-1">
                These stories lack sufficient acceptance criteria for proper
                testing
              </p>
            </div>
            <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto">
              {insufficientACStories.map((story) => (
                <div
                  key={story.id}
                  className="bg-white rounded-lg p-3 border-2 border-red-300"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 text-sm">
                        {story.title}
                      </h3>
                      <p className="text-xs text-red-600 mt-1">
                        {!story.acceptanceCriteria ||
                        story.acceptanceCriteria.length === 0
                          ? "No acceptance criteria defined"
                          : `Only ${story.acceptanceCriteria.length} criterion - needs at least 2`}
                      </p>
                    </div>
                    <button
                      onClick={() => onFlagStory(story.id, "insufficient_ac")}
                      className="px-2 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 transition-colors"
                    >
                      Flag
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Story List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Bug className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    QA Workspace
                  </h2>
                  <p className="text-xs text-slate-500">
                    Review testability and create test plans
                  </p>
                </div>
              </div>
              <button
                onClick={onCreateStory}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                New Story
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setSelectedBacklog("sprint")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  selectedBacklog === "sprint"
                    ? "bg-orange-100 text-orange-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Sprint Backlog ({sprintBacklog.length})
              </button>
              <button
                onClick={() => setSelectedBacklog("product")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  selectedBacklog === "product"
                    ? "bg-orange-100 text-orange-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Product Backlog ({productBacklog.length})
              </button>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {(selectedBacklog === "sprint"
                ? sprintBacklog
                : productBacklog
              ).map((story) => {
                const isTestable =
                  story.acceptanceCriteria &&
                  story.acceptanceCriteria.length >= 2;
                const hasTestPlan =
                  story.testChecklist && story.testChecklist.length > 0;

                return (
                  <div
                    key={story.id}
                    onClick={() => setSelectedStory(story)}
                    className={`bg-white rounded-lg p-4 border-2 transition-all cursor-pointer hover:shadow-md ${
                      selectedStory?.id === story.id
                        ? "border-orange-500 shadow-md"
                        : isTestable
                          ? "border-slate-200"
                          : "border-red-300 bg-red-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">
                            {story.title}
                          </h3>
                          {!isTestable && (
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {story.description}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            story.priority === "high"
                              ? "bg-red-100 text-red-700"
                              : story.priority === "medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {story.priority}
                        </span>
                        {story.storyPoints && (
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                            {story.storyPoints} pts
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      {isTestable ? (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
                          <CheckCircle2 className="w-3 h-3 inline mr-1" />
                          Testable
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700 border border-red-300">
                          <XCircle className="w-3 h-3 inline mr-1" />
                          Not Testable
                        </span>
                      )}
                      {hasTestPlan && (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-300">
                          <ListChecks className="w-3 h-3 inline mr-1" />
                          {story.testChecklist.length} Tests
                        </span>
                      )}
                      {story.testingEffort && (
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold border ${
                            testingEffortLevels.find(
                              (e) => e.id === story.testingEffort,
                            )?.color
                          }`}
                        >
                          <Clock className="w-3 h-3 inline mr-1" />
                          {
                            testingEffortLevels.find(
                              (e) => e.id === story.testingEffort,
                            )?.label
                          }
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - AC Builder & Test Checklist */}
      <div className="space-y-6">
        {selectedStory ? (
          <>
            {/* Story Details */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="border-b border-slate-200 p-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Story Details
                </h2>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {selectedStory.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {selectedStory.description}
                  </p>
                </div>

                {/* Acceptance Criteria Review */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Acceptance Criteria (
                    {selectedStory.acceptanceCriteria?.length || 0})
                  </label>
                  {selectedStory.acceptanceCriteria &&
                  selectedStory.acceptanceCriteria.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedStory.acceptanceCriteria.map((criteria) => (
                        <li
                          key={criteria.id}
                          className="flex items-start gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded"
                        >
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{criteria.text}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                      <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                      <p className="text-sm text-red-700 font-semibold">
                        No acceptance criteria
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        Cannot create test plan
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Test Checklist Generator */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="border-b border-slate-200 p-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-orange-600" />
                  Test Checklist
                </h2>
              </div>
              <div className="p-4 space-y-3">
                {selectedStory.acceptanceCriteria &&
                  selectedStory.acceptanceCriteria.length > 0 && (
                    <button
                      onClick={handleGenerateChecklist}
                      className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                    >
                      Generate Test Cases from AC
                    </button>
                  )}

                {selectedStory.testChecklist &&
                  selectedStory.testChecklist.length > 0 && (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {selectedStory.testChecklist.map((test, index) => (
                        <div
                          key={test.id}
                          className="bg-blue-50 rounded-lg p-3 border border-blue-200"
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-semibold text-blue-700 mt-1">
                              #{index + 1}
                            </span>
                            <div className="flex-1">
                              <p className="text-xs text-slate-600 mb-1">
                                From: {test.criterion}
                              </p>
                              <p className="text-sm text-slate-900 font-medium">
                                {test.testCase}
                              </p>
                            </div>
                            <CheckCircle2
                              className={`w-4 h-4 ${
                                test.status === "passed"
                                  ? "text-green-600"
                                  : "text-slate-300"
                              }`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                <div className="border-t border-slate-200 pt-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Add Custom Test Case
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleAddChecklistItem()
                      }
                      placeholder="e.g., Verify error handling for invalid input"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                    <button
                      onClick={handleAddChecklistItem}
                      disabled={!newChecklistItem.trim()}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Testing Effort Estimation */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="border-b border-slate-200 p-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Testing Effort
                </h2>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {testingEffortLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() =>
                        onAddTestingEffort(selectedStory.id, level.id)
                      }
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedStory.testingEffort === level.id
                          ? level.color + " shadow-sm"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <p className="font-semibold text-sm">{level.label}</p>
                      <p className="text-xs text-slate-600">{level.hours}</p>
                    </button>
                  ))}
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-800">
                    <strong>Note:</strong> A "small" dev task may require
                    "large" testing effort for edge cases and automation.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 p-8 text-center">
            <Bug className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              Select a story to review testability and create test plans
            </p>
          </div>
        )}

        {/* Sprint Testing Summary */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200 p-4">
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-600" />
            Sprint Testing Summary
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Total Stories:</span>
              <span className="font-semibold text-slate-900">
                {sprintBacklog.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Testable:</span>
              <span className="font-semibold text-green-700">
                {
                  sprintBacklog.filter(
                    (s) =>
                      s.acceptanceCriteria && s.acceptanceCriteria.length >= 2,
                  ).length
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Not Testable:</span>
              <span className="font-semibold text-red-700">
                {
                  sprintBacklog.filter(
                    (s) =>
                      !s.acceptanceCriteria || s.acceptanceCriteria.length < 2,
                  ).length
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Test Plans Created:</span>
              <span className="font-semibold text-blue-700">
                {
                  sprintBacklog.filter(
                    (s) => s.testChecklist && s.testChecklist.length > 0,
                  ).length
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QAPlanningWorkspace;
