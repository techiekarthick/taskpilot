
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Task } from '@/lib/types';
import Header from '@/components/swift-task/Header';
import AddTaskForm from '@/components/swift-task/AddTaskForm';
import TaskList from '@/components/swift-task/TaskList';
import EditTaskModal from '@/components/swift-task/EditTaskModal';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FilterIcon, ChevronDown, ChevronUp } from 'lucide-react';

const predefinedCategories = ["Work", "Personal", "Shopping", "Study", "Errands", "Appointments", "Fitness", "Home"];
const priorityOptions: Array<{ value: Task['priority'] | 'all', label: string }> = [
  { value: 'all', label: 'All Priorities' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
  { value: 'none', label: 'None' },
];

export default function TaskPilotPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { toast } = useToast();
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<Task['priority'] | 'all'>('all');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);


  useEffect(() => {
    setIsClient(true);
  }, []);

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
      category: category,
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
    toast({
      title: "Task Added",
      description: `"${title}" has been added to your list.`,
    });
    setIsAddTaskModalOpen(false); 
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

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTask(null);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
    toast({
      title: "Task Updated",
      description: `"${updatedTask.title}" has been updated.`,
    });
    handleCloseEditModal();
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const categoryMatch = categoryFilter === 'all' || task.category === categoryFilter || (categoryFilter === 'uncategorized' && !task.category);
      const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
      return categoryMatch && priorityMatch;
    });
  }, [tasks, categoryFilter, priorityFilter]);

  const completedTasksCount = useMemo(() => filteredTasks.filter(task => task.completed).length, [filteredTasks]);
  const totalTasksCount = useMemo(() => filteredTasks.length, [filteredTasks]);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p>Loading TaskPilot...</p>
      </div>
    );
  }
  
  const filterControls = (
    <div className="space-y-4">
      <div>
        <Label htmlFor="category-filter" className="block text-sm font-medium text-foreground mb-1.5">Category</Label>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger id="category-filter" className="w-full text-sm h-9 bg-input">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {predefinedCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
            <SelectItem value="uncategorized">Uncategorized</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="priority-filter" className="block text-sm font-medium text-foreground mb-1.5">Priority</Label>
        <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as Task['priority'] | 'all')}>
          <SelectTrigger id="priority-filter" className="w-full text-sm h-9 bg-input">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );


  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        completedTasksCount={completedTasksCount}
        totalTasksCount={totalTasksCount}
        onOpenAddTaskModal={() => setIsAddTaskModalOpen(true)}
      />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-4 flex-grow flex flex-col md:flex-row gap-6">
        {/* Filters Section - Left Column on Desktop, Collapsible on Mobile */}
        <div className="md:w-64 lg:w-72 md:sticky md:top-20 md:self-start"> {/* md:top-20 assumes header height + some margin */}
          {/* Mobile Filter Toggle */}
          <div className="md:hidden mb-4">
            <Button 
              variant="outline" 
              className="w-full flex justify-between items-center"
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            >
              <span className="flex items-center">
                <FilterIcon className="mr-2 h-4 w-4 text-primary" />
                {showFiltersMobile ? 'Hide Filters' : 'Show Filters'}
              </span>
              {showFiltersMobile ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {/* Desktop Filters (always visible) */}
          <div className="hidden md:block p-4 bg-card rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center">
              <FilterIcon className="mr-2 h-5 w-5 text-primary" />
              Filters
            </h2>
            {filterControls}
          </div>

          {/* Mobile Filters (collapsible) */}
          {showFiltersMobile && (
            <div className="md:hidden p-4 bg-card rounded-lg shadow-md mb-4">
              {/* No separate title needed here as button indicates "Filters" */}
              {filterControls}
            </div>
          )}
        </div>

        {/* Task List Section - Right Column on Desktop, Below Filters on Mobile */}
        <div className="flex-1 min-w-0 flex flex-col">
          <ScrollArea className="flex-grow pr-2">
            <TaskList
              tasks={filteredTasks}
              onToggleComplete={handleToggleComplete}
              onDeleteTask={handleDeleteTask}
              onOpenEditModal={handleOpenEditModal}
              highlightedTaskId={highlightedTaskId}
            />
          </ScrollArea>
        </div>
      </main>

      <Dialog open={isAddTaskModalOpen} onOpenChange={setIsAddTaskModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add New Task</DialogTitle>
          </DialogHeader>
          <AddTaskForm onAddTask={handleAddTask} />
        </DialogContent>
      </Dialog>

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onUpdateTask={handleUpdateTask}
        />
      )}
      <Toaster />
    </div>
  );
}
