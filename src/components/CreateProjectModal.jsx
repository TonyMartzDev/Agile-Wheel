import { useState } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Users,
  Calendar,
  Target,
  Sparkles,
  Mail,
  Plus,
  Trash2,
  Search,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import AgileWheelPreview from './AgileWheelPreview';

const CreateProjectModal = ({ onClose }) => {
  const { createProject } = useProjects();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Step 1: Identity
    name: '',
    projectKey: '',
    description: '',

    // Step 2: Team
    teamMembers: [],
    inviteEmails: [''],

    // Step 3: Rhythm
    sprintDuration: 2, // weeks
    estimationType: 'fibonacci',
    startDate: new Date().toISOString().split('T')[0],

    // Optional
    category: '',
    repositoryLink: '',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          setError('Project name is required');
          return false;
        }
        if (!formData.projectKey.trim()) {
          setError('Project key is required');
          return false;
        }
        if (formData.projectKey.length < 2 || formData.projectKey.length > 4) {
          setError('Project key must be 2-4 characters');
          return false;
        }
        if (!/^[A-Z]+$/.test(formData.projectKey)) {
          setError('Project key must be uppercase letters only');
          return false;
        }
        if (!formData.description.trim()) {
          setError('Project description is required');
          return false;
        }
        return true;
      case 2:
        // Team step is optional
        return true;
      case 3:
        if (!formData.startDate) {
          setError('Start date is required');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
      setError('');
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
    setError('');
  };

  const addEmailField = () => {
    handleChange('inviteEmails', [...formData.inviteEmails, '']);
  };

  const removeEmailField = (index) => {
    const updated = formData.inviteEmails.filter((_, i) => i !== index);
    handleChange('inviteEmails', updated);
  };

  const updateEmail = (index, value) => {
    const updated = [...formData.inviteEmails];
    updated[index] = value;
    handleChange('inviteEmails', updated);
  };

  const handleFinish = () => {
    if (!validateStep(3)) return;

    // Filter valid emails and create team
    const team = formData.inviteEmails
      .filter((email) => email.trim() && email.includes('@'))
      .map((email) => ({
        id: crypto.randomUUID(),
        email: email.trim(),
        name: email.split('@')[0],
        role: 'developer',
      }));

    // Create project with pre-sprint status
    const newProject = createProject({
      name: formData.name,
      projectKey: formData.projectKey,
      description: formData.description,
      team,
      sprintDuration: formData.sprintDuration,
      estimationType: formData.estimationType,
      startDate: formData.startDate,
      category: formData.category,
      repositoryLink: formData.repositoryLink,
      status: 'pre-sprint', // Project in setup phase
    });

    onClose();
    // Navigate to Inception Workspace (to be created)
    // For now, navigate to wheel
    navigate(`/wheel?project=${newProject.id}`);
  };

  const steps = [
    { number: 1, title: 'Identity', icon: Target },
    { number: 2, title: 'Team', icon: Users },
    { number: 3, title: 'Rhythm', icon: Calendar },
    { number: 4, title: 'Success', icon: Sparkles },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Create New Project</h2>
              <p className="text-purple-100 text-sm mt-1">
                Set up your Agile project in 4 simple steps
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mt-6">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        isActive
                          ? 'bg-white text-purple-600 scale-110'
                          : isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-purple-500/30 text-purple-200'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium ${isActive ? 'text-white' : 'text-purple-200'}`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 w-full mx-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-purple-500/30'}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Step 1: Identity */}
          {currentStep === 1 && (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">
                    Project Identity
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Give your project a unique identity that will be used throughout
                    the platform.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., E-Commerce Platform"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Project Key *
                  </label>
                  <input
                    type="text"
                    value={formData.projectKey}
                    onChange={(e) =>
                      handleChange('projectKey', e.target.value.toUpperCase())
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                    placeholder="e.g., NEX"
                    maxLength={4}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    2-4 uppercase letters. Used for story IDs (e.g., NEX-01, NEX-02)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="One-sentence summary of your project goal"
                  />
                </div>
              </div>

              {/* Live Wheel Preview */}
              <div className="flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-8">
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold text-slate-900">
                    {formData.name || 'Your Project'}
                  </h4>
                  <p className="text-sm text-slate-600 mt-1">
                    {formData.description || 'Project description will appear here'}
                  </p>
                </div>
                <div className="w-64 h-64">
                  <AgileWheelPreview />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Team */}
          {currentStep === 2 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  Build Your Team
                </h3>
                <p className="text-slate-600 text-sm">
                  Invite team members by email. You can also add members later from your
                  organization.
                </p>
              </div>

              <div className="space-y-3">
                {formData.inviteEmails.map((email, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-1 relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => updateEmail(index, e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="teammate@company.com"
                      />
                    </div>
                    {formData.inviteEmails.length > 1 && (
                      <button
                        onClick={() => removeEmailField(index)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={addEmailField}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold"
              >
                <Plus className="w-5 h-5" />
                Add Another Team Member
              </button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <div className="flex gap-3">
                  <Search className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 text-sm">
                      Organization Search (Coming Soon)
                    </h4>
                    <p className="text-blue-700 text-sm mt-1">
                      Soon you'll be able to search and add members from your
                      organization with live avatar selection.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Rhythm */}
          {currentStep === 3 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  Set Your Rhythm
                </h3>
                <p className="text-slate-600 text-sm">
                  Configure your sprint duration and estimation preferences.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Sprint Duration
                </label>
                <select
                  value={formData.sprintDuration}
                  onChange={(e) =>
                    handleChange('sprintDuration', parseInt(e.target.value))
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value={1}>1 Week</option>
                  <option value={2}>2 Weeks (Recommended)</option>
                  <option value={3}>3 Weeks</option>
                  <option value={4}>4 Weeks</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Estimation Type
                </label>
                <select
                  value={formData.estimationType}
                  onChange={(e) => handleChange('estimationType', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="fibonacci">Fibonacci Points (1, 2, 3, 5, 8, 13)</option>
                  <option value="tshirt">T-Shirt Sizes (XS, S, M, L, XL)</option>
                  <option value="hours">Hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">
                  When the Planning Phase is expected to begin
                </p>
              </div>

              {/* Optional Fields */}
              <div className="border-t border-slate-200 pt-6 mt-6">
                <h4 className="font-semibold text-slate-700 mb-4">
                  Optional Configuration
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Project Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select a category</option>
                      <option value="web">Web Application</option>
                      <option value="mobile">Mobile App</option>
                      <option value="api">API/Backend</option>
                      <option value="internal">Internal Tool</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Repository Link
                    </label>
                    <input
                      type="url"
                      value={formData.repositoryLink}
                      onChange={(e) =>
                        handleChange('repositoryLink', e.target.value)
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://github.com/yourorg/yourrepo"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {currentStep === 4 && (
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-10 h-10 text-white" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Ready to Launch!
                </h3>
                <p className="text-slate-600">
                  Your project is configured and ready to go. Click below to set your
                  vision and start planning.
                </p>
              </div>

              {/* Project Summary */}
              <div className="bg-slate-50 rounded-xl p-6 text-left space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Project Name</p>
                  <p className="font-semibold text-slate-900">{formData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Project Key</p>
                  <p className="font-mono font-semibold text-purple-600">
                    {formData.projectKey}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Description</p>
                  <p className="text-slate-700">{formData.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Sprint Duration</p>
                    <p className="font-semibold text-slate-900">
                      {formData.sprintDuration} Week{formData.sprintDuration > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Estimation</p>
                    <p className="font-semibold text-slate-900 capitalize">
                      {formData.estimationType}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Team Members</p>
                  <p className="font-semibold text-slate-900">
                    {formData.inviteEmails.filter((e) => e.trim()).length} invited
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-6">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-8 py-4 bg-slate-50 flex items-center justify-between">
          <button
            onClick={currentStep === 1 ? onClose : handleBack}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </button>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              <Check className="w-5 h-5" />
              Initialize Project & Set Vision
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
