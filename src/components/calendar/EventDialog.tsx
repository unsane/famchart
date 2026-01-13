import { useState, useEffect, forwardRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { familyMembers, categoryInfo } from '@/data/familyMembers';
import { TaskCategory, FamilyMember, Task } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface EventDialogProps {
  date: Date;
  defaultTime?: string;
  editTask?: Task;
  trigger?: React.ReactNode;
  onClose?: () => void;
}

export const EventDialog = forwardRef<HTMLButtonElement, EventDialogProps>(
  ({ date, defaultTime, editTask, trigger, onClose }, ref) => {
  const { addTask, updateTask, deleteTask } = useApp();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('dates');
  const [startTime, setStartTime] = useState(defaultTime || '09:00');
  const [endTime, setEndTime] = useState(defaultTime ? `${String(parseInt(defaultTime.split(':')[0]) + 1).padStart(2, '0')}:00` : '10:00');
  const [selectedMembers, setSelectedMembers] = useState<FamilyMember[]>(['mom', 'dad', 'son']);
  const [recurring, setRecurring] = useState<'once' | 'daily' | 'weekly'>('once');

  const isEditing = !!editTask;

  useEffect(() => {
    if (editTask && open) {
      setTitle(editTask.title);
      setCategory(editTask.category);
      setStartTime(editTask.startTime || '09:00');
      setEndTime(editTask.endTime || '10:00');
      setSelectedMembers(editTask.assignedTo);
      setRecurring(editTask.recurring);
    }
  }, [editTask, open]);

  const toggleMember = (memberId: FamilyMember) => {
    setSelectedMembers(prev => {
      if (prev.includes(memberId)) {
        if (prev.length === 1) return prev;
        return prev.filter(id => id !== memberId);
      }
      return [...prev, memberId];
    });
  };

  const resetForm = () => {
    setTitle('');
    setCategory('dates');
    setStartTime('09:00');
    setEndTime('10:00');
    setSelectedMembers(['mom', 'dad', 'son']);
    setRecurring('once');
  };

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.error('Please enter a title');
      return;
    }

    if (trimmedTitle.length > 100) {
      toast.error('Title must be less than 100 characters');
      return;
    }

    if (isEditing && editTask) {
      updateTask({
        ...editTask,
        title: trimmedTitle,
        category,
        assignedTo: selectedMembers,
        recurring,
        dueDate: recurring === 'once' ? date.toISOString() : undefined,
        startTime,
        endTime,
      });
      toast.success('Event updated! ✨');
    } else {
      addTask({
        title: trimmedTitle,
        category,
        points: 0,
        assignedTo: selectedMembers,
        recurring,
        dueDate: recurring === 'once' ? date.toISOString() : undefined,
        startTime,
        endTime,
      });
      toast.success('Event added! ✨');
    }

    handleClose();
    if (!isEditing) resetForm();
  };

  const handleDelete = () => {
    if (editTask) {
      deleteTask(editTask.id);
      toast.success('Event deleted');
      handleClose();
    }
  };

  const defaultTrigger = (
    <Button ref={ref} size="sm" variant="gold" className="gap-2">
      <Plus className="w-4 h-4" />
      <span className="hidden sm:inline">Add Event</span>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEditing ? 'Edit Event' : 'Add Event'} - {format(date, 'MMM d, yyyy')}
          </DialogTitle>
          <VisuallyHidden>
            <DialogDescription>
              {isEditing ? 'Edit the event details below' : 'Fill in the event details below'}
            </DialogDescription>
          </VisuallyHidden>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              placeholder="Enter event title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as TaskCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoryInfo).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span>{info.emoji}</span>
                      <span>{info.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Recurring</Label>
            <Select value={recurring} onValueChange={(v) => setRecurring(v as typeof recurring)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">One-time</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Assign To</Label>
            <div className="flex gap-2">
              {familyMembers.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => toggleMember(member.id)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-all",
                    selectedMembers.includes(member.id)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  <span>{member.emoji}</span>
                  <span>{member.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          {isEditing ? (
            <Button variant="destructive" onClick={handleDelete} className="gap-2">
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="gold" onClick={handleSubmit}>
              {isEditing ? 'Save Changes' : 'Add Event'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

EventDialog.displayName = 'EventDialog';
