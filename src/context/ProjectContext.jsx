import { createContext, useContext, useState } from 'react';

const ProjectContext = createContext(null);

const STORAGE_KEY = 'agilewheel_projects';

const getStoredProjects = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Return demo projects for first-time users
  return [
    {
      id: '1',
      name: 'E-Commerce Platform',
      description: 'Building a modern e-commerce solution',
      phase: 'Develop',
      progress: 65,
      team: [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Project Owner' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Scrum Master' },
        { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'Developer' },
      ],
      sprints: [
        { id: '1', name: 'Sprint 1', status: 'completed', startDate: '2026-03-01', endDate: '2026-03-14' },
        { id: '2', name: 'Sprint 2', status: 'completed', startDate: '2026-03-15', endDate: '2026-03-28' },
        { id: '3', name: 'Sprint 3', status: 'active', startDate: '2026-03-29', endDate: '2026-04-11' },
      ],
      tasks: [
        { id: '1', title: 'Setup authentication', status: 'done', priority: 'high', assignee: 'Bob Wilson' },
        { id: '2', title: 'Design product catalog', status: 'done', priority: 'high', assignee: 'Jane Smith' },
        { id: '3', title: 'Implement shopping cart', status: 'in_progress', priority: 'high', assignee: 'Bob Wilson' },
        { id: '4', title: 'Payment integration', status: 'todo', priority: 'high', assignee: 'Bob Wilson' },
        { id: '5', title: 'Order management', status: 'todo', priority: 'medium', assignee: 'Jane Smith' },
      ],
      createdAt: '2026-03-01T10:00:00Z',
    },
    {
      id: '2',
      name: 'Mobile App Redesign',
      description: 'Redesigning the mobile experience',
      phase: 'Design',
      progress: 35,
      team: [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Project Owner' },
        { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'Designer' },
      ],
      sprints: [
        { id: '1', name: 'Sprint 1', status: 'active', startDate: '2026-03-20', endDate: '2026-04-02' },
      ],
      tasks: [
        { id: '1', title: 'User research', status: 'done', priority: 'high', assignee: 'Alice Brown' },
        { id: '2', title: 'Wireframes', status: 'in_progress', priority: 'high', assignee: 'Alice Brown' },
        { id: '3', title: 'UI mockups', status: 'todo', priority: 'medium', assignee: 'Alice Brown' },
      ],
      createdAt: '2026-03-20T10:00:00Z',
    },
    {
      id: '3',
      name: 'API Optimization',
      description: 'Improving API performance and reliability',
      phase: 'Test',
      progress: 80,
      team: [
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Scrum Master' },
        { id: '5', name: 'Charlie Davis', email: 'charlie@example.com', role: 'Developer' },
      ],
      sprints: [
        { id: '1', name: 'Sprint 1', status: 'completed', startDate: '2026-03-01', endDate: '2026-03-14' },
        { id: '2', name: 'Sprint 2', status: 'completed', startDate: '2026-03-15', endDate: '2026-03-28' },
        { id: '3', name: 'Sprint 3', status: 'active', startDate: '2026-03-29', endDate: '2026-04-11' },
      ],
      tasks: [
        { id: '1', title: 'Performance audit', status: 'done', priority: 'high', assignee: 'Charlie Davis' },
        { id: '2', title: 'Database optimization', status: 'done', priority: 'high', assignee: 'Charlie Davis' },
        { id: '3', title: 'Load testing', status: 'in_progress', priority: 'high', assignee: 'Charlie Davis' },
        { id: '4', title: 'Documentation', status: 'todo', priority: 'low', assignee: 'Jane Smith' },
      ],
      createdAt: '2026-03-01T10:00:00Z',
    },
  ];
};

const saveProjects = (projects) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState(getStoredProjects);

  const createProject = (projectData) => {
    const newProject = {
      id: crypto.randomUUID(),
      ...projectData,
      phase: 'Plan',
      progress: 0,
      team: projectData.team || [],
      sprints: [],
      tasks: [],
      createdAt: new Date().toISOString(),
    };
    
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
    return newProject;
  };

  const updateProject = (projectId, updates) => {
    const updatedProjects = projects.map(p => 
      p.id === projectId ? { ...p, ...updates } : p
    );
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
  };

  const deleteProject = (projectId) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
  };

  const addTeamMember = (projectId, member) => {
    const updatedProjects = projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          team: [...p.team, { id: crypto.randomUUID(), ...member }],
        };
      }
      return p;
    });
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
  };

  const addTask = (projectId, task) => {
    const updatedProjects = projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: [...p.tasks, { id: crypto.randomUUID(), ...task, status: 'todo' }],
        };
      }
      return p;
    });
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
  };

  const updateTaskStatus = (projectId, taskId, status) => {
    const updatedProjects = projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: p.tasks.map(t => t.id === taskId ? { ...t, status } : t),
        };
      }
      return p;
    });
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
  };

  const value = {
    projects,
    createProject,
    updateProject,
    deleteProject,
    addTeamMember,
    addTask,
    updateTaskStatus,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectContext;
