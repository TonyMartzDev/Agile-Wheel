import { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import {
  MessageSquare,
  X,
  Send,
  Plus,
  ChevronLeft,
  Users,
  User,
  Minimize2,
  Maximize2
} from 'lucide-react';

const ChatWindow = () => {
  const { user } = useAuth();
  const { projects } = useProjects();
  const {
    isOpen,
    activeConversation,
    conversations,
    sendMessage,
    openConversation,
    startPrivateChat,
    toggleChat,
    closeChat,
  } = useChat();

  const [messageText, setMessageText] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  const currentProject = projects[0];
  const teamMembers = currentProject?.team || [];
  
  // Mock organization members (in production, this would come from backend)
  const organizationMembers = [
    { id: '1', name: 'Alice Johnson', role: 'product_owner', email: 'alice@company.com' },
    { id: '2', name: 'Bob Smith', role: 'scrum_master', email: 'bob@company.com' },
    { id: '3', name: 'Carol Davis', role: 'developer', email: 'carol@company.com' },
    { id: '4', name: 'David Wilson', role: 'qa_engineer', email: 'david@company.com' },
    { id: '5', name: 'Eve Martinez', role: 'developer', email: 'eve@company.com' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageText.trim() && activeConversation) {
      sendMessage(activeConversation.id, messageText);
      setMessageText('');
    }
  };

  const handleStartPrivateChat = (member) => {
    startPrivateChat(member);
    setShowAddUserModal(false);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={toggleChat}
        className="fixed right-6 bottom-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all z-50 group"
      >
        <MessageSquare className="w-6 h-6" />
        {conversations.some(c => c.unreadCount > 0) && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
            {conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className={`fixed right-0 top-0 h-screen bg-white shadow-2xl border-l border-slate-200 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80' : 'w-96'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <h2 className="font-bold">
            {activeConversation ? activeConversation.name : 'Messages'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={closeChat}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Conversation List or Active Chat */}
          {!activeConversation ? (
            <div className="flex flex-col h-[calc(100vh-64px)]">
              {/* Add User Button */}
              <div className="p-4 border-b border-slate-200">
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  New Conversation
                </button>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm">No conversations yet</p>
                    <p className="text-xs mt-1">Start a new chat to get started</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {conversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        onClick={() => openConversation(conversation.id)}
                        className="w-full p-4 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {conversation.type === 'team' ? (
                              <Users className="w-5 h-5" />
                            ) : (
                              conversation.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-slate-900 truncate">
                                {conversation.name}
                              </h3>
                              {conversation.lastMessageTime && (
                                <span className="text-xs text-slate-500">
                                  {formatTime(conversation.lastMessageTime)}
                                </span>
                              )}
                            </div>
                            {conversation.lastMessage && (
                              <p className="text-sm text-slate-600 truncate">
                                {conversation.lastMessage}
                              </p>
                            )}
                            {conversation.type === 'team' && (
                              <span className="inline-flex items-center gap-1 mt-1 text-xs text-purple-600">
                                <Users className="w-3 h-3" />
                                Team Chat
                              </span>
                            )}
                          </div>
                          {conversation.unreadCount > 0 && (
                            <span className="w-5 h-5 bg-purple-600 rounded-full text-xs text-white flex items-center justify-center font-bold">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-[calc(100vh-64px)]">
              {/* Active Conversation Header */}
              <div className="p-4 border-b border-slate-200 flex items-center gap-3">
                <button
                  onClick={() => openConversation(null)}
                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold">
                  {activeConversation.type === 'team' ? (
                    <Users className="w-5 h-5" />
                  ) : (
                    activeConversation.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{activeConversation.name}</h3>
                  <p className="text-xs text-slate-500">
                    {activeConversation.type === 'team' ? 'Team Chat' : 'Direct Message'}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeConversation.messages?.length === 0 ? (
                  <div className="text-center text-slate-500 py-8">
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs mt-1">Start the conversation!</p>
                  </div>
                ) : (
                  activeConversation.messages?.map((message) => {
                    const isOwnMessage = message.senderId === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <button
                          onClick={() => {
                            if (!isOwnMessage) {
                              const sender = activeConversation.participants.find(
                                p => p.id === message.senderId
                              );
                              if (sender && activeConversation.type === 'team') {
                                handleStartPrivateChat(sender);
                              }
                            }
                          }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                            isOwnMessage 
                              ? 'bg-gradient-to-br from-purple-500 to-blue-500' 
                              : 'bg-gradient-to-br from-slate-400 to-slate-500 hover:from-purple-400 hover:to-blue-400 transition-all'
                          }`}
                          title={!isOwnMessage && activeConversation.type === 'team' ? 'Click to send private message' : ''}
                        >
                          {message.senderAvatar}
                        </button>
                        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[75%]`}>
                          {!isOwnMessage && (
                            <span className="text-xs text-slate-500 mb-1 px-2">
                              {message.senderName}
                            </span>
                          )}
                          <div
                            className={`rounded-lg px-3 py-2 ${
                              isOwnMessage
                                ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white'
                                : 'bg-slate-100 text-slate-900'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                          </div>
                          <span className="text-xs text-slate-400 mt-1 px-2">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="bg-gradient-to-br from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Start a Conversation</h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
              {/* Team Members */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Team Members
                </h4>
                <div className="space-y-2">
                  {teamMembers.filter(m => m.id !== user?.id).map((member) => (
                    <button
                      key={member.id}
                      onClick={() => handleStartPrivateChat(member)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-slate-900">{member.name}</p>
                        <p className="text-xs text-slate-500 capitalize">
                          {member.role?.replace('_', ' ')}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Organization Members */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Organization
                </h4>
                <div className="space-y-2">
                  {organizationMembers.filter(m => m.id !== user?.id && !teamMembers.some(tm => tm.id === m.id)).map((member) => (
                    <button
                      key={member.id}
                      onClick={() => handleStartPrivateChat(member)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-slate-900">{member.name}</p>
                        <p className="text-xs text-slate-500 capitalize">
                          {member.role?.replace('_', ' ')}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
