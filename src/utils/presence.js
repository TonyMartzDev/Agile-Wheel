const PRESENCE_KEY = "agilewheel_presence";
const STALE_MS = 30000; // presence older than 30s is considered stale

export const getPresence = () => {
  try {
    const raw = localStorage.getItem(PRESENCE_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw);
    const cutoff = Date.now() - STALE_MS;
    return all.filter((p) => new Date(p.updatedAt).getTime() > cutoff);
  } catch {
    return [];
  }
};

export const setPresence = (user, projectId, phase) => {
  const existing = getPresence().filter((p) => p.userId !== user.id);
  const entry = {
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    projectId,
    phase,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(PRESENCE_KEY, JSON.stringify([...existing, entry]));
  // Dispatch storage event so other "tabs" / WheelPage polling catches it
  window.dispatchEvent(new Event("agilewheel_presence_changed"));
};

export const clearPresence = (userId) => {
  const existing = getPresence().filter((p) => p.userId !== userId);
  localStorage.setItem(PRESENCE_KEY, JSON.stringify(existing));
  window.dispatchEvent(new Event("agilewheel_presence_changed"));
};
