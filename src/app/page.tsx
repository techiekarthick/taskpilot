"use client";

import { useState, useEffect } from 'react';
import type { Task } from '@/lib/types';
import Header from '@/components/swift-task/Header';
import AddTaskForm from '@/components/swift-task/AddTaskForm';
import TaskList from '@/components/swift-task/TaskList';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function SwiftTaskPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { toast } = useToast();

  // Load tasks from local storage on initial render
  useEffect(() => {
    const storedTasks = localStorage.getItem('swiftTasks');
    if (storedTasks) {
      try {
        setTasks(JSON.parse(storedTasks));
      } catch (error) {
        console.error("Failed to parse tasks from local storage", error);
        localStorage.removeItem('swiftTasks'); // Clear corrupted data
      }
    }
  }, []);

  // Save tasks to local storage whenever tasks change
  useEffect(() => {
    localStorage.setItem('swiftTasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = (title: string, details?: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      details,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks(prevTasks => [newTask, ...prevTasks]); // Add new tasks to the beginning
    toast({
      title: "Task Added",
      description: `"${title}" has been added to your list.`,
    });
  };

  const handleToggleComplete = (id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    toast({
      title: "Task Deleted",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <ScrollArea className="flex-grow">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 max-w-2xl"> {/* max-w-2xl for a more compact main area */}
          <AddTaskForm onAddTask={handleAddTask} />
          <TaskList
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            onDeleteTask={handleDeleteTask}
          />
        </main>
      </ScrollArea>
      <Toaster />
    </div>
  );
}
