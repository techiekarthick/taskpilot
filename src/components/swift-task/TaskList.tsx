"use client";

import type { FC } from 'react';
import type { Task } from '@/lib/types';
import TaskItem from './TaskItem';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

const TaskList: FC<TaskListProps> = ({ tasks, onToggleComplete, onDeleteTask }) => {
  const activeTasks = tasks.filter(task => !task.completed).sort((a, b) => b.createdAt - a.createdAt);
  const completedTasks = tasks.filter(task => task.completed).sort((a, b) => b.createdAt - a.createdAt);

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <img 
            src="https://placehold.co/240x160.png" 
            alt="Empty task list" 
            data-ai-hint="illustration empty state" 
            className="mx-auto mb-3 rounded-lg shadow-md"
            width="240"
            height="160"
        />
        <p className="text-lg font-semibold text-foreground">Your task list is empty!</p>
        <p className="text-sm text-muted-foreground">Add a new task to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {activeTasks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2.5 text-foreground">Active Tasks</h2>
          <div className="space-y-2.5">
            {activeTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onDeleteTask={onDeleteTask}
              />
            ))}
          </div>
        </div>
      )}

      {completedTasks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2.5 text-muted-foreground">Completed Tasks</h2>
           <div className="space-y-2.5">
            {completedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onDeleteTask={onDeleteTask}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
