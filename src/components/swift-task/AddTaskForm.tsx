
"use client";

import type { FC } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, CalendarIcon, ClockIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface AddTaskFormProps {
  onAddTask: (title: string, details?: string, reminderAt?: number | null) => void;
}

const AddTaskForm: FC<AddTaskFormProps> = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [reminderDate, setReminderDate] = useState<Date | undefined>();
  const [reminderHour, setReminderHour] = useState('');
  const [reminderMinute, setReminderMinute] = useState('');

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
          // Optionally, show an error toast that reminder time must be in the future
          console.warn("Reminder time must be in the future.");
        }
      }
    }

    onAddTask(title.trim(), details.trim() || undefined, reminderTimestamp);
    setTitle('');
    setDetails('');
    setReminderDate(undefined);
    setReminderHour('');
    setReminderMinute('');
  };

  return (
    <Card className="mb-5 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-base font-semibold">
          <PlusCircle className="mr-2 h-4 w-4 text-primary-foreground fill-primary" />
          Add New Task
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="task-title" className="block text-xs font-medium text-foreground mb-1">
              Task Title
            </Label>
            <Input
              id="task-title"
              type="text"
              placeholder="Enter task title (e.g., Buy groceries)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-card text-sm"
            />
          </div>
          <div>
            <Label htmlFor="task-details" className="block text-xs font-medium text-foreground mb-1">
              Details (Optional)
            </Label>
            <Textarea
              id="task-details"
              placeholder="Add any extra details here..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={2}
              className="bg-card text-sm"
            />
          </div>
          <div>
            <Label className="block text-xs font-medium text-foreground mb-1">
              Set Reminder (Optional)
            </Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full sm:w-[200px] justify-start text-left font-normal text-xs h-9",
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
                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} // Disable past dates
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
                  className="w-16 h-9 text-xs bg-card"
                  disabled={!reminderDate}
                />
                <span>:</span>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="MM"
                  value={reminderMinute}
                  onChange={(e) => setReminderMinute(e.target.value)}
                  className="w-16 h-9 text-xs bg-card"
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
      </CardContent>
    </Card>
  );
};

export default AddTaskForm;
