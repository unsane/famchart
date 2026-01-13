import { motion } from 'framer-motion';
import { format, isSameDay, getWeek } from 'date-fns';
import { useApp } from '@/context/AppContext';
import { categoryInfo, familyMembers } from '@/data/familyMembers';
import { TaskCategory, FamilyMember, Task } from '@/types';
import { cn } from '@/lib/utils';
import { Check, Star, Pencil } from 'lucide-react';

import { celebrateTaskComplete } from '@/lib/confetti';
import { EventDialog } from './EventDialog';
import { getHolidayForDate, isNonWorkingDay } from '@/data/swedishHolidays';

export interface DayViewProps {
  date: Date;
  selectedMembers: FamilyMember[];
}

const HOURS = Array.from({ length: 24 }, (_, i) => i); // 12 AM to 11 PM

export const DayView = ({ date, selectedMembers }: DayViewProps) => {
  const { tasks, completedTasks, completeTask, uncompleteTask, currentUser } = useApp();
  const isToday = isSameDay(date, new Date());
  const holiday = getHolidayForDate(date);
  const isNonWorking = isNonWorkingDay(date);

  // Filter tasks for this day - show tasks for selected members
  const dayOfWeek = date.getDay();
  
  const dayTasks = tasks.filter(task => {
    const hasSelectedMember = task.assignedTo.some(member => selectedMembers.includes(member));
    if (!hasSelectedMember) return false;
    
    if (task.recurring === 'daily') return true;
    if (task.recurring === 'weekly') {
      return dayOfWeek === 0;
    }
    if (task.recurring === 'once' && task.dueDate) {
      return isSameDay(new Date(task.dueDate), date);
    }
    return false;
  });

  // Separate timed and untimed tasks
  const timedTasks = dayTasks.filter(t => t.startTime);
  const untimedTasks = dayTasks.filter(t => !t.startTime);

  // Get completed tasks for this day by selected members
  const completedToday = completedTasks.filter(ct => 
    isSameDay(new Date(ct.completedAt), date) && 
    selectedMembers.includes(ct.completedBy)
  );

  const totalPointsEarned = completedToday.reduce((sum, ct) => sum + ct.pointsEarned, 0);

  const isTaskCompletedByUser = (taskId: string): boolean => {
    if (!currentUser) return false;
    const today = new Date();
    return completedTasks.some(ct => 
      ct.taskId === taskId && 
      isSameDay(new Date(ct.completedAt), today) &&
      ct.completedBy === currentUser
    );
  };

  const isTaskCompletedByAny = (taskId: string): boolean => {
    return completedTasks.some(ct => 
      ct.taskId === taskId && 
      isSameDay(new Date(ct.completedAt), date) &&
      selectedMembers.includes(ct.completedBy)
    );
  };

  const handleToggleTask = (task: Task) => {
    if (!currentUser) return;
    if (isTaskCompletedByUser(task.id)) {
      uncompleteTask(task.id, currentUser);
    } else {
      completeTask(task.id, currentUser);
      celebrateTaskComplete();
    }
  };

  const getTaskPosition = (task: Task) => {
    if (!task.startTime) return null;
    const [hours, minutes] = task.startTime.split(':').map(Number);
    const startHour = hours + minutes / 60;
    const top = startHour * 60; // 60px per hour, starting from midnight
    
    let height = 60; // default 1 hour
    if (task.endTime) {
      const [endH, endM] = task.endTime.split(':').map(Number);
      const endHour = endH + endM / 60;
      height = (endHour - startHour) * 60;
    }
    
    return { top, height: Math.max(height, 30) };
  };

  // Group untimed tasks by category
  const groupedUntimedTasks = untimedTasks.reduce((acc, task) => {
    if (!acc[task.category]) acc[task.category] = [];
    acc[task.category].push(task);
    return acc;
  }, {} as Record<TaskCategory, Task[]>);

  return (
    <div className="space-y-4">
      {/* Day Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "rounded-2xl p-4 flex items-center justify-between",
          isNonWorking 
            ? "bg-gradient-to-br from-rose-100/50 to-rose-200/30 dark:from-rose-950/30 dark:to-rose-900/20" 
            : "bg-gradient-to-br from-primary/10 to-accent/10"
        )}
      >
        <div className="flex items-center gap-4">
          <div className="text-4xl">
            {holiday ? '🎉' : isToday ? '🌟' : isNonWorking ? '☀️' : '📅'}
          </div>
          <div>
            <h2 className="text-xl font-display font-bold">
              {holiday ? holiday.name : isToday ? "Today's Quest!" : format(date, 'EEEE')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {format(date, 'MMMM d, yyyy')} · <span className="font-semibold">Week {getWeek(date)}</span>
              {holiday && <span className="ml-2 text-rose-600 dark:text-rose-400">• {holiday.nameEn}</span>}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {totalPointsEarned > 0 && (
            <div className="flex items-center gap-1 bg-gradient-gold px-3 py-1.5 rounded-full">
              <Star className="w-4 h-4 fill-current text-accent-foreground" />
              <span className="font-bold text-accent-foreground text-sm">
                {totalPointsEarned} pts
              </span>
            </div>
          )}
          <EventDialog date={date} />
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Timeline View */}
        <div className="lg:col-span-2 bg-card rounded-2xl shadow-card overflow-hidden">
          <div className="p-3 border-b border-muted font-display font-bold text-sm">
            📆 Schedule
          </div>
          <div className="relative" style={{ height: `${HOURS.length * 60}px` }}>
            {/* Hour lines */}
            {HOURS.map((hour, index) => (
              <div
                key={hour}
                className="absolute left-0 right-0 border-t border-muted/50 flex"
                style={{ top: `${index * 60}px` }}
              >
                <div className="w-16 px-2 py-1 text-xs text-muted-foreground font-medium bg-muted/30">
                  {format(new Date().setHours(hour, 0), 'h a')}
                </div>
                <div className="flex-1" />
              </div>
            ))}

            {/* Timed tasks */}
            <div className="absolute left-16 right-2 top-0 bottom-0">
              {timedTasks.map((task) => {
                const pos = getTaskPosition(task);
                if (!pos) return null;
                
                const completed = isTaskCompletedByAny(task.id);
                const info = categoryInfo[task.category];
                const assignedMembers = familyMembers.filter(m => task.assignedTo.includes(m.id));
                const canInteract = isToday && currentUser && task.assignedTo.includes(currentUser);
                
                return (
                  <div
                    key={task.id}
                    className={cn(
                      "absolute left-0 right-0 rounded-lg p-2 transition-all overflow-hidden group",
                      completed
                        ? "bg-success/20 border border-success/30"
                        : `${info.color} border border-transparent`
                    )}
                    style={{ top: `${pos.top}px`, height: `${pos.height}px` }}
                  >
                    <div className="flex items-start gap-2 h-full">
                      <button
                        onClick={() => canInteract && handleToggleTask(task)}
                        disabled={!canInteract}
                        className={cn(
                          "flex-shrink-0 mt-0.5",
                          canInteract && "hover:scale-110 transition-transform cursor-pointer"
                        )}
                      >
                        {completed ? (
                          <Check className="w-4 h-4 text-success" />
                        ) : (
                          <span className="text-sm">{info.emoji}</span>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          "font-semibold text-sm truncate",
                          completed && "line-through text-muted-foreground"
                        )}>
                          {task.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {task.startTime} - {task.endTime || '?'}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {assignedMembers.map(m => (
                          <span key={m.id} className="text-sm" title={m.name}>{m.emoji}</span>
                        ))}
                        <EventDialog 
                          date={date} 
                          editTask={task}
                          trigger={
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-background/50 rounded">
                              <Pencil className="w-3 h-3 text-muted-foreground" />
                            </button>
                          }
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Current time indicator */}
            {isToday && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute left-0 right-0 flex items-center z-10"
                style={{
                  top: `${(new Date().getHours() + new Date().getMinutes() / 60) * 60}px`,
                }}
              >
                <div className="w-2 h-2 rounded-full bg-destructive" />
                <div className="flex-1 h-0.5 bg-destructive" />
              </motion.div>
            )}
          </div>
        </div>

        {/* Untimed Tasks */}
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          <div className="p-3 border-b border-muted font-display font-bold text-sm">
            📋 Tasks
          </div>
          <div className="p-3 space-y-4 max-h-[600px] overflow-y-auto">
            {Object.entries(groupedUntimedTasks).map(([cat, catTasks]) => {
              const info = categoryInfo[cat as TaskCategory];
              return (
                <div key={cat}>
                  <div className="flex items-center gap-1.5 mb-2 text-sm font-semibold">
                    <span>{info.emoji}</span>
                    <span>{info.label}</span>
                  </div>
                  <div className="space-y-2">
                    {catTasks.map((task) => {
                      const completed = isTaskCompletedByAny(task.id);
                      const canInteract = isToday && currentUser && task.assignedTo.includes(currentUser);
                      const assignedMembers = familyMembers.filter(m => task.assignedTo.includes(m.id));
                      
                      return (
                        <div
                          key={task.id}
                          className={cn(
                            "w-full text-left p-3 rounded-xl transition-all group",
                            completed
                              ? "bg-success/20 border border-success/30"
                              : "bg-muted hover:bg-muted/80"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => canInteract && handleToggleTask(task)}
                              disabled={!canInteract}
                              className={cn(canInteract && "cursor-pointer hover:scale-110 transition-transform")}
                            >
                              {completed ? (
                                <Check className="w-4 h-4 text-success" />
                              ) : (
                                <div className="w-4 h-4 rounded border-2 border-muted-foreground/30" />
                              )}
                            </button>
                            <span className={cn(
                              "flex-1 font-medium text-sm",
                              completed && "line-through text-muted-foreground"
                            )}>
                              {task.title}
                            </span>
                            <div className="flex items-center gap-1">
                              {assignedMembers.map(m => (
                                <span key={m.id} className="text-sm">{m.emoji}</span>
                              ))}
                              <EventDialog 
                                date={date} 
                                editTask={task}
                                trigger={
                                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-background/50 rounded">
                                    <Pencil className="w-3 h-3 text-muted-foreground" />
                                  </button>
                                }
                              />
                            </div>
                          </div>
                          {task.points > 0 && (
                            <div className="flex items-center gap-1 mt-1 ml-6">
                              <Star className="w-3 h-3 text-points-gold fill-current" />
                              <span className="text-xs font-semibold text-points-gold">{task.points} pts</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {untimedTasks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <span className="text-3xl block mb-2">✨</span>
                <p className="text-sm">No tasks without a time</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
