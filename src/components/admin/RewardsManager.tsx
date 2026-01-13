import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, X, Gift } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const EMOJI_OPTIONS = ['🎮', '🍦', '🎬', '🌙', '🎢', '🎉', '🍕', '📱', '🛒', '⭐', '🎁', '🏆'];

export const RewardsManager = () => {
  const { rewards, addReward, deleteReward } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [newReward, setNewReward] = useState({
    title: '',
    description: '',
    pointsCost: 10,
    emoji: '🎁',
  });

  const handleAdd = () => {
    if (!newReward.title.trim()) return;
    addReward(newReward);
    setNewReward({ title: '', description: '', pointsCost: 10, emoji: '🎁' });
    setIsAdding(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-2xl p-6 shadow-card"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-display font-bold">Rewards Shop</h2>
        </div>
        <Button variant="hero" size="sm" onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4" />
          Add Reward
        </Button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-muted rounded-xl space-y-4"
          >
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-semibold">Emoji:</span>
              {EMOJI_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setNewReward(prev => ({ ...prev, emoji }))}
                  className={`text-2xl p-1 rounded-lg transition-all ${
                    newReward.emoji === emoji ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-muted'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <Input
              placeholder="Reward name..."
              value={newReward.title}
              onChange={e => setNewReward(prev => ({ ...prev, title: e.target.value }))}
            />

            <Textarea
              placeholder="Description..."
              value={newReward.description}
              onChange={e => setNewReward(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
            />

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Cost:</span>
              <Input
                type="number"
                min={1}
                max={1000}
                value={newReward.pointsCost}
                onChange={e => setNewReward(prev => ({ ...prev, pointsCost: parseInt(e.target.value) || 1 }))}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">points</span>
            </div>

            <div className="flex gap-2">
              <Button variant="success" onClick={handleAdd}>
                <Save className="w-4 h-4" />
                Save
              </Button>
              <Button variant="ghost" onClick={() => setIsAdding(false)}>
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid sm:grid-cols-2 gap-3">
        {rewards.map(reward => (
          <motion.div
            key={reward.id}
            layout
            className="flex items-start gap-3 p-4 bg-muted rounded-xl"
          >
            <span className="text-3xl">{reward.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold">{reward.title}</p>
              <p className="text-sm text-muted-foreground truncate">{reward.description}</p>
              <p className="text-sm font-semibold text-points-gold mt-1">
                ⭐ {reward.pointsCost} points
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteReward(reward.id)}
              className="text-destructive hover:text-destructive flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
