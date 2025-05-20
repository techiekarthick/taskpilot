
"use client";

import type { FC } from 'react';
import type { Task } from '@/lib/types';
import TaskItem from './TaskItem';
import { ClipboardList } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenEditModal: (task: Task) => void; // New prop
  highlightedTaskId: string | null;
}

const getPriorityValue = (priority?: Task['priority']): number => {
  switch (priority) {
    case 'high': return 1;
    case 'medium': return 2;
    case 'low': return 3;
    case 'none':
    default: return 4; 
  }
};

const TaskList: FC<TaskListProps> = ({ tasks, onToggleComplete, onDeleteTask, onOpenEditModal, highlightedTaskId }) => {
  
  const activeTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => {
      const priorityComparison = getPriorityValue(a.priority) - getPriorityValue(b.priority);
      if (priorityComparison !== 0) return priorityComparison;
      
      return b.createdAt - a.createdAt;
    });

  const completedTasks = tasks
    .filter(task => task.completed)
    .sort((a, b) => b.createdAt - a.createdAt); 

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
                onOpenEditModal={onOpenEditModal} // Pass prop
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
                onOpenEditModal={onOpenEditModal} // Pass prop
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
