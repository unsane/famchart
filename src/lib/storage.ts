import { AppState, Task, CompletedTask, PointRule, Reward, FamilyMember, VincentData } from '@/types';

// We keep these defaults for initial state before API load or types
const defaultVincentData: VincentData = {
  bankPoints: 0,
  bigGoal: null,
  lifetimePoints: 0,
};

export const getDefaultState = (): AppState => ({
  tasks: [],
  completedTasks: [],
  pointRules: [],
  rewards: [],
  currentUser: null,
  vincentData: defaultVincentData,
});

// Deprecated: No longer used for persistence, but kept if imported
export const loadState = (): AppState => getDefaultState();
export const saveState = (state: AppState): void => {};

export const getPointsForMember = (
  completedTasks: CompletedTask[],
  member: FamilyMember,
  period: 'day' | 'week' | 'month' | 'year' | 'all'
): number => {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      const dayOfWeek = now.getDay();
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'all':
      startDate = new Date(0);
      break;
  }

  return completedTasks
    .filter(task => {
      const taskDate = new Date(task.completedAt);
      return task.completedBy === member && taskDate >= startDate;
    })
    .reduce((sum, task) => sum + task.pointsEarned, 0);
};

export const isTaskCompletedToday = (
  completedTasks: CompletedTask[],
  taskId: string,
  member: FamilyMember
): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return completedTasks.some(ct => {
    const completedDate = new Date(ct.completedAt);
    completedDate.setHours(0, 0, 0, 0);
    return ct.taskId === taskId && ct.completedBy === member && completedDate.getTime() === today.getTime();
  });
};
