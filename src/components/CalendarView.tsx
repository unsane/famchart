import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, CalendarDays, CalendarRange, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { DayView } from './calendar/DayView';
import { WeekView } from './calendar/WeekView';
import { MonthView } from './calendar/MonthView';
import { YearView } from './calendar/YearView';
import { familyMembers } from '@/data/familyMembers';
import { FamilyMember } from '@/types';
import { 
  startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear,
  addDays, addWeeks, addMonths, addYears, format, subDays, subWeeks, subMonths, subYears
} from 'date-fns';
import { cn } from '@/lib/utils';

export type CalendarViewType = 'day' | 'week' | 'month' | 'year';

const viewOptions: { key: CalendarViewType; label: string; icon: React.ReactNode }[] = [
  { key: 'day', label: 'Day', icon: <Calendar className="w-4 h-4" /> },
  { key: 'week', label: 'Week', icon: <CalendarDays className="w-4 h-4" /> },
  { key: 'month', label: 'Month', icon: <CalendarRange className="w-4 h-4" /> },
  { key: 'year', label: 'Year', icon: <TrendingUp className="w-4 h-4" /> },
];

export const CalendarView = () => {
  const [viewType, setViewType] = useState<CalendarViewType>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMembers, setSelectedMembers] = useState<FamilyMember[]>(['mom', 'dad', 'son']);

  const toggleMember = (memberId: FamilyMember) => {
    setSelectedMembers(prev => {
      if (prev.includes(memberId)) {
        // Don't allow deselecting all members
        if (prev.length === 1) return prev;
        return prev.filter(id => id !== memberId);
      }
      return [...prev, memberId];
    });
  };

  const navigatePrev = () => {
    switch (viewType) {
      case 'day':
        setCurrentDate(subDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case 'year':
        setCurrentDate(subYears(currentDate, 1));
        break;
    }
  };

  const navigateNext = () => {
    switch (viewType) {
      case 'day':
        setCurrentDate(addDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case 'year':
        setCurrentDate(addYears(currentDate, 1));
        break;
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDateRangeLabel = () => {
    switch (viewType) {
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'year':
        return format(currentDate, 'yyyy');
    }
  };

  const navigateToDate = (newDate: Date, newView: CalendarViewType) => {
    setCurrentDate(newDate);
    setViewType(newView);
  };

  const renderView = () => {
    switch (viewType) {
      case 'day':
        return <DayView date={currentDate} selectedMembers={selectedMembers} />;
      case 'week':
        return <WeekView date={currentDate} selectedMembers={selectedMembers} onDayClick={(day) => navigateToDate(day, 'day')} />;
      case 'month':
        return <MonthView date={currentDate} selectedMembers={selectedMembers} onDayClick={(day) => navigateToDate(day, 'week')} />;
      case 'year':
        return <YearView date={currentDate} selectedMembers={selectedMembers} onMonthClick={(month) => navigateToDate(month, 'month')} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* View Selector & Family Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex bg-muted rounded-xl p-1">
          {viewOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => setViewType(option.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all",
                viewType === option.key
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.icon}
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Family Member Filter */}
          <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
            <Users className="w-4 h-4 text-muted-foreground ml-2" />
            {familyMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => toggleMember(member.id)}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all",
                  selectedMembers.includes(member.id)
                    ? "bg-card shadow-sm"
                    : "opacity-50 hover:opacity-75"
                )}
                title={member.name}
              >
                <span className="text-lg">{member.emoji}</span>
                <span className="hidden md:inline font-medium">{member.name}</span>
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={goToToday} className="font-bold">
            Today
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between bg-card rounded-2xl p-4 shadow-card">
        <Button variant="ghost" size="icon" onClick={navigatePrev}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <motion.h2 
          key={getDateRangeLabel()}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-display font-bold text-center"
        >
          {getDateRangeLabel()}
        </motion.h2>
        
        <Button variant="ghost" size="icon" onClick={navigateNext}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Calendar Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${viewType}-${currentDate.toISOString()}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
