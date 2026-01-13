import { motion } from 'framer-motion';
import { Star, TrendingUp, Calendar, CalendarDays, CalendarRange } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getPointsForMember } from '@/lib/storage';
import { familyMembers } from '@/data/familyMembers';
import { VincentPointsDisplay } from './VincentPointsDisplay';

type Period = 'day' | 'week' | 'month' | 'year';

export const PointsDisplay = () => {
  const { currentUser, completedTasks } = useApp();
  
  if (!currentUser) return null;

  // Vincent has his own special display
  if (currentUser === 'son') {
    return <VincentPointsDisplay />;
  }

  const member = familyMembers.find(m => m.id === currentUser);
  if (!member) return null;

  const periods: { key: Period; label: string; icon: React.ReactNode }[] = [
    { key: 'day', label: 'Today', icon: <Calendar className="w-4 h-4" /> },
    { key: 'week', label: 'Week', icon: <CalendarDays className="w-4 h-4" /> },
    { key: 'month', label: 'Month', icon: <CalendarRange className="w-4 h-4" /> },
    { key: 'year', label: 'Year', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  const points = periods.map(p => ({
    ...p,
    value: getPointsForMember(completedTasks, currentUser, p.key),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 shadow-card"
    >
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">{member.emoji}</span>
        <div>
          <h2 className="text-xl font-display font-bold">{member.name}'s Points</h2>
          <p className="text-muted-foreground text-sm">Keep going, champion! 🌟</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {points.map((period, index) => (
          <motion.div
            key={period.key}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-muted rounded-xl p-4 text-center"
          >
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-2">
              {period.icon}
              <span className="text-xs font-semibold">{period.label}</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <Star className="w-5 h-5 text-points-gold fill-current" />
              <span className="text-2xl font-display font-bold">{period.value}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
