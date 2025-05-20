
"use client";

import { useState, useEffect, useCallback } from 'react';
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
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load tasks from local storage on initial render
  useEffect(() => {
    if (!isClient) return;
    const storedTasks = localStorage.getItem('swiftTasks');
    if (storedTasks) {
      try {
        setTasks(JSON.parse(storedTasks));
      } catch (error) {
        console.error("Failed to parse tasks from local storage", error);
        localStorage.removeItem('swiftTasks'); // Clear corrupted data
      }
    }
  }, [isClient]);

  // Save tasks to local storage whenever tasks change
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('swiftTasks', JSON.stringify(tasks));
  }, [tasks, isClient]);

  const requestNotificationPermission = useCallback(async () => {
    if (!isClient || !('Notification' in window)) {
      toast({ title: "Notifications not supported", description: "Your browser does not support desktop notifications.", variant: "destructive" });
      return false;
    }
    if (Notification.permission === 'granted') {
      return true;
    }
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        return true;
      } else {
        toast({ title: "Notification Permission Denied", description: "You won't receive task reminders.", variant: "destructive" });
        return false;
      }
    }
    return false;
  }, [toast, isClient]);

  const showNotification = useCallback((task: Task) => {
    if (!isClient) return;
    const notification = new Notification(task.title, {
      body: task.details || 'Task reminder!',
      icon: '/logo.png', // Optional: Add a logo in public folder
      data: { taskId: task.id, url: window.location.href }, // Pass URL to focus correct tab
    });

    notification.onclick = (event) => {
      const targetUrl = event.target?.data?.url;
      if (targetUrl) {
        window.open(targetUrl, '_blank')?.focus(); // Open in new tab or focus existing
      } else {
        window.focus();
      }
      setHighlightedTaskId(task.id);
      setTimeout(() => setHighlightedTaskId(null), 3000); // Remove highlight after 3 seconds
      notification.close();
    };
  }, [isClient]);


  useEffect(() => {
    if (!isClient) return;
    const timeouts = new Map<string, NodeJS.Timeout>();

    tasks.forEach(task => {
      if (task.reminderAt && task.reminderAt > Date.now() && !task.completed) {
        const delay = task.reminderAt - Date.now();
        const timeoutId = setTimeout(() => {
          if (Notification.permission === 'granted') {
            showNotification(task);
          } else {
            // If permission was not granted when reminder was set, prompt again or inform user
            console.log(`Reminder for "${task.title}" - permission not granted at time of reminder.`);
             toast({ title: `Reminder: ${task.title}`, description: task.details || "Time for your task!" });
          }
          // Optionally, mark reminder as passed or update task state
        }, delay);
        timeouts.set(task.id, timeoutId);
      }
    });

    return () => {
      timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    };
  }, [tasks, showNotification, toast, isClient]);


  const handleAddTask = async (title: string, details?: string, reminderAt?: number | null) => {
    if (reminderAt && isClient && Notification.permission !== 'granted') {
      const permissionGranted = await requestNotificationPermission();
      if (!permissionGranted && Notification.permission !== 'denied') {
         toast({ title: "Reminder Set", description: "Please grant notification permission to receive reminders."});
      }
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      details,
      completed: false,
      createdAt: Date.now(),
      reminderAt: reminderAt,
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
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

  if (!isClient) {
    // Render a loading state or null during SSR/initial client render phase
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p>Loading SwiftTask...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-4 flex-grow flex flex-col lg:flex-row gap-6 lg:gap-8">
        <div className="lg:w-[400px] lg:flex-shrink-0">
          <AddTaskForm onAddTask={handleAddTask} />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
           <ScrollArea className="flex-grow h-0 pr-2">
            <TaskList
              tasks={tasks}
              onToggleComplete={handleToggleComplete}
              onDeleteTask={handleDeleteTask}
              highlightedTaskId={highlightedTaskId}
            />
          </ScrollArea>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
