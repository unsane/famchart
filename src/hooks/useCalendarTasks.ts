import { useMemo, useCallback } from 'react';
import { isSameDay } from 'date-fns';
import { useApp } from '@/context/AppContext';
import { FamilyMember, Task } from '@/types';
import { isTaskCompletedToday } from '@/lib/storage';
import { celebrateTaskComplete } from '@/lib/confetti';

/**
 * Shared hook for calendar task filtering and interactions
 */
export const useCalendarTasks = (selectedMembers: FamilyMember[]) => {
  const { tasks, completedTasks, completeTask, uncompleteTask, currentUser } = useApp();

  /**
   * Get tasks for a specific day based on recurrence rules
   */
  const getTasksForDay = useCallback((day: Date): Task[] => {
    const dayOfWeek = day.getDay();
    
    return tasks.filter(task => {
      const hasSelectedMember = task.assignedTo.some(member => selectedMembers.includes(member));
      if (!hasSelectedMember) return false;
      
      if (task.recurring === 'daily') return true;
      if (task.recurring === 'weekly') return dayOfWeek === 0;
      if (task.recurring === 'once' && task.dueDate) {
        return isSameDay(new Date(task.dueDate), day);
      }
      return false;
    });
  }, [tasks, selectedMembers]);

  /**
   * Check if task is completed on a specific day by selected members
   */
  const isTaskCompletedOnDay = useCallback((taskId: string, day: Date): boolean => {
    return completedTasks.some(ct => {
      const completedDate = new Date(ct.completedAt);
      return ct.taskId === taskId && 
             selectedMembers.includes(ct.completedBy) && 
             isSameDay(completedDate, day);
    });
  }, [completedTasks, selectedMembers]);

  /**
   * Check if task is completed today by current user
   */
  const isTaskCompletedByCurrentUser = useCallback((taskId: string): boolean => {
    if (!currentUser) return false;
    return isTaskCompletedToday(completedTasks, taskId, currentUser);
  }, [completedTasks, currentUser]);

  /**
   * Toggle task completion for current user
   */
  const handleToggleTask = useCallback((task: Task) => {
    if (!currentUser) return;
    
    if (isTaskCompletedByCurrentUser(task.id)) {
      uncompleteTask(task.id, currentUser);
    } else {
      completeTask(task.id, currentUser);
      celebrateTaskComplete();
    }
  }, [currentUser, isTaskCompletedByCurrentUser, completeTask, uncompleteTask]);

  /**
   * Get points earned on a specific day by selected members
   */
  const getPointsForDay = useCallback((day: Date): number => {
    return completedTasks
      .filter(ct => 
        selectedMembers.includes(ct.completedBy) && 
        isSameDay(new Date(ct.completedAt), day)
      )
      .reduce((sum, ct) => sum + ct.pointsEarned, 0);
  }, [completedTasks, selectedMembers]);

  /**
   * Get completed task count for a specific day
   */
  const getCompletedCountForDay = useCallback((day: Date): number => {
    return completedTasks.filter(ct => 
      selectedMembers.includes(ct.completedBy) && 
      isSameDay(new Date(ct.completedAt), day)
    ).length;
  }, [completedTasks, selectedMembers]);

  return {
    tasks,
    completedTasks,
    currentUser,
    getTasksForDay,
    isTaskCompletedOnDay,
    isTaskCompletedByCurrentUser,
    handleToggleTask,
    getPointsForDay,
    getCompletedCountForDay,
  };
};
