"use client";

import type { FC } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

interface AddTaskFormProps {
  onAddTask: (title: string, details?: string) => void;
}

const AddTaskForm: FC<AddTaskFormProps> = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() === '') return;
    onAddTask(title.trim(), details.trim() || undefined);
    setTitle('');
    setDetails('');
  };

  return (
    <Card className="mb-5 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg">
          <PlusCircle className="mr-2 h-5 w-5 text-primary-foreground fill-primary" />
          Add New Task
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="task-title" className="block text-xs font-medium text-foreground mb-1">
              Task Title
            </label>
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
            <label htmlFor="task-details" className="block text-xs font-medium text-foreground mb-1">
              Details (Optional)
            </label>
            <Textarea
              id="task-details"
              placeholder="Add any extra details here..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={2}
              className="bg-card text-sm"
            />
          </div>
          <Button type="submit" size="sm" className="w-full sm:w-auto">
            <PlusCircle className="mr-1.5 h-4 w-4" />
            Add Task
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddTaskForm;
