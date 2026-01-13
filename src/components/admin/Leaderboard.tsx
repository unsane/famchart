import { motion } from 'framer-motion';
import { Trophy, Medal } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { familyMembers } from '@/data/familyMembers';
import { getPointsForMember } from '@/lib/storage';

export const Leaderboard = () => {
  const { completedTasks } = useApp();

  const rankings = familyMembers
    .map(member => ({
      ...member,
      points: getPointsForMember(completedTasks, member.id, 'all'),
      weekPoints: getPointsForMember(completedTasks, member.id, 'week'),
      monthPoints: getPointsForMember(completedTasks, member.id, 'month'),
    }))
    .sort((a, b) => b.points - a.points);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card rounded-2xl p-6 shadow-card"
    >
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-points-gold" />
        <h2 className="text-xl font-display font-bold">Leaderboard</h2>
      </div>

      <div className="space-y-4">
        {rankings.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 p-4 bg-muted rounded-xl"
          >
            <span className="text-3xl">{medals[index] || '⭐'}</span>
            <span className="text-4xl">{member.emoji}</span>
            
            <div className="flex-1">
              <p className="font-bold text-lg">{member.name}</p>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Week: {member.weekPoints}</span>
                <span>Month: {member.monthPoints}</span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-2xl font-display font-bold text-points-gold">
                {member.points}
              </p>
              <p className="text-xs text-muted-foreground">total pts</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
