import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

const ChatContext = createContext(null);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState(null);
  const [conversations, setConversations] = useState([]);

  const loadConversations = useCallback(() => {
    if (!user) return;

    // Load personal conversations
    const personalChats = JSON.parse(
      localStorage.getItem(`agilewheel_personal_chats_${user.id}`) || "[]",
    );

    // Load team conversations (project-scoped)
    const teamChats = JSON.parse(
      localStorage.getItem("agilewheel_team_chats") || "[]",
    );

    setConversations([...teamChats, ...personalChats]);
  }, [user]);

  // Load conversations from localStorage on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const saveConversation = (conversation) => {
    if (conversation.type === "team") {
      // Save to team chats (project-scoped)
      const teamChats = JSON.parse(
        localStorage.getItem("agilewheel_team_chats") || "[]",
      );
      const existingIndex = teamChats.findIndex(
        (c) => c.id === conversation.id,
      );

      if (existingIndex >= 0) {
        teamChats[existingIndex] = conversation;
      } else {
        teamChats.push(conversation);
      }

      localStorage.setItem("agilewheel_team_chats", JSON.stringify(teamChats));
    } else {
      // Save to personal chats
      const personalChats = JSON.parse(
        localStorage.getItem(`agilewheel_personal_chats_${user.id}`) || "[]",
      );
      const existingIndex = personalChats.findIndex(
        (c) => c.id === conversation.id,
      );

      if (existingIndex >= 0) {
        personalChats[existingIndex] = conversation;
      } else {
        personalChats.push(conversation);
      }

      localStorage.setItem(
        `agilewheel_personal_chats_${user.id}`,
        JSON.stringify(personalChats),
      );
    }

    loadConversations();
  };

  const sendMessage = (conversationId, messageText) => {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation) return;

    const newMessage = {
      id: crypto.randomUUID(),
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.name.charAt(0).toUpperCase(),
      text: messageText,
      timestamp: new Date().toISOString(),
    };

    const updatedConversation = {
      ...conversation,
      messages: [...(conversation.messages || []), newMessage],
      lastMessage: messageText,
      lastMessageTime: new Date().toISOString(),
    };

    saveConversation(updatedConversation);

    if (activeConversation?.id === conversationId) {
      setActiveConversation(updatedConversation);
    }
  };

  const createConversation = (
    type,
    participants,
    projectId = null,
    name = null,
  ) => {
    const conversationId = crypto.randomUUID();

    const newConversation = {
      id: conversationId,
      type, // 'team' or 'personal'
      projectId,
      name:
        name ||
        (type === "team"
          ? "Team Chat"
          : participants.find((p) => p.id !== user.id)?.name || "Chat"),
      participants,
      messages: [],
      createdAt: new Date().toISOString(),
      lastMessageTime: new Date().toISOString(),
    };

    saveConversation(newConversation);
    setActiveConversation(newConversation);
    setIsOpen(true);

    return newConversation;
  };

  const openConversation = (conversationId) => {
    if (conversationId === null) {
      setActiveConversation(null);
      return;
    }
    const conversation = conversations.find((c) => c.id === conversationId);
    if (conversation) {
      setActiveConversation(conversation);
      setIsOpen(true);
    }
  };

  const startPrivateChat = (otherUser) => {
    // Check if conversation already exists
    const existingConversation = conversations.find(
      (c) =>
        c.type === "personal" &&
        c.participants.some((p) => p.id === otherUser.id) &&
        c.participants.some((p) => p.id === user.id),
    );

    if (existingConversation) {
      openConversation(existingConversation.id);
    } else {
      createConversation("personal", [user, otherUser]);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const deleteOldMessages = (retentionDays) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const personalChats = JSON.parse(
      localStorage.getItem(`agilewheel_personal_chats_${user.id}`) || "[]",
    );

    const updatedChats = personalChats.map((conversation) => ({
      ...conversation,
      messages: conversation.messages.filter(
        (msg) => new Date(msg.timestamp) > cutoffDate,
      ),
    }));

    localStorage.setItem(
      `agilewheel_personal_chats_${user.id}`,
      JSON.stringify(updatedChats),
    );
    loadConversations();
  };

  const value = {
    isOpen,
    activeConversation,
    conversations,
    sendMessage,
    createConversation,
    openConversation,
    startPrivateChat,
    toggleChat,
    closeChat,
    deleteOldMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatContext;
