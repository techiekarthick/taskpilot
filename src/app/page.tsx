"use client";

import { useState, useEffect } from 'react';
import type { Task, SuggestedTask } from '@/lib/types';
import Header from '@/components/swift-task/Header';
import AddTaskForm from '@/components/swift-task/AddTaskForm';
import TaskList from '@/components/swift-task/TaskList';
import AISuggestionsModal from '@/components/swift-task/AISuggestionsModal';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { suggestSubtasks, type SuggestSubtasksInput } from '@/ai/flows/suggest-subtasks';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function SwiftTaskPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskForSuggestions, setSelectedTaskForSuggestions] = useState<Task | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestedTask[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
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
    setTasks(prevTasks => [...prevTasks, newTask]);
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

  const handleOpenAISuggestions = async (task: Task) => {
    setSelectedTaskForSuggestions(task);
    setIsModalOpen(true);
    setIsLoadingSuggestions(true);
    setSuggestions([]);

    try {
      const input: SuggestSubtasksInput = {
        taskDescription: task.details ? `${task.title}: ${task.details}` : task.title,
      };
      const result = await suggestSubtasks(input);
      if (result && result.subtasks) {
        setSuggestions(result.subtasks.map(subtaskTitle => ({ id: crypto.randomUUID(), title: subtaskTitle })));
      } else {
        setSuggestions([]);
         toast({
          title: "AI Suggestions",
          description: "No subtasks suggested or an error occurred.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
      setSuggestions([]);
      toast({
        title: "AI Error",
        description: "Could not fetch subtask suggestions.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleAddSuggestionAsTask = (title: string) => {
    handleAddTask(title, `Subtask for "${selectedTaskForSuggestions?.title || 'previous task'}"`);
    toast({
      title: "Subtask Added",
      description: `"${title}" added as a new task.`,
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <ScrollArea className="flex-grow">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-3xl">
          <AddTaskForm onAddTask={handleAddTask} />
          <TaskList
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            onDeleteTask={handleDeleteTask}
            onSuggestSubtasks={handleOpenAISuggestions}
          />
        </main>
      </ScrollArea>
      <AISuggestionsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskTitle={selectedTaskForSuggestions?.title}
        suggestions={suggestions}
        isLoading={isLoadingSuggestions}
        onAddSuggestionAsTask={handleAddSuggestionAsTask}
      />
      <Toaster />
    </div>
  );
}
