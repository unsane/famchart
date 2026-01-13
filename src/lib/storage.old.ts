import { AppState, Task, CompletedTask, PointRule, Reward, FamilyMember, VincentData, BigGoal } from '@/types';

const STORAGE_KEY = 'famchart-data';

const defaultVincentData: VincentData = {
  bankPoints: 0,
  bigGoal: {
    id: '1',
    title: 'Nintendo Switch Game',
    description: 'Save up for a new game!',
    targetPoints: 500,
    emoji: '🎮',
  },
  lifetimePoints: 0,
};

const defaultPointRules: PointRule[] = [
  { id: '1', description: '20 minute reading', points: 2, category: 'educational' },
  { id: '2', description: 'Complete homework', points: 5, category: 'homework' },
  { id: '3', description: 'Clean room', points: 3, category: 'chores' },
  { id: '4', description: 'Do dishes', points: 2, category: 'chores' },
  { id: '5', description: 'Practice instrument', points: 3, category: 'educational' },
  { id: '6', description: 'Help with cooking', points: 2, category: 'chores' },
  { id: '7', description: 'Math practice (30 min)', points: 4, category: 'educational' },
  { id: '8', description: 'Make bed', points: 1, category: 'chores' },
];

const defaultRewards: Reward[] = [
  { id: '1', title: 'Extra Screen Time', description: '30 minutes of extra gaming or TV', pointsCost: 10, emoji: '🎮' },
  { id: '2', title: 'Ice Cream Trip', description: 'Go out for ice cream!', pointsCost: 25, emoji: '🍦' },
  { id: '3', title: 'Movie Night Pick', description: 'Choose the family movie', pointsCost: 15, emoji: '🎬' },
  { id: '4', title: 'Stay Up Late', description: 'Extra 30 min before bedtime', pointsCost: 20, emoji: '🌙' },
  { id: '5', title: 'Special Outing', description: 'Trip to park, arcade, etc.', pointsCost: 50, emoji: '🎢' },
  { id: '6', title: 'No Chores Day', description: 'Skip chores for a day', pointsCost: 30, emoji: '🎉' },
];

const defaultTasks: Task[] = [
  { id: '1', title: 'Make bed', category: 'chores', points: 1, assignedTo: ['son'], recurring: 'daily' },
  { id: '2', title: 'Clean room', category: 'chores', points: 3, assignedTo: ['son'], recurring: 'weekly' },
  { id: '3', title: 'Do homework', category: 'homework', points: 5, assignedTo: ['son'], recurring: 'daily' },
  { id: '4', title: 'Reading time (20 min)', category: 'educational', points: 2, assignedTo: ['son'], recurring: 'daily' },
  { id: '5', title: 'Practice piano', category: 'educational', points: 3, assignedTo: ['son'], recurring: 'daily' },
  { id: '6', title: 'Do dishes', category: 'chores', points: 2, assignedTo: ['mom', 'dad', 'son'], recurring: 'daily' },
  { id: '7', title: 'Take out trash', category: 'chores', points: 2, assignedTo: ['dad', 'son'], recurring: 'weekly' },
];

export const getDefaultState = (): AppState => ({
  tasks: defaultTasks,
  completedTasks: [],
  pointRules: defaultPointRules,
  rewards: defaultRewards,
  currentUser: null,
  vincentData: defaultVincentData,
});

export const loadState = (): AppState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading state:', e);
  }
  return getDefaultState();
};

export const saveState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving state:', e);
  }
};

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
