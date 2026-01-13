import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { AppState, FamilyMember, Task, CompletedTask, PointRule, Reward, BigGoal, VincentData } from '@/types';

// Default state helpers (still useful for initial render)
const defaultVincentData: VincentData = {
  bankPoints: 0,
  bigGoal: null,
  lifetimePoints: 0,
};

const getDefaultState = (): AppState => ({
  tasks: [],
  completedTasks: [],
  pointRules: [],
  rewards: [],
  currentUser: null,
  vincentData: defaultVincentData,
});

interface AppContextType extends AppState {
  setCurrentUser: (user: FamilyMember | null) => void;
  completeTask: (taskId: string, member: FamilyMember) => void;
  uncompleteTask: (taskId: string, member: FamilyMember) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  addPointRule: (rule: Omit<PointRule, 'id'>) => void;
  updatePointRule: (rule: PointRule) => void;
  deletePointRule: (ruleId: string) => void;
  addReward: (reward: Omit<Reward, 'id'>) => void;
  updateReward: (reward: Reward) => void;
  deleteReward: (rewardId: string) => void;
  redeemReward: (rewardId: string, member: FamilyMember) => boolean;
  depositToBank: (points: number) => void;
  withdrawFromBank: (points: number) => boolean;
  adjustLifetimePoints: (points: number) => void;
  setBigGoal: (goal: BigGoal | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(getDefaultState);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        // Preserve currentUser from local state as it's not in DB
        setState(prev => ({ ...data, currentUser: prev.currentUser }));
      }
    } catch (error) {
      console.error('Failed to fetch state:', error);
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const setCurrentUser = useCallback((user: FamilyMember | null) => {
    setState(prev => ({ ...prev, currentUser: user }));
  }, []);

  const completeTask = useCallback(async (taskId: string, member: FamilyMember) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const completedTask: CompletedTask = {
        id: Date.now().toString(), // Backend will ignore or use this
        taskId,
        completedBy: member,
        completedAt: new Date().toISOString(),
        pointsEarned: task.points,
      };
      
      await fetch('/api/completed-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completedTask)
      });
      fetchState();
    } catch (e) { console.error(e); }
  }, [state.tasks, fetchState]);

  const uncompleteTask = useCallback(async (taskId: string, member: FamilyMember) => {
    const today = new Date().toDateString();
    const completedTask = state.completedTasks.find(
      ct => ct.taskId === taskId && 
           ct.completedBy === member && 
           new Date(ct.completedAt).toDateString() === today
    );
    
    if (!completedTask) return;

    try {
      await fetch(`/api/completed-tasks/${completedTask.id}`, { method: 'DELETE' });
      fetchState();
    } catch (e) { console.error(e); }
  }, [state.completedTasks, fetchState]);

  const addTask = useCallback(async (task: Omit<Task, 'id'>) => {
    try {
      const newTask = { ...task, id: Date.now().toString() };
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      fetchState();
    } catch (e) { console.error(e); }
  }, [fetchState]);

  const updateTask = useCallback(async (task: Task) => {
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      fetchState();
    } catch (e) { console.error(e); }
  }, [fetchState]);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      fetchState();
    } catch (e) { console.error(e); }
  }, [fetchState]);

  const addPointRule = useCallback(async (rule: Omit<PointRule, 'id'>) => {
    try {
      const newRule = { ...rule, id: Date.now().toString() };
      await fetch('/api/point-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule)
      });
      fetchState();
    } catch (e) { console.error(e); }
  }, [fetchState]);

  const updatePointRule = useCallback(async (rule: PointRule) => {
    try {
      await fetch(`/api/point-rules/${rule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule)
      });
      fetchState();
    } catch (e) { console.error(e); }
  }, [fetchState]);

  const deletePointRule = useCallback(async (ruleId: string) => {
    try {
      await fetch(`/api/point-rules/${ruleId}`, { method: 'DELETE' });
      fetchState();
    } catch (e) { console.error(e); }
  }, [fetchState]);

  const addReward = useCallback(async (reward: Omit<Reward, 'id'>) => {
    try {
      const newReward = { ...reward, id: Date.now().toString() };
      await fetch('/api/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReward)
      });
      fetchState();
    } catch (e) { console.error(e); }
  }, [fetchState]);

  const updateReward = useCallback(async (reward: Reward) => {
    try {
      await fetch(`/api/rewards/${reward.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reward)
      });
      fetchState();
    } catch (e) { console.error(e); }
  }, [fetchState]);

  const deleteReward = useCallback(async (rewardId: string) => {
    try {
      await fetch(`/api/rewards/${rewardId}`, { method: 'DELETE' });
      fetchState();
    } catch (e) { console.error(e); }
  }, [fetchState]);

  const redeemReward = useCallback((rewardId: string, member: FamilyMember): boolean => {
    // This is synchronous in the interface but API is async. 
    // We'll optimistically return true if validations pass, but real consistency depends on server.
    // For now we'll fire and forget the update and return true/false based on local state check.
    const reward = state.rewards.find(r => r.id === rewardId);
    if (!reward) return false;

    if (member === 'son') {
      if (state.vincentData.bankPoints < reward.pointsCost) return false;
      fetch('/api/vincent/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pointsCost: reward.pointsCost })
      }).then(() => fetchState());
      return true;
    }
    return true; // Parents can redeem freely?
  }, [state, fetchState]);

  const depositToBank = useCallback(async (points: number) => {
    try {
      await fetch('/api/vincent/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: points, type: 'deposit' })
      });
      fetchState();
    } catch (e) { console.error(e); }
  }, [fetchState]);

  const withdrawFromBank = useCallback((points: number): boolean => {
    if (state.vincentData.bankPoints < points) return false;
    fetch('/api/vincent/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: points, type: 'withdraw' })
    }).then(() => fetchState());
    return true;
  }, [state.vincentData.bankPoints, fetchState]);

  const adjustLifetimePoints = useCallback(async (points: number) => {
    try {
       await fetch('/api/vincent/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: points, type: 'adjust_lifetime' })
      });
      fetchState();
    } catch (e) { console.error(e); }
  }, [fetchState]);

  const setBigGoal = useCallback(async (goal: BigGoal | null) => {
    try {
       await fetch('/api/vincent/big-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal)
      });
      fetchState();
    } catch (e) { console.error(e); }
  }, [fetchState]);

  const contextValue = useMemo<AppContextType>(() => ({
    ...state,
    setCurrentUser,
    completeTask,
    uncompleteTask,
    addTask,
    updateTask,
    deleteTask,
    addPointRule,
    updatePointRule,
    deletePointRule,
    addReward,
    updateReward,
    deleteReward,
    redeemReward,
    depositToBank,
    withdrawFromBank,
    adjustLifetimePoints,
    setBigGoal,
  }), [
    state,
    setCurrentUser,
    completeTask,
    uncompleteTask,
    addTask,
    updateTask,
    deleteTask,
    addPointRule,
    updatePointRule,
    deletePointRule,
    addReward,
    updateReward,
    deleteReward,
    redeemReward,
    depositToBank,
    withdrawFromBank,
    adjustLifetimePoints,
    setBigGoal,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};