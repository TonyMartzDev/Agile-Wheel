import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Mail,
  User,
  Trash2,
  Save,
  AlertTriangle,
  X,
  Check,
} from 'lucide-react';

const SettingsPage = () => {
  const { user, updateUser, deleteAccount, logout } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState(user?.name || '');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [saveStatus, setSaveStatus] = useState({ email: null, name: null });

  const handleUpdateEmail = () => {
    if (email.trim() && email !== user?.email) {
      const success = updateUser({ email: email.trim() });
      setSaveStatus({ ...saveStatus, email: success ? 'success' : 'error' });
      setTimeout(() => setSaveStatus({ ...saveStatus, email: null }), 3000);
    }
  };

  const handleUpdateName = () => {
    if (name.trim() && name !== user?.name) {
      const success = updateUser({ name: name.trim() });
      setSaveStatus({ ...saveStatus, name: success ? 'success' : 'error' });
      setTimeout(() => setSaveStatus({ ...saveStatus, name: null }), 3000);
    }
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmation === 'DELETE') {
      deleteAccount();
      logout();
      navigate('/');
    }
  };

  const isEmailChanged = email.trim() && email !== user?.email;
  const isNameChanged = name.trim() && name !== user?.name;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back to Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-slate-200" />
              <h1 className="text-lg font-bold text-slate-900">Settings</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500 capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Account Information Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
              <h2 className="text-lg font-bold text-white">Account Information</h2>
              <p className="text-sm text-purple-100 mt-1">
                Update your personal details
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <button
                    onClick={handleUpdateEmail}
                    disabled={!isEmailChanged}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                      isEmailChanged
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {saveStatus.email === 'success' ? (
                      <>
                        <Check className="w-4 h-4" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save
                      </>
                    )}
                  </button>
                </div>
                {saveStatus.email === 'success' && (
                  <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Email updated successfully
                  </p>
                )}
              </div>

              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Display Name
                </label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Your Name"
                    />
                  </div>
                  <button
                    onClick={handleUpdateName}
                    disabled={!isNameChanged}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                      isNameChanged
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {saveStatus.name === 'success' ? (
                      <>
                        <Check className="w-4 h-4" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save
                      </>
                    )}
                  </button>
                </div>
                {saveStatus.name === 'success' && (
                  <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Name updated successfully
                  </p>
                )}
              </div>

              {/* Account ID (Read-only) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Account ID
                </label>
                <div className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600 font-mono">
                  {user?.id}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  This is your unique account identifier
                </p>
              </div>

              {/* Role (Read-only) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Role
                </label>
                <div className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600 capitalize">
                  {user?.role?.replace('_', ' ')}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Contact an administrator to change your role
                </p>
              </div>
            </div>
          </div>

          {/* Danger Zone Section */}
          <div className="bg-white rounded-xl shadow-sm border-2 border-red-200 overflow-hidden">
            <div className="bg-red-50 px-6 py-4 border-b border-red-200">
              <h2 className="text-lg font-bold text-red-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </h2>
              <p className="text-sm text-red-700 mt-1">
                Irreversible actions that permanently affect your account
              </p>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">Delete Account</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Permanently delete your account and all associated data. This action
                    cannot be undone.
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    Delete Account
                  </h3>
                  <p className="text-sm text-slate-600 mt-2">
                    This action is permanent and cannot be undone. All your data including:
                  </p>
                  <ul className="text-sm text-slate-600 mt-2 space-y-1 list-disc list-inside">
                    <li>Account information (name, email)</li>
                    <li>Project memberships</li>
                    <li>Chat messages</li>
                    <li>All personal settings</li>
                  </ul>
                  <p className="text-sm text-slate-600 mt-2">
                    will be permanently deleted.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Type <span className="font-mono text-red-600">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="DELETE"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmation('');
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                >
                  <X className="w-4 h-4 inline mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmation !== 'DELETE'}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    deleteConfirmation === 'DELETE'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Trash2 className="w-4 h-4 inline mr-2" />
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
