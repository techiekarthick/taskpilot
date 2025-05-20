
"use client";

import type { FC } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, CalendarIcon, ClockIcon, Tag, AlertTriangle, CalendarDays, ChevronsUpDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Task } from '@/lib/types';

interface AddTaskFormProps {
  onAddTask: (
    title: string,
    details?: string,
    reminderAt?: number | null,
    priority?: Task['priority'],
    dueDate?: number | null,
    category?: string
  ) => void;
}

const AddTaskForm: FC<AddTaskFormProps> = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [reminderDate, setReminderDate] = useState<Date | undefined>();
  const [reminderHour, setReminderHour] = useState('');
  const [reminderMinute, setReminderMinute] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('none');
  const [selectedDueDate, setSelectedDueDate] = useState<Date | undefined>();
  const [category, setCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() === '') return;

    let reminderTimestamp: number | null = null;
    if (reminderDate && reminderHour.trim() !== '' && reminderMinute.trim() !== '') {
      const hour = parseInt(reminderHour, 10);
      const minute = parseInt(reminderMinute, 10);
      if (!isNaN(hour) && hour >= 0 && hour <= 23 && !isNaN(minute) && minute >= 0 && minute <= 59) {
        let dateWithTime = setHours(reminderDate, hour);
        dateWithTime = setMinutes(dateWithTime, minute);
        dateWithTime = setSeconds(dateWithTime, 0);
        dateWithTime = setMilliseconds(dateWithTime, 0);
        if (dateWithTime.getTime() > Date.now()) {
          reminderTimestamp = dateWithTime.getTime();
        } else {
          console.warn("Reminder time must be in the future.");
        }
      }
    }

    const dueTimestamp: number | null = selectedDueDate
      ? setMilliseconds(setSeconds(setMinutes(setHours(selectedDueDate, 0), 0), 0), 0).getTime()
      : null;

    onAddTask(
      title.trim(),
      details.trim() || undefined,
      reminderTimestamp,
      priority === 'none' ? undefined : priority,
      dueTimestamp,
      category.trim() || undefined
    );

    setTitle('');
    setDetails('');
    setReminderDate(undefined);
    setReminderHour('');
    setReminderMinute('');
    setPriority('none');
    setSelectedDueDate(undefined);
    setCategory('');
  };

  return (
    <div className="mb-6 p-5 bg-card rounded-lg shadow-lg">
      <h2 className="flex items-center text-lg font-semibold mb-4 text-foreground">
        <PlusCircle className="mr-2 h-5 w-5 text-primary-foreground fill-primary" />
        Add New Task
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="task-title" className="block text-xs font-medium text-foreground mb-1.5">
            Task Title
          </Label>
          <Input
            id="task-title"
            type="text"
            placeholder="Enter task title (e.g., Buy groceries)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="text-sm bg-input placeholder:text-muted-foreground"
          />
        </div>
        <div>
          <Label htmlFor="task-details" className="block text-xs font-medium text-foreground mb-1.5">
            Details (Optional)
          </Label>
          <Textarea
            id="task-details"
            placeholder="Add any extra details here..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            className="text-sm bg-input placeholder:text-muted-foreground"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="task-priority" className="block text-xs font-medium text-foreground mb-1.5">
              Priority
            </Label>
            <Select value={priority} onValueChange={(value: Task['priority']) => setPriority(value)}>
              <SelectTrigger id="task-priority" className="w-full text-xs h-9 bg-input">
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
            <Label htmlFor="task-category" className="block text-xs font-medium text-foreground mb-1.5">
              Category (Optional)
            </Label>
            <Input
              id="task-category"
              type="text"
              placeholder="e.g., Work, Personal"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="text-sm bg-input placeholder:text-muted-foreground h-9"
            />
          </div>
        </div>

        <div>
          <Label className="block text-xs font-medium text-foreground mb-1.5">
            Due Date (Optional)
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal text-xs h-9 bg-input hover:bg-input/90 border-input",
                  !selectedDueDate && "text-muted-foreground"
                )}
              >
                <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                {selectedDueDate ? format(selectedDueDate, "PPP") : <span>Pick a due date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDueDate}
                onSelect={setSelectedDueDate}
                initialFocus
                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label className="block text-xs font-medium text-foreground mb-1.5">
            Set Reminder (Optional)
          </Label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Popover>
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
                  disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                />
              </PopoverContent>
            </Popover>
            <div className="flex gap-2 items-center">
               <ClockIcon className="h-3.5 w-3.5 text-muted-foreground ml-1 sm:ml-0" />
              <Input
                type="number"
                min="0"
                max="23"
                placeholder="HH"
                value={reminderHour}
                onChange={(e) => setReminderHour(e.target.value)}
                className="w-16 h-9 text-xs bg-input placeholder:text-muted-foreground"
                disabled={!reminderDate}
              />
              <span className="text-muted-foreground">:</span>
              <Input
                type="number"
                min="0"
                max="59"
                placeholder="MM"
                value={reminderMinute}
                onChange={(e) => setReminderMinute(e.target.value)}
                className="w-16 h-9 text-xs bg-input placeholder:text-muted-foreground"
                disabled={!reminderDate}
              />
            </div>
          </div>
        </div>
        <Button type="submit" size="sm" className="w-full sm:w-auto text-xs">
          <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
          Add Task
        </Button>
      </form>
    </div>
  );
};

export default AddTaskForm;
