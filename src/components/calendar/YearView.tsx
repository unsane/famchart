import { motion } from 'framer-motion';
import { format, startOfYear, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getWeek } from 'date-fns';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { Star, TrendingUp } from 'lucide-react';
import { FamilyMember } from '@/types';
import { isNonWorkingDay, getHolidayForDate } from '@/data/swedishHolidays';

export interface YearViewProps {
  date: Date;
  selectedMembers: FamilyMember[];
  onMonthClick?: (month: Date) => void;
}

export const YearView = ({ date, selectedMembers, onMonthClick }: YearViewProps) => {
  const { completedTasks } = useApp();
  
  const yearStart = startOfYear(date);
  const months = Array.from({ length: 12 }, (_, i) => addMonths(yearStart, i));

  const getMonthStats = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    let totalPoints = 0;
    let tasksCompleted = 0;

    completedTasks.forEach(ct => {
      if (!selectedMembers.includes(ct.completedBy)) return;
      const completedDate = new Date(ct.completedAt);
      if (completedDate >= monthStart && completedDate <= monthEnd) {
        totalPoints += ct.pointsEarned;
        tasksCompleted++;
      }
    });

    // Get daily activity
    const activityMap = new Map<string, number>();
    days.forEach(day => {
      const dayStr = day.toISOString().split('T')[0];
      activityMap.set(dayStr, 0);
    });
    
    completedTasks.forEach(ct => {
      if (!selectedMembers.includes(ct.completedBy)) return;
      const completedDate = new Date(ct.completedAt);
      const dayStr = completedDate.toISOString().split('T')[0];
      if (activityMap.has(dayStr)) {
        activityMap.set(dayStr, (activityMap.get(dayStr) || 0) + ct.pointsEarned);
      }
    });

    return { totalPoints, tasksCompleted, days, activityMap };
  };

  // Calculate year totals
  const yearTotals = months.reduce((acc, month) => {
    const stats = getMonthStats(month);
    return {
      points: acc.points + stats.totalPoints,
      tasks: acc.tasks + stats.tasksCompleted
    };
  }, { points: 0, tasks: 0 });

  const getActivityColor = (points: number, day: Date): string => {
    const isNonWorking = isNonWorkingDay(day);
    if (points === 0) return isNonWorking ? 'bg-rose-200/50 dark:bg-rose-900/30' : 'bg-muted/30';
    if (points <= 3) return 'bg-success/30';
    if (points <= 6) return 'bg-success/50';
    if (points <= 10) return 'bg-success/70';
    return 'bg-success';
  };

  return (
    <div className="space-y-6">
      {/* Year Summary */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary/10 via-accent/10 to-success/10 rounded-2xl p-6"
      >
        <div className="flex items-center justify-center gap-8 flex-wrap">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-3xl font-display font-bold">
              <Star className="w-8 h-8 text-points-gold fill-current" />
              {yearTotals.points}
            </div>
            <p className="text-muted-foreground text-sm">Total Points</p>
          </div>
          
          <div className="w-px h-12 bg-muted hidden sm:block" />
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-3xl font-display font-bold">
              <TrendingUp className="w-8 h-8 text-success" />
              {yearTotals.tasks}
            </div>
            <p className="text-muted-foreground text-sm">Tasks Completed</p>
          </div>
        </div>
      </motion.div>

      {/* Month Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {months.map((month, monthIndex) => {
          const stats = getMonthStats(month);
          const weeks: Date[][] = [];
          let currentWeek: Date[] = [];
          
          // Pad start of month
          const firstDayOfWeek = stats.days[0].getDay();
          for (let i = 0; i < firstDayOfWeek; i++) {
            currentWeek.push(null as any);
          }
          
          stats.days.forEach(day => {
            currentWeek.push(day);
            if (currentWeek.length === 7) {
              weeks.push(currentWeek);
              currentWeek = [];
            }
          });
          
          // Pad end of month
          while (currentWeek.length > 0 && currentWeek.length < 7) {
            currentWeek.push(null as any);
          }
          if (currentWeek.length > 0) weeks.push(currentWeek);

          return (
            <motion.div
              key={month.toISOString()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: monthIndex * 0.05 }}
              onClick={() => onMonthClick?.(month)}
              className="bg-card rounded-xl p-3 shadow-card cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-bold">{format(month, 'MMMM')}</h3>
                {stats.totalPoints > 0 && (
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="w-3 h-3 text-points-gold fill-current" />
                    <span className="font-bold">{stats.totalPoints}</span>
                  </div>
                )}
              </div>

              {/* Mini calendar with week numbers */}
              <div className="space-y-0.5">
                {weeks.map((week, weekIndex) => {
                  const weekNumber = getWeek(week.find(d => d) || new Date());
                  return (
                    <div key={weekIndex} className="flex gap-0.5 items-center">
                      <div className="w-4 text-[8px] text-muted-foreground font-medium text-right pr-0.5">
                        {weekNumber}
                      </div>
                      {week.map((day, dayIndex) => {
                        if (!day) {
                          return <div key={dayIndex} className="w-3 h-3" />;
                        }
                        
                        const dayStr = day.toISOString().split('T')[0];
                        const points = stats.activityMap.get(dayStr) || 0;
                        const holiday = getHolidayForDate(day);
                        
                        return (
                          <div
                            key={dayIndex}
                            title={holiday ? `${format(day, 'MMM d')}: ${holiday.name} - ${points} pts` : `${format(day, 'MMM d')}: ${points} pts`}
                            className={cn(
                              "w-3 h-3 rounded-sm transition-colors",
                              getActivityColor(points, day)
                            )}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Activity Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground flex-wrap">
        <div className="flex items-center gap-2">
          <span>Less</span>
          <div className="flex gap-0.5">
            <div className="w-3 h-3 rounded-sm bg-muted/30" />
            <div className="w-3 h-3 rounded-sm bg-success/30" />
            <div className="w-3 h-3 rounded-sm bg-success/50" />
            <div className="w-3 h-3 rounded-sm bg-success/70" />
            <div className="w-3 h-3 rounded-sm bg-success" />
          </div>
          <span>More</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-rose-200/50 dark:bg-rose-900/30" />
          <span>Weekend/Holiday</span>
        </div>
      </div>
    </div>
  );
};
