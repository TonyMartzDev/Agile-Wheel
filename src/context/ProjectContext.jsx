import { createContext, useContext, useState } from "react";

const ProjectContext = createContext(null);

const STORAGE_KEY = "agilewheel_projects";

const getStoredProjects = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Return demo projects for first-time users
  return [
    {
      id: "1",
      name: "E-Commerce Platform",
      description: "Building a modern e-commerce solution",
      phase: "Develop",
      progress: 65,
      team: [
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          role: "product_owner",
        },
        {
          id: "2",
          name: "Jane Smith",
          email: "jane@example.com",
          role: "scrum_master",
        },
        {
          id: "3",
          name: "Bob Wilson",
          email: "bob@example.com",
          role: "developer",
        },
        {
          id: "6",
          name: "Sarah Chen",
          email: "sarah@example.com",
          role: "qa_engineer",
        },
      ],
      sprints: [
        {
          id: "1",
          name: "Sprint 1",
          status: "completed",
          startDate: "2026-03-01",
          endDate: "2026-03-14",
        },
        {
          id: "2",
          name: "Sprint 2",
          status: "completed",
          startDate: "2026-03-15",
          endDate: "2026-03-28",
        },
        {
          id: "3",
          name: "Sprint 3",
          status: "active",
          startDate: "2026-03-29",
          endDate: "2026-04-11",
        },
      ],
      tasks: [
        {
          id: "1",
          title: "Setup authentication",
          status: "done",
          priority: "high",
          assignee: "Bob Wilson",
          acceptanceCriteria: [
            {
              id: "ac1",
              text: "Users can register with email",
              completed: true,
            },
            {
              id: "ac2",
              text: "Users can login with credentials",
              completed: true,
            },
            {
              id: "ac3",
              text: "Password reset functionality works",
              completed: true,
            },
          ],
        },
        {
          id: "2",
          title: "Design product catalog",
          status: "done",
          priority: "high",
          assignee: "Jane Smith",
          acceptanceCriteria: [
            {
              id: "ac1",
              text: "Grid and list view available",
              completed: true,
            },
            { id: "ac2", text: "Filtering by category works", completed: true },
          ],
        },
        {
          id: "3",
          title: "Implement shopping cart",
          status: "ready_for_test",
          priority: "high",
          assignee: "Bob Wilson",
          acceptanceCriteria: [
            {
              id: "ac1",
              text: "Users can add items to cart",
              completed: false,
            },
            {
              id: "ac2",
              text: "Cart persists across sessions",
              completed: false,
            },
            { id: "ac3", text: "Quantity can be updated", completed: false },
            { id: "ac4", text: "Items can be removed", completed: false },
          ],
        },
        {
          id: "4",
          title: "Payment integration",
          status: "todo",
          priority: "high",
          assignee: "Bob Wilson",
          acceptanceCriteria: [
            { id: "ac1", text: "Stripe integration works", completed: false },
            {
              id: "ac2",
              text: "Payment confirmation email sent",
              completed: false,
            },
          ],
        },
        {
          id: "5",
          title: "Order management",
          status: "in_progress",
          priority: "medium",
          assignee: "Jane Smith",
          acceptanceCriteria: [
            {
              id: "ac1",
              text: "Order history visible to users",
              completed: false,
            },
            {
              id: "ac2",
              text: "Order status updates in real-time",
              completed: false,
            },
          ],
        },
      ],
      bugs: [
        {
          id: "bug1",
          title: "Login button unresponsive on mobile",
          description:
            "The login button does not respond to taps on iOS Safari",
          severity: "high",
          status: "open",
          linkedTaskId: "1",
          reportedBy: "Sarah Chen",
          createdAt: "2026-03-25T10:00:00Z",
        },
        {
          id: "bug2",
          title: "Product images not loading",
          description: "Some product images show broken image icon",
          severity: "medium",
          status: "in_progress",
          linkedTaskId: "2",
          reportedBy: "Sarah Chen",
          createdAt: "2026-03-26T14:30:00Z",
        },
      ],
      phaseVotes: [],
      createdAt: "2026-03-01T10:00:00Z",
    },
    {
      id: "2",
      name: "Mobile App Redesign",
      description: "Redesigning the mobile experience",
      phase: "Design",
      progress: 35,
      team: [
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          role: "product_owner",
        },
        {
          id: "4",
          name: "Alice Brown",
          email: "alice@example.com",
          role: "developer",
        },
      ],
      sprints: [
        {
          id: "1",
          name: "Sprint 1",
          status: "active",
          startDate: "2026-03-20",
          endDate: "2026-04-02",
        },
      ],
      tasks: [
        {
          id: "1",
          title: "User research",
          status: "done",
          priority: "high",
          assignee: "Alice Brown",
          acceptanceCriteria: [
            { id: "ac1", text: "Interview 10 users", completed: true },
            { id: "ac2", text: "Create user personas", completed: true },
          ],
        },
        {
          id: "2",
          title: "Wireframes",
          status: "in_progress",
          priority: "high",
          assignee: "Alice Brown",
          acceptanceCriteria: [
            {
              id: "ac1",
              text: "Home screen wireframe complete",
              completed: true,
            },
            { id: "ac2", text: "Navigation flow documented", completed: false },
          ],
        },
        {
          id: "3",
          title: "UI mockups",
          status: "todo",
          priority: "medium",
          assignee: "Alice Brown",
          acceptanceCriteria: [],
        },
      ],
      bugs: [],
      phaseVotes: [],
      createdAt: "2026-03-20T10:00:00Z",
    },
    {
      id: "3",
      name: "API Optimization",
      description: "Improving API performance and reliability",
      phase: "Test",
      progress: 80,
      team: [
        {
          id: "2",
          name: "Jane Smith",
          email: "jane@example.com",
          role: "scrum_master",
        },
        {
          id: "5",
          name: "Charlie Davis",
          email: "charlie@example.com",
          role: "developer",
        },
        {
          id: "7",
          name: "Mike Johnson",
          email: "mike@example.com",
          role: "qa_engineer",
        },
      ],
      sprints: [
        {
          id: "1",
          name: "Sprint 1",
          status: "completed",
          startDate: "2026-03-01",
          endDate: "2026-03-14",
        },
        {
          id: "2",
          name: "Sprint 2",
          status: "completed",
          startDate: "2026-03-15",
          endDate: "2026-03-28",
        },
        {
          id: "3",
          name: "Sprint 3",
          status: "active",
          startDate: "2026-03-29",
          endDate: "2026-04-11",
        },
      ],
      tasks: [
        {
          id: "1",
          title: "Performance audit",
          status: "done",
          priority: "high",
          assignee: "Charlie Davis",
          acceptanceCriteria: [
            {
              id: "ac1",
              text: "Identify top 10 slow endpoints",
              completed: true,
            },
            {
              id: "ac2",
              text: "Document current response times",
              completed: true,
            },
          ],
        },
        {
          id: "2",
          title: "Database optimization",
          status: "ready_for_test",
          priority: "high",
          assignee: "Charlie Davis",
          acceptanceCriteria: [
            {
              id: "ac1",
              text: "Add indexes to slow queries",
              completed: false,
            },
            { id: "ac2", text: "Response time under 200ms", completed: false },
            { id: "ac3", text: "No N+1 queries", completed: false },
          ],
        },
        {
          id: "3",
          title: "Load testing",
          status: "ready_for_test",
          priority: "high",
          assignee: "Charlie Davis",
          acceptanceCriteria: [
            {
              id: "ac1",
              text: "Handle 1000 concurrent users",
              completed: false,
            },
            { id: "ac2", text: "No errors under load", completed: false },
          ],
        },
        {
          id: "4",
          title: "Documentation",
          status: "todo",
          priority: "low",
          assignee: "Jane Smith",
          acceptanceCriteria: [
            { id: "ac1", text: "API endpoints documented", completed: false },
          ],
        },
      ],
      bugs: [
        {
          id: "bug1",
          title: "Memory leak in connection pool",
          description: "Server memory usage grows over time",
          severity: "critical",
          status: "open",
          linkedTaskId: "2",
          reportedBy: "Mike Johnson",
          createdAt: "2026-04-01T09:00:00Z",
        },
      ],
      phaseVotes: [
        {
          id: "vote1",
          phase: "Release",
          userId: "7",
          vote: "incomplete",
          reason: "Critical bug still open",
          createdAt: "2026-04-02T10:00:00Z",
        },
      ],
      createdAt: "2026-03-01T10:00:00Z",
    },
  ];
};

const saveProjects = (projects) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState(getStoredProjects);

  const createProject = (projectData) => {
    const newProject = {
      id: crypto.randomUUID(),
      ...projectData,
      phase: "Plan",
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
    const updatedProjects = projects.map((p) =>
      p.id === projectId ? { ...p, ...updates } : p,
    );
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
  };

  const deleteProject = (projectId) => {
    const updatedProjects = projects.filter((p) => p.id !== projectId);
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
  };

  const addTeamMember = (projectId, member) => {
    const updatedProjects = projects.map((p) => {
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
    const updatedProjects = projects.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: [
            ...p.tasks,
            { id: crypto.randomUUID(), ...task, status: "todo" },
          ],
        };
      }
      return p;
    });
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
  };

  const updateTaskStatus = (projectId, taskId, status) => {
    const updatedProjects = projects.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
        };
      }
      return p;
    });
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
  };

  const addBug = (projectId, bug) => {
    const updatedProjects = projects.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          bugs: [
            ...(p.bugs || []),
            {
              id: crypto.randomUUID(),
              ...bug,
              status: "open",
              createdAt: new Date().toISOString(),
            },
          ],
        };
      }
      return p;
    });
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
  };

  const updateBugStatus = (projectId, bugId, status) => {
    const updatedProjects = projects.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          bugs: (p.bugs || []).map((b) =>
            b.id === bugId ? { ...b, status } : b,
          ),
        };
      }
      return p;
    });
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
  };

  const toggleAcceptanceCriteria = (projectId, taskId, criteriaId) => {
    const updatedProjects = projects.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: p.tasks.map((t) => {
            if (t.id === taskId) {
              return {
                ...t,
                acceptanceCriteria: (t.acceptanceCriteria || []).map((ac) =>
                  ac.id === criteriaId
                    ? { ...ac, completed: !ac.completed }
                    : ac,
                ),
              };
            }
            return t;
          }),
        };
      }
      return p;
    });
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
  };

  const addPhaseVote = (projectId, vote) => {
    const updatedProjects = projects.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          phaseVotes: [
            ...(p.phaseVotes || []),
            {
              id: crypto.randomUUID(),
              ...vote,
              createdAt: new Date().toISOString(),
            },
          ],
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
    addBug,
    updateBugStatus,
    toggleAcceptanceCriteria,
    addPhaseVote,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};

export default ProjectContext;
