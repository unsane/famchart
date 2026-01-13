import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { Task } from '@/types';
import { categoryInfo } from '@/data/familyMembers';
import { useApp } from '@/context/AppContext';
import { isTaskCompletedToday } from '@/lib/storage';
import { celebrateTaskComplete } from '@/lib/confetti';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
}

export const TaskCard = ({ task }: TaskCardProps) => {
  const { currentUser, completedTasks, completeTask, uncompleteTask } = useApp();
  const category = categoryInfo[task.category];
  
  const isCompleted = currentUser 
    ? isTaskCompletedToday(completedTasks, task.id, currentUser)
    : false;

  const handleToggle = () => {
    if (!currentUser) return;
    if (isCompleted) {
      uncompleteTask(task.id, currentUser);
    } else {
      completeTask(task.id, currentUser);
      celebrateTaskComplete();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      className={cn(
        "relative bg-card rounded-2xl p-4 shadow-card border-2 transition-all duration-300",
        isCompleted 
          ? "border-success/50 bg-success/5" 
          : "border-transparent hover:border-primary/20"
      )}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={handleToggle}
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
            isCompleted
              ? "bg-success text-primary-foreground"
              : "bg-muted hover:bg-primary hover:text-primary-foreground"
          )}
        >
          {isCompleted ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              <Check className="w-5 h-5" />
            </motion.div>
          ) : (
            <div className="w-5 h-5 rounded-md border-2 border-current" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-semibold",
              category.color, "text-foreground"
            )}>
              {category.emoji} {category.label}
            </span>
          </div>
          
          <h3 className={cn(
            "font-bold text-lg transition-all",
            isCompleted && "line-through text-muted-foreground"
          )}>
            {task.title}
          </h3>
        </div>

        <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-gold rounded-xl shadow-glow/30">
          <Star className="w-4 h-4 text-accent-foreground fill-current" />
          <span className="font-bold text-accent-foreground">{task.points}</span>
        </div>
      </div>

      {isCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-2 -right-2 text-2xl"
        >
          ✨
        </motion.div>
      )}
    </motion.div>
  );
};
