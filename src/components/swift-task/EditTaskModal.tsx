
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, ClockIcon } from 'lucide-react';
import { format, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/types';

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (updatedTask: Task) => void;
}

const predefinedCategories = ["Work", "Personal", "Shopping", "Study", "Errands", "Appointments", "Fitness", "Home"];
const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')); // 00-23
const minuteOptions = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0')); // 00, 05, ..., 55

const EditTaskModal: FC<EditTaskModalProps> = ({ task, isOpen, onClose, onUpdateTask }) => {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [reminderDate, setReminderDate] = useState<Date | undefined>();
  const [selectedHour, setSelectedHour] = useState<string | undefined>();
  const [selectedMinute, setSelectedMinute] = useState<string | undefined>();
  const [priority, setPriority] = useState<Task['priority']>('none');
  const [category, setCategory] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (task && isOpen) {
      setTitle(task.title);
      setDetails(task.details || '');
      setPriority(task.priority || 'none');
      setCategory(task.category || undefined);

      if (task.reminderAt) {
        const reminder = new Date(task.reminderAt);
        setReminderDate(reminder);
        setSelectedHour(format(reminder, "HH")); // 24-hour format
        setSelectedMinute(format(reminder, "mm"));
      } else {
        setReminderDate(undefined);
        setSelectedHour(undefined);
        setSelectedMinute(undefined);
      }
    } else if (!isOpen) { // Reset when modal is closed
        setTitle('');
        setDetails('');
        setReminderDate(undefined);
        setSelectedHour(undefined);
        setSelectedMinute(undefined);
        setPriority('none');
        setCategory(undefined);
    }
  }, [task, isOpen]);

  if (!task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() === '') return;

    let reminderTimestamp: number | null = null;
    if (reminderDate && selectedHour && selectedMinute) {
      const hour24 = parseInt(selectedHour, 10);
      const minute = parseInt(selectedMinute, 10);

      if (!isNaN(hour24) && hour24 >= 0 && hour24 <= 23 && !isNaN(minute) && minute >= 0 && minute <= 59) {
        let dateWithTime = setHours(reminderDate, hour24);
        dateWithTime = setMinutes(dateWithTime, minute);
        dateWithTime = setSeconds(dateWithTime, 0);
        dateWithTime = setMilliseconds(dateWithTime, 0);
        reminderTimestamp = dateWithTime.getTime();
      }
    }

    const updatedTask: Task = {
      ...task,
      title: title.trim(),
      details: details.trim() || undefined,
      reminderAt: reminderTimestamp,
      priority: priority,
      category: category,
    };
    onUpdateTask(updatedTask);
  };

  const handleClearReminder = () => {
    setReminderDate(undefined);
    setSelectedHour(undefined);
    setSelectedMinute(undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-card flex flex-col max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Task</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-task-title" className="block text-xs font-medium text-foreground mb-1.5">
                Task Title
              </Label>
              <Input
                id="edit-task-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="text-sm bg-input placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <Label htmlFor="edit-task-details" className="block text-xs font-medium text-foreground mb-1.5">
                Details (Optional)
              </Label>
              <Textarea
                id="edit-task-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                className="text-sm bg-input placeholder:text-muted-foreground"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-task-priority" className="block text-xs font-medium text-foreground mb-1.5">
                  Priority
                </Label>
                <Select value={priority} onValueChange={(value: Task['priority']) => setPriority(value)}>
                  <SelectTrigger id="edit-task-priority" className="w-full text-xs h-9 bg-input">
                    <SelectValue placeholder="Set priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-task-category" className="block text-xs font-medium text-foreground mb-1.5">
                  Category (Optional)
                </Label>
                <Select value={category} onValueChange={(value) => setCategory(value === "none" ? undefined : value)}>
                  <SelectTrigger id="edit-task-category" className="w-full text-xs h-9 bg-input">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {predefinedCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="block text-xs font-medium text-foreground mb-1.5">
                Set Reminder (Optional)
              </Label>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center"> 
                <Popover modal={true}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full sm:w-[200px] justify-start text-left font-normal text-xs h-9 bg-input hover:bg-input/90 border-input",
                        !reminderDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                      {reminderDate ? format(reminderDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={reminderDate}
                      onSelect={setReminderDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <div className="flex items-center gap-1.5 mt-2 sm:mt-0">
                  <ClockIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <Select value={selectedHour} onValueChange={setSelectedHour} disabled={!reminderDate}>
                    <SelectTrigger className="w-[65px] text-xs h-9 bg-input">
                      <SelectValue placeholder="HH" />
                    </SelectTrigger>
                    <SelectContent>
                      {hourOptions.map(hour => <SelectItem key={hour} value={hour}>{hour}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <span className="text-muted-foreground shrink-0">:</span>
                  <Select value={selectedMinute} onValueChange={setSelectedMinute} disabled={!reminderDate}>
                    <SelectTrigger className="w-[65px] text-xs h-9 bg-input">
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {minuteOptions.map(min => <SelectItem key={min} value={min}>{min}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-xs mt-1 text-muted-foreground"
                  onClick={handleClearReminder}
                  disabled={!reminderDate && !selectedHour && !selectedMinute}
              >
                  Clear Reminder
              </Button>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" size="sm" className="text-xs">Cancel</Button>
              </DialogClose>
              <Button type="submit" size="sm" className="text-xs">Save Changes</Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskModal;
