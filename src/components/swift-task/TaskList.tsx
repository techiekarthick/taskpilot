
"use client";

import type { FC } from 'react';
import type { Task } from '@/lib/types';
import TaskItem from './TaskItem';
import { ClipboardList } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  highlightedTaskId: string | null;
}

const getPriorityValue = (priority?: Task['priority']): number => {
  switch (priority) {
    case 'high': return 1;
    case 'medium': return 2;
    case 'low': return 3;
    case 'none':
    default: return 4; // 'none' or undefined tasks have lowest priority
  }
};

const TaskList: FC<TaskListProps> = ({ tasks, onToggleComplete, onDeleteTask, highlightedTaskId }) => {
  
  const activeTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => {
      // Sort by priority
      const priorityComparison = getPriorityValue(a.priority) - getPriorityValue(b.priority);
      if (priorityComparison !== 0) return priorityComparison;

      // Sort by due date (earliest first, tasks without due date last)
      if (a.dueDate && b.dueDate) {
        const dueDateComparison = a.dueDate - b.dueDate;
        if (dueDateComparison !== 0) return dueDateComparison;
      } else if (a.dueDate) {
        return -1; // a has due date, b doesn't, so a comes first
      } else if (b.dueDate) {
        return 1;  // b has due date, a doesn't, so b comes first
      }
      
      // Sort by creation date (newest first)
      return b.createdAt - a.createdAt;
    });

  const completedTasks = tasks
    .filter(task => task.completed)
    .sort((a, b) => b.createdAt - a.createdAt); // Or sort by a completion timestamp if added

  if (tasks.length === 0) {
    return (
      <div className="text-center py-10 flex flex-col items-center justify-center h-full">
        <ClipboardList className="h-12 w-12 text-muted-foreground/70 mb-4" />
        <p className="text-md font-semibold text-foreground">Your task list is empty!</p>
        <p className="text-xs text-muted-foreground">Add a new task to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {activeTasks.length > 0 && (
        <div>
          <h2 className="text-md font-semibold mb-2 text-foreground px-1 pt-2">Active Tasks</h2>
          <div className="space-y-0">
            {activeTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onDeleteTask={onDeleteTask}
                isHighlighted={task.id === highlightedTaskId}
              />
            ))}
          </div>
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className={activeTasks.length > 0 ? "mt-6" : ""}>
          <h2 className="text-md font-semibold mb-2 text-muted-foreground px-1 pt-2">Completed Tasks</h2>
           <div className="space-y-0">
            {completedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onDeleteTask={onDeleteTask}
                isHighlighted={task.id === highlightedTaskId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
