export type FamilyMember = 'mom' | 'dad' | 'son';

export type TaskCategory = 'chores' | 'homework' | 'educational' | 'dates';

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  points: number;
  assignedTo: FamilyMember[];
  recurring: 'daily' | 'weekly' | 'once';
  dueDate?: string;
  startTime?: string; // HH:mm format for time-based tasks
  endTime?: string; // HH:mm format
}

export interface CompletedTask {
  id: string;
  taskId: string;
  completedBy: FamilyMember;
  completedAt: string;
  pointsEarned: number;
}

export interface PointRule {
  id: string;
  description: string;
  points: number;
  category: TaskCategory;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  emoji: string;
}

export interface FamilyMemberData {
  id: FamilyMember;
  name: string;
  emoji: string;
  color: string;
}

export interface BigGoal {
  id: string;
  title: string;
  description: string;
  targetPoints: number;
  emoji: string;
}

export interface VincentData {
  bankPoints: number;
  bigGoal: BigGoal | null;
  lifetimePoints: number;
}

export interface AppState {
  tasks: Task[];
  completedTasks: CompletedTask[];
  pointRules: PointRule[];
  rewards: Reward[];
  currentUser: FamilyMember | null;
  vincentData: VincentData;
}
