import { motion } from 'framer-motion';
import { format, startOfWeek, addDays, isSameDay, isToday as checkIsToday, getWeek } from 'date-fns';
import { useApp } from '@/context/AppContext';
import { categoryInfo, familyMembers } from '@/data/familyMembers';
import { cn } from '@/lib/utils';
import { Check, Star } from 'lucide-react';
import { isTaskCompletedToday } from '@/lib/storage';
import { celebrateTaskComplete } from '@/lib/confetti';
import { Task, FamilyMember } from '@/types';
import { getHolidayForDate, isNonWorkingDay } from '@/data/swedishHolidays';

export interface WeekViewProps {
  date: Date;
  selectedMembers: FamilyMember[];
  onDayClick?: (day: Date) => void;
}

export const WeekView = ({ date, selectedMembers, onDayClick }: WeekViewProps) => {
  const { tasks, currentUser, completedTasks, completeTask, uncompleteTask } = useApp();
  
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getTasksForDay = (day: Date) => {
    const dayOfWeek = day.getDay();
    
    return tasks.filter(task => {
      // Check if task is assigned to any selected member
      const hasSelectedMember = task.assignedTo.some(member => selectedMembers.includes(member));
      if (!hasSelectedMember) return false;
      
      if (task.recurring === 'daily') return true;
      if (task.recurring === 'weekly') return dayOfWeek === 0;
      if (task.recurring === 'once' && task.dueDate) {
        return isSameDay(new Date(task.dueDate), day);
      }
      return false;
    });
  };

  const isTaskCompletedOnDay = (taskId: string, day: Date): boolean => {
    return completedTasks.some(ct => {
      const completedDate = new Date(ct.completedAt);
      return ct.taskId === taskId && 
             selectedMembers.includes(ct.completedBy) && 
             isSameDay(completedDate, day);
    });
  };

  const handleToggleTask = (task: Task, day: Date) => {
    if (!currentUser || !checkIsToday(day)) return;
    const isCompleted = isTaskCompletedToday(completedTasks, task.id, currentUser);
    if (isCompleted) {
      uncompleteTask(task.id, currentUser);
    } else {
      completeTask(task.id, currentUser);
      celebrateTaskComplete();
    }
  };

  return (
    <div className="space-y-4">
      {/* Week Number Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl px-4 py-2 inline-flex items-center gap-2">
        <span className="text-lg">📅</span>
        <span className="font-display font-bold text-primary">Week {getWeek(weekStart)}</span>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const isToday = checkIsToday(day);
          const dayTasks = getTasksForDay(day);
          const holiday = getHolidayForDate(day);
          const isNonWorking = isNonWorkingDay(day);
          
          return (
            <motion.div
              key={day.toISOString()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "rounded-xl p-2 min-h-[200px] transition-all",
                isNonWorking 
                  ? "bg-rose-50/50 dark:bg-rose-950/20" 
                  : "bg-card",
                isToday && "ring-2 ring-primary shadow-glow"
              )}
            >
              {/* Day Header - clickable */}
              <div 
                onClick={() => onDayClick?.(day)}
                className={cn(
                  "text-center p-2 rounded-lg mb-2 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all",
                  isToday 
                    ? "bg-primary text-primary-foreground" 
                    : isNonWorking 
                      ? "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300"
                      : "bg-muted"
                )}
              >
                <div className="text-xs font-semibold uppercase">
                  {format(day, 'EEE')}
                </div>
                <div className="text-lg font-bold">
                  {format(day, 'd')}
                </div>
                {holiday && (
                  <div className="text-[10px] font-medium truncate mt-0.5">
                    {holiday.name}
                  </div>
                )}
              </div>

              {/* Tasks */}
              <div className="space-y-1.5">
                {dayTasks.slice(0, 4).map((task) => {
                  const completed = isTaskCompletedOnDay(task.id, day);
                  const info = categoryInfo[task.category];
                  const canInteract = isToday;
                  
                  return (
                    <motion.button
                      key={task.id}
                      onClick={() => handleToggleTask(task, day)}
                      disabled={!canInteract}
                      whileHover={canInteract ? { scale: 1.02 } : {}}
                      whileTap={canInteract ? { scale: 0.98 } : {}}
                      className={cn(
                        "w-full text-left p-2 rounded-lg text-xs transition-all",
                        completed 
                          ? "bg-success/20 line-through text-muted-foreground"
                          : canInteract
                            ? "bg-muted hover:bg-primary/10 cursor-pointer"
                            : "bg-muted/50 cursor-default"
                      )}
                    >
                      <div className="flex items-center gap-1">
                        {completed ? (
                          <Check className="w-3 h-3 text-success flex-shrink-0" />
                        ) : (
                          <span className="flex-shrink-0">{info.emoji}</span>
                        )}
                        <span className="truncate flex-1">{task.title}</span>
                      </div>
                      <div className="flex items-center gap-0.5 mt-0.5 text-points-gold">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        <span className="font-semibold">{task.points}</span>
                      </div>
                    </motion.button>
                  );
                })}

                {dayTasks.length > 4 && (
                  <div className="text-xs text-center text-muted-foreground font-semibold">
                    +{dayTasks.length - 4} more
                  </div>
                )}

                {dayTasks.length === 0 && (
                  <div className="text-center py-4 text-2xl opacity-30">
                    ☀️
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
