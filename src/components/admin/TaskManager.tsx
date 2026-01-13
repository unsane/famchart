import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { categoryInfo, familyMembers } from '@/data/familyMembers';
import { Task, TaskCategory, FamilyMember } from '@/types';
import { cn } from '@/lib/utils';

export const TaskManager = () => {
  const { tasks, addTask, updateTask, deleteTask } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    category: 'chores' as TaskCategory,
    points: 1,
    assignedTo: [] as FamilyMember[],
    recurring: 'daily' as const,
  });
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (!newTask.title.trim() || newTask.assignedTo.length === 0) return;
    addTask(newTask);
    setNewTask({
      title: '',
      category: 'chores',
      points: 1,
      assignedTo: [],
      recurring: 'daily',
    });
    setIsAdding(false);
  };

  const toggleAssigned = (member: FamilyMember) => {
    setNewTask(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(member)
        ? prev.assignedTo.filter(m => m !== member)
        : [...prev.assignedTo, member],
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 shadow-card"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display font-bold">📋 Manage Tasks</h2>
        <Button variant="hero" size="sm" onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4" />
          Add Task
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
            <Input
              placeholder="Task name..."
              value={newTask.title}
              onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
            />
            
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-semibold">Category:</span>
              {(Object.keys(categoryInfo) as TaskCategory[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setNewTask(prev => ({ ...prev, category: cat }))}
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium transition-all",
                    newTask.category === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-card hover:bg-primary/20"
                  )}
                >
                  {categoryInfo[cat].emoji} {categoryInfo[cat].label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-semibold">Assign to:</span>
              {familyMembers.map(member => (
                <button
                  key={member.id}
                  onClick={() => toggleAssigned(member.id)}
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium transition-all",
                    newTask.assignedTo.includes(member.id)
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-card hover:bg-secondary/20"
                  )}
                >
                  {member.emoji} {member.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Points:</span>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={newTask.points}
                  onChange={e => setNewTask(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                  className="w-20"
                />
              </div>
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

      <div className="space-y-2">
        {tasks.map(task => (
          <motion.div
            key={task.id}
            layout
            className="flex items-center gap-4 p-3 bg-muted rounded-xl"
          >
            <span className="text-xl">{categoryInfo[task.category].emoji}</span>
            <div className="flex-1">
              <p className="font-semibold">{task.title}</p>
              <p className="text-sm text-muted-foreground">
                {task.assignedTo.map(m => familyMembers.find(fm => fm.id === m)?.emoji).join(' ')}
                {' · '}{task.points} pts
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteTask(task.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
