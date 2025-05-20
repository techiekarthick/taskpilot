
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Task } from '@/lib/types';
import Header from '@/components/swift-task/Header';
import AddTaskForm from '@/components/swift-task/AddTaskForm';
import TaskList from '@/components/swift-task/TaskList';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function TaskPilotPage() {
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
        localStorage.removeItem('swiftTasks'); 
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
        toast({ title: "Notification Permission Granted", description: "You will now receive task reminders." });
        return true;
      } else {
        toast({ title: "Notification Permission Denied", description: "You won't receive task reminders.", variant: "destructive" });
        return false;
      }
    }
    return false;
  }, [toast, isClient]);

  const showNotification = useCallback((task: Task) => {
    if (!isClient) {
      console.log('[showNotification] Bailed: !isClient');
      return;
    }
    
    if (Notification.permission !== 'granted') {
      console.warn(`[showNotification] Permission not granted for "${task.title}" at the moment of showing. Aborting.`);
      return;
    }

    console.log(`[showNotification] Attempting to show notification for task: "${task.title}"`);
    const notification = new Notification(task.title, {
      body: task.details || 'Task reminder!',
      icon: '/logo.png', 
      data: { taskId: task.id },
      tag: `task-pilot-${task.id}` 
    });

    notification.onclick = () => {
      console.log('[Notification Clicked] Task ID:', task.id);
      window.focus(); 
      setHighlightedTaskId(task.id);
      setTimeout(() => setHighlightedTaskId(null), 3000);
      notification.close();
    };

    notification.onerror = (err) => {
      console.error('Notification API error:', err);
      toast({ 
        title: 'Notification Error', 
        description: `Could not display reminder for "${task.title}".`, 
        variant: 'destructive'
      });
    };
  }, [isClient, setHighlightedTaskId, toast]);


  useEffect(() => {
    if (!isClient) return;
    const timeouts = new Map<string, NodeJS.Timeout>();

    tasks.forEach(task => {
      if (task.reminderAt && task.reminderAt > Date.now() && !task.completed) {
        const delay = task.reminderAt - Date.now();
        console.log(`[Reminder Effect] Setting reminder for "${task.title}" in ${delay}ms. Permission: ${Notification.permission}`);
        
        const timeoutId = setTimeout(() => {
          console.log(`[Reminder Timeout Fired] Task: "${task.title}", Current Permission: ${Notification.permission}`);
          if (Notification.permission === 'granted') {
            console.log(`[Reminder Timeout] Permission granted, calling showNotification for "${task.title}"`);
            showNotification(task);
          } else {
            console.warn(`[Reminder Timeout] Permission NOT granted for "${task.title}". Showing toast as fallback.`);
            toast({ title: `Reminder: ${task.title}`, description: task.details || "Time for your task!" });
          }
        }, delay);
        timeouts.set(task.id, timeoutId);
      }
    });

    return () => {
      timeouts.forEach((timeoutId, taskId) => {
        console.log(`[Reminder Effect Cleanup] Clearing timeout for task ID: ${taskId}`);
        clearTimeout(timeoutId);
      });
    };
  }, [tasks, showNotification, toast, isClient]);


  const handleAddTask = async (
    title: string,
    details?: string,
    reminderAt?: number | null,
    priority?: Task['priority'],
    dueDate?: number | null,
    category?: string
  ) => {
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
      priority: priority || 'none',
      dueDate: dueDate,
      category: category,
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

  const completedTasksCount = tasks.filter(task => task.completed).length;
  const totalTasksCount = tasks.length;

  if (!isClient) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p>Loading TaskPilot...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header completedTasksCount={completedTasksCount} totalTasksCount={totalTasksCount} />
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
