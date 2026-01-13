import { motion } from 'framer-motion';
import { Gift, Star, Lock, PiggyBank } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { celebrateBigWin } from '@/lib/confetti';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const RewardsSection = () => {
  const { currentUser, rewards, redeemReward, vincentData } = useApp();
  
  if (!currentUser) return null;

  // Only Vincent uses bank points for rewards
  const isVincent = currentUser === 'son';
  const bankPoints = isVincent ? vincentData.bankPoints : 0;

  const handleRedeem = (rewardId: string, cost: number, title: string) => {
    if (!isVincent) {
      toast.error("Only Vincent can redeem rewards!");
      return;
    }
    
    if (bankPoints < cost) {
      toast.error("Not enough bank points! Save more to the bank first! 🐷");
      return;
    }
    
    const success = redeemReward(rewardId, currentUser);
    if (success) {
      celebrateBigWin();
      toast.success(`🎉 You redeemed: ${title}!`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 shadow-card"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Gift className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-display font-bold">Rewards Shop</h2>
        </div>
        {isVincent && (
          <div className="flex items-center gap-2 bg-amber-500/15 rounded-lg px-3 py-1.5 border border-amber-500/30">
            <PiggyBank className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-amber-500">{bankPoints} pts</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward, index) => {
          const canAfford = isVincent && bankPoints >= reward.pointsCost;
          
          return (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative rounded-xl p-4 border-2 transition-all",
                canAfford 
                  ? "bg-muted border-transparent hover:border-primary/30" 
                  : "bg-muted/50 border-transparent opacity-70"
              )}
            >
              <div className="text-4xl mb-3">{reward.emoji}</div>
              <h3 className="font-bold text-lg mb-1">{reward.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-points-gold font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{reward.pointsCost}</span>
                </div>
                
                <Button
                  size="sm"
                  variant={canAfford ? "gold" : "ghost"}
                  onClick={() => handleRedeem(reward.id, reward.pointsCost, reward.title)}
                  disabled={!canAfford}
                >
                  {canAfford ? "Redeem" : <Lock className="w-4 h-4" />}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
