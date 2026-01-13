import { motion } from 'framer-motion';
import { Gift, Star, Lock, ArrowLeft, PiggyBank } from 'lucide-react';
import { useApp } from '@/context/AppContext';

import { Button } from '@/components/ui/button';
import { celebrateBigWin } from '@/lib/confetti';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { familyMembers } from '@/data/familyMembers';

const Rewards = () => {
  const { currentUser, rewards, redeemReward, setCurrentUser, vincentData } = useApp();
  
  const member = familyMembers.find(m => m.id === currentUser);
  const isVincent = currentUser === 'son';
  const bankPoints = isVincent ? vincentData.bankPoints : 0;

  const handleRedeem = (rewardId: string, cost: number, title: string) => {
    if (!currentUser || !isVincent) {
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
    <div className="min-h-screen bg-background">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card shadow-card sticky top-0 z-50 border-b border-border"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Gift className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-display font-bold text-gradient-hero">
                  Rewards Shop
                </h1>
              </div>
            </div>

            {member && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-xl">
                  <PiggyBank className="w-5 h-5 text-amber-500" />
                  <span className="text-xs text-muted-foreground mr-1">Vincent's Bank:</span>
                  <span className="font-bold text-amber-500">{bankPoints} pts</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-xl">
                  <span className="text-xl">{member.emoji}</span>
                  <span className="font-semibold hidden sm:inline">{member.name}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8">
        {!currentUser ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold mb-4">Who's shopping today?</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {familyMembers.map((member) => (
                <Button
                  key={member.id}
                  variant="outline"
                  size="lg"
                  onClick={() => setCurrentUser(member.id)}
                  className="gap-2 text-lg"
                >
                  <span className="text-2xl">{member.emoji}</span>
                  {member.name}
                </Button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rewards.map((reward, index) => {
              const canAfford = isVincent && bankPoints >= reward.pointsCost;
              
              return (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className={cn(
                    "relative rounded-2xl p-6 border-2 transition-all bg-card shadow-card",
                    canAfford 
                      ? "border-transparent hover:border-primary/30" 
                      : "border-transparent opacity-70"
                  )}
                >
                  <div className="text-6xl mb-4 text-center">{reward.emoji}</div>
                  <h3 className="font-bold text-xl mb-2 text-center">{reward.title}</h3>
                  <p className="text-sm text-muted-foreground mb-6 text-center">{reward.description}</p>
                  
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 text-points-gold font-bold text-xl">
                      <Star className="w-5 h-5 fill-current" />
                      <span>{reward.pointsCost} pts</span>
                    </div>
                    
                    <Button
                      size="lg"
                      variant={canAfford ? "gold" : "ghost"}
                      onClick={() => handleRedeem(reward.id, reward.pointsCost, reward.title)}
                      disabled={!canAfford}
                      className="w-full"
                    >
                      {canAfford ? "🎁 Redeem" : <><Lock className="w-4 h-4 mr-2" /> Locked</>}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Rewards;
