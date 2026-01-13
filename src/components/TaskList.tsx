import { motion, AnimatePresence } from 'framer-motion';
import { TaskCard } from './TaskCard';
import { useApp } from '@/context/AppContext';
import { categoryInfo } from '@/data/familyMembers';
import { TaskCategory } from '@/types';

export const TaskList = () => {
  const { tasks, currentUser } = useApp();

  // Filter tasks assigned to current user
  const userTasks = tasks.filter(
    task => !currentUser || task.assignedTo.includes(currentUser)
  );

  // Group by category
  const groupedTasks = userTasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<TaskCategory, typeof userTasks>);

  const categories = Object.keys(categoryInfo) as TaskCategory[];

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const tasksInCategory = groupedTasks[category] || [];
        if (tasksInCategory.length === 0) return null;

        const info = categoryInfo[category];

        return (
          <motion.div
            key={category}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{info.emoji}</span>
              <h2 className="text-xl font-display font-bold">{info.label}</h2>
              <span className="text-sm text-muted-foreground">
                ({tasksInCategory.length} tasks)
              </span>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {tasksInCategory.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}

      {userTasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-muted-foreground"
        >
          <span className="text-6xl mb-4 block">🎉</span>
          <p className="text-xl font-display">No tasks yet! Check back soon.</p>
        </motion.div>
      )}
    </div>
  );
};
