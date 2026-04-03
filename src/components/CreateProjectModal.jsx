import { useState } from 'react';
import { X, Plus, Mail, Trash2 } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';

const CreateProjectModal = ({ onClose }) => {
  const { createProject } = useProjects();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [teamEmails, setTeamEmails] = useState(['']);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    // Filter out empty emails and create team members
    const team = teamEmails
      .filter(email => email.trim())
      .map(email => ({
        email: email.trim(),
        name: email.split('@')[0],
        role: 'Developer',
        status: 'invited',
      }));

    createProject({
      ...formData,
      team,
    });

    onClose();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addEmailField = () => {
    setTeamEmails([...teamEmails, '']);
  };

  const removeEmailField = (index) => {
    setTeamEmails(teamEmails.filter((_, i) => i !== index));
  };

  const updateEmail = (index, value) => {
    const updated = [...teamEmails];
    updated[index] = value;
    setTeamEmails(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Create New Project</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Project Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-primary-600 focus:outline-none transition-colors"
              placeholder="e.g., E-Commerce Platform"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-primary-600 focus:outline-none transition-colors resize-none"
              placeholder="Brief description of your project..."
            />
          </div>

          {/* Team Invites */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Invite Team Members
            </label>
            <p className="text-sm text-slate-500 mb-3">
              Add email addresses of team members you'd like to invite
            </p>
            
            <div className="space-y-3">
              {teamEmails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => updateEmail(index, e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:border-primary-600 focus:outline-none transition-colors"
                      placeholder="teammate@example.com"
                    />
                  </div>
                  {teamEmails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmailField(index)}
                      className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addEmailField}
              className="mt-3 flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-semibold"
            >
              <Plus className="w-4 h-4" />
              Add another team member
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border-2 border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
