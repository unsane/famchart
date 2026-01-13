import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, PiggyBank, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BigGoal } from '@/types';
import { toast } from 'sonner';

export const VincentManager = () => {
  const { vincentData, setBigGoal, depositToBank, withdrawFromBank, adjustLifetimePoints } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [bankAdjust, setBankAdjust] = useState('');
  const [lifetimeAdjust, setLifetimeAdjust] = useState('');
  const [goalForm, setGoalForm] = useState<Omit<BigGoal, 'id'>>({
    title: vincentData.bigGoal?.title || '',
    description: vincentData.bigGoal?.description || '',
    targetPoints: vincentData.bigGoal?.targetPoints || 100,
    emoji: vincentData.bigGoal?.emoji || '🎯',
  });

  const handleSaveGoal = () => {
    if (!goalForm.title.trim()) {
      toast.error('Goal title is required!');
      return;
    }
    if (goalForm.targetPoints <= 0) {
      toast.error('Target points must be positive!');
      return;
    }

    const newGoal: BigGoal = {
      id: vincentData.bigGoal?.id || Date.now().toString(),
      ...goalForm,
    };

    setBigGoal(newGoal);
    setIsEditing(false);
    toast.success('Big Goal updated! 🎯');
  };

  const handleDeleteGoal = () => {
    setBigGoal(null);
    toast.success('Goal removed');
  };

  const handleBankAdjust = (isDeposit: boolean) => {
    const amount = parseInt(bankAdjust);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid amount!');
      return;
    }

    if (isDeposit) {
      depositToBank(amount);
      toast.success(`Added ${amount} points to Vincent's bank`);
    } else {
      if (!withdrawFromBank(amount)) {
        toast.error('Not enough points in bank!');
        return;
      }
      toast.success(`Removed ${amount} points from Vincent's bank`);
    }
    setBankAdjust('');
  };

  const handleLifetimeAdjust = (isAdd: boolean) => {
    const amount = parseInt(lifetimeAdjust);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid amount!');
      return;
    }

    if (isAdd) {
      adjustLifetimePoints(amount);
      toast.success(`Added ${amount} lifetime points`);
    } else {
      adjustLifetimePoints(-amount);
      toast.success(`Removed ${amount} lifetime points`);
    }
    setLifetimeAdjust('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Vincent Stats */}
      <div className="bg-card rounded-2xl p-6 shadow-card">
        <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
          🧒 Vincent's Stats
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-amber-500/10 rounded-xl p-4 text-center">
            <PiggyBank className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-amber-500">{vincentData.bankPoints}</p>
            <p className="text-sm text-muted-foreground">Bank Points</p>
          </div>
          <div className="bg-purple-500/10 rounded-xl p-4 text-center">
            <Target className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-500">{vincentData.lifetimePoints}</p>
            <p className="text-sm text-muted-foreground">Lifetime Points</p>
          </div>
        </div>

        {/* Admin Bank Controls */}
        <div className="border-t pt-4 space-y-4">
          <div>
            <Label className="mb-2 block">Adjust Bank (Admin)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Amount"
                value={bankAdjust}
                onChange={(e) => setBankAdjust(e.target.value)}
                className="flex-1"
              />
              <Button onClick={() => handleBankAdjust(true)} size="sm" className="bg-green-500 hover:bg-green-600">
                <Plus className="w-4 h-4" />
              </Button>
              <Button onClick={() => handleBankAdjust(false)} size="sm" variant="destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Adjust Lifetime Points (Admin)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Amount"
                value={lifetimeAdjust}
                onChange={(e) => setLifetimeAdjust(e.target.value)}
                className="flex-1"
              />
              <Button onClick={() => handleLifetimeAdjust(true)} size="sm" className="bg-purple-500 hover:bg-purple-600">
                <Plus className="w-4 h-4" />
              </Button>
              <Button onClick={() => handleLifetimeAdjust(false)} size="sm" variant="destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Big Goal Manager */}
      <div className="bg-card rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg flex items-center gap-2">
            🎯 Big Goal
          </h3>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditing(true);
                if (vincentData.bigGoal) {
                  setGoalForm({
                    title: vincentData.bigGoal.title,
                    description: vincentData.bigGoal.description,
                    targetPoints: vincentData.bigGoal.targetPoints,
                    emoji: vincentData.bigGoal.emoji,
                  });
                }
              }}
            >
              {vincentData.bigGoal ? (
                <>
                  <Edit2 className="w-4 h-4 mr-1" /> Edit
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" /> Create Goal
                </>
              )}
            </Button>
          )}
        </div>

        {isEditing ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3">
                <Label>Title</Label>
                <Input
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                  placeholder="e.g., Nintendo Switch Game"
                />
              </div>
              <div>
                <Label>Emoji</Label>
                <Input
                  value={goalForm.emoji}
                  onChange={(e) => setGoalForm({ ...goalForm, emoji: e.target.value })}
                  placeholder="🎮"
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={goalForm.description}
                onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                placeholder="What is this goal about?"
              />
            </div>

            <div>
              <Label>Target Points</Label>
              <Input
                type="number"
                value={goalForm.targetPoints}
                onChange={(e) => setGoalForm({ ...goalForm, targetPoints: parseInt(e.target.value) || 0 })}
                placeholder="500"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveGoal} className="flex-1 gap-1">
                <Save className="w-4 h-4" /> Save Goal
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)} className="gap-1">
                <X className="w-4 h-4" /> Cancel
              </Button>
            </div>
          </motion.div>
        ) : vincentData.bigGoal ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
              <span className="text-4xl">{vincentData.bigGoal.emoji}</span>
              <div className="flex-1">
                <h4 className="font-bold">{vincentData.bigGoal.title}</h4>
                <p className="text-sm text-muted-foreground">{vincentData.bigGoal.description}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-purple-500">{vincentData.bigGoal.targetPoints}</p>
                <p className="text-xs text-muted-foreground">Target Points</p>
              </div>
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress: {vincentData.lifetimePoints} / {vincentData.bigGoal.targetPoints}</span>
                <span>{Math.round((vincentData.lifetimePoints / vincentData.bigGoal.targetPoints) * 100)}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                  style={{ width: `${Math.min((vincentData.lifetimePoints / vincentData.bigGoal.targetPoints) * 100, 100)}%` }}
                />
              </div>
            </div>

            <Button variant="destructive" size="sm" onClick={handleDeleteGoal} className="gap-1">
              <Trash2 className="w-4 h-4" /> Remove Goal
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-6">
            No big goal set yet. Create one to motivate Vincent! 🌟
          </p>
        )}
      </div>
    </motion.div>
  );
};