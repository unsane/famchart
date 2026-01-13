import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, PiggyBank, Target, TrendingUp, Calendar, CalendarDays, CalendarRange, Plus, Minus } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getPointsForMember } from '@/lib/storage';
import { familyMembers } from '@/data/familyMembers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { celebrateBigWin } from '@/lib/confetti';

type Period = 'day' | 'week' | 'month' | 'year';

export const VincentPointsDisplay = () => {
  const { currentUser, completedTasks, vincentData, depositToBank, withdrawFromBank } = useApp();
  const [bankAmount, setBankAmount] = useState('');
  const [showBankControls, setShowBankControls] = useState(false);
  
  if (currentUser !== 'son') return null;

  const member = familyMembers.find(m => m.id === 'son');
  if (!member) return null;

  const periods: { key: Period; label: string; icon: React.ReactNode }[] = [
    { key: 'day', label: 'Today', icon: <Calendar className="w-4 h-4" /> },
    { key: 'week', label: 'Week', icon: <CalendarDays className="w-4 h-4" /> },
    { key: 'month', label: 'Month', icon: <CalendarRange className="w-4 h-4" /> },
    { key: 'year', label: 'Year', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  const points = periods.map(p => ({
    ...p,
    value: getPointsForMember(completedTasks, 'son', p.key),
  }));

  const availablePoints = getPointsForMember(completedTasks, 'son', 'all');
  const spendablePoints = availablePoints + vincentData.bankPoints;

  const handleDeposit = () => {
    const amount = parseInt(bankAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid amount!');
      return;
    }
    if (amount > availablePoints) {
      toast.error('Not enough points to deposit!');
      return;
    }
    depositToBank(amount);
    setBankAmount('');
    toast.success(`💰 Deposited ${amount} points to your bank!`);
  };

  const handleWithdraw = () => {
    const amount = parseInt(bankAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid amount!');
      return;
    }
    if (!withdrawFromBank(amount)) {
      toast.error('Not enough points in bank!');
      return;
    }
    setBankAmount('');
    toast.success(`💸 Withdrew ${amount} points from your bank!`);
  };

  const goalProgress = vincentData.bigGoal 
    ? Math.min((vincentData.lifetimePoints / vincentData.bigGoal.targetPoints) * 100, 100)
    : 0;

  const goalReached = vincentData.bigGoal && vincentData.lifetimePoints >= vincentData.bigGoal.targetPoints;

  if (goalReached) {
    celebrateBigWin();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 shadow-card"
    >
      {/* Header with Name, Bank, and Big Goal */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-4xl">{member.emoji}</span>
          <div>
            <h2 className="text-xl font-display font-bold">{member.name}'s Points</h2>
            <p className="text-muted-foreground text-sm">Keep going, champion! 🌟</p>
          </div>
        </div>

        {/* Compact Bank */}
        <div className="flex items-center gap-2 bg-amber-500/15 rounded-lg px-3 py-2 border border-amber-500/30">
          <PiggyBank className="w-4 h-4 text-amber-500" />
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground leading-tight">Vincent's Bank</p>
            <div className="flex items-center gap-1 text-sm font-display font-bold text-amber-500">
              <Star className="w-3 h-3 fill-current" />
              {vincentData.bankPoints}
            </div>
          </div>
        </div>

        {/* Compact Big Goal */}
        {vincentData.bigGoal && (
          <div className="flex items-center gap-2 bg-purple-500/15 rounded-lg px-3 py-2 border border-purple-500/30">
            <Target className="w-4 h-4 text-purple-500" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground leading-tight">{vincentData.bigGoal.title}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${goalProgress}%` }}
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  />
                </div>
                <span className="text-xs font-bold text-purple-500">
                  {goalReached ? '🎉' : `${Math.round(goalProgress)}%`}
                </span>
              </div>
            </div>
            <span className="text-lg">{vincentData.bigGoal.emoji}</span>
          </div>
        )}
      </div>

      {/* Points Grid */}
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