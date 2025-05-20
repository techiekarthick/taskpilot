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
    <Card className="mb-6 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <PlusCircle className="mr-2 h-6 w-6 text-primary-foreground fill-primary" />
          Add New Task
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-foreground mb-1">
              Task Title
            </label>
            <Input
              id="task-title"
              type="text"
              placeholder="Enter task title (e.g., Buy groceries)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-card"
            />
          </div>
          <div>
            <label htmlFor="task-details" className="block text-sm font-medium text-foreground mb-1">
              Details (Optional)
            </label>
            <Textarea
              id="task-details"
              placeholder="Add any extra details here..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              className="bg-card"
            />
          </div>
          <Button type="submit" className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddTaskForm;
