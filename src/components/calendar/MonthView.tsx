import { motion } from 'framer-motion';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  addDays, isSameMonth, isSameDay, isToday as checkIsToday, getWeek
} from 'date-fns';
import { useApp } from '@/context/AppContext';
import { categoryInfo, familyMembers } from '@/data/familyMembers';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import { FamilyMember } from '@/types';
import { getHolidayForDate, isNonWorkingDay } from '@/data/swedishHolidays';

export interface MonthViewProps {
  date: Date;
  selectedMembers: FamilyMember[];
  onDayClick?: (day: Date) => void;
}

export const MonthView = ({ date, selectedMembers, onDayClick }: MonthViewProps) => {
  const { tasks, completedTasks } = useApp();
  
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  // Build calendar grid
  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getCompletedCountForDay = (day: Date): number => {
    return completedTasks.filter(ct => 
      selectedMembers.includes(ct.completedBy) && 
      isSameDay(new Date(ct.completedAt), day)
    ).length;
  };

  const getPointsForDay = (day: Date): number => {
    return completedTasks
      .filter(ct => 
        selectedMembers.includes(ct.completedBy) && 
        isSameDay(new Date(ct.completedAt), day)
      )
      .reduce((sum, ct) => sum + ct.pointsEarned, 0);
  };

  const getTasksForDay = (day: Date) => {
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
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Group days into weeks for week number display
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      {/* Week day headers with week number column */}
      <div className="grid grid-cols-8 gap-1 mb-2">
        <div className="text-center text-xs font-bold text-muted-foreground py-2">Wk</div>
        {weekDays.map((dayName) => (
          <div key={dayName} className="text-center text-xs font-bold text-muted-foreground py-2">
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar grid with week numbers */}
      <div className="space-y-1">
        {weeks.map((week, weekIndex) => {
          const weekNumber = getWeek(week[0] || new Date());
          return (
            <div key={weekIndex} className="grid grid-cols-8 gap-1">
              {/* Week number */}
              <div className="flex items-center justify-center text-xs font-bold text-muted-foreground bg-muted/30 rounded-lg">
                {weekNumber}
              </div>
              {week.map((day, dayIndex) => {
                const isCurrentMonth = isSameMonth(day, date);
                const isToday = checkIsToday(day);
                const completedCount = getCompletedCountForDay(day);
                const points = getPointsForDay(day);
                const dayTasks = getTasksForDay(day);
                const holiday = getHolidayForDate(day);
                const isNonWorking = isNonWorkingDay(day);
                
                return (
                  <motion.div
                    key={day.toISOString()}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (weekIndex * 7 + dayIndex) * 0.01 }}
                    onClick={() => isCurrentMonth && onDayClick?.(day)}
                    title={holiday ? `${holiday.name} (${holiday.nameEn})` : undefined}
                    className={cn(
                      "aspect-square p-1 rounded-xl transition-all relative",
                      isCurrentMonth 
                        ? isNonWorking 
                          ? "bg-rose-100/50 dark:bg-rose-950/30 cursor-pointer hover:ring-2 hover:ring-rose-400/50" 
                          : "bg-muted/50 cursor-pointer hover:ring-2 hover:ring-primary/50" 
                        : "bg-muted/20",
                      isToday && "ring-2 ring-primary bg-primary/10"
                    )}
                  >
                    <div className={cn(
                      "text-sm font-bold text-center",
                      !isCurrentMonth && "text-muted-foreground/50",
                      isToday && "text-primary",
                      isCurrentMonth && isNonWorking && !isToday && "text-rose-600 dark:text-rose-400"
                    )}>
                      {format(day, 'd')}
                    </div>
                    {holiday && isCurrentMonth && (
                      <div className="absolute top-0.5 left-0.5 text-[8px]">🎉</div>
                    )}

                    {/* Task indicators */}
                    {isCurrentMonth && dayTasks.length > 0 && (
                      <div className="flex justify-center gap-0.5 mt-0.5 flex-wrap">
                        {dayTasks.slice(0, 3).map((task) => (
                          <div 
                            key={task.id}
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              categoryInfo[task.category].color
                            )}
                          />
                        ))}
                        {dayTasks.length > 3 && (
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                        )}
                      </div>
                    )}

                    {/* Points earned indicator */}
                    {points > 0 && (
                      <div className="absolute bottom-0.5 right-0.5 flex items-center">
                        <Star className="w-2.5 h-2.5 text-points-gold fill-current" />
                        <span className="text-[10px] font-bold text-points-gold">{points}</span>
                      </div>
                    )}

                    {/* Completion badge */}
                    {completedCount > 0 && (
                      <div className="absolute top-0.5 right-0.5 bg-success text-primary-foreground text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                        {completedCount}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-muted justify-center">
        {Object.entries(categoryInfo).map(([key, info]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs">
            <div className={cn("w-2.5 h-2.5 rounded-full", info.color)} />
            <span className="text-muted-foreground">{info.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
