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
      <div className="text-center py-10">
        <img src="https://placehold.co/300x200.png" alt="Empty task list" data-ai-hint="illustration empty state" className="mx-auto mb-4 rounded-lg shadow-md" />
        <p className="text-xl font-semibold text-foreground">Your task list is empty!</p>
        <p className="text-muted-foreground">Add a new task to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activeTasks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3 text-foreground">Active Tasks</h2>
          <div className="space-y-3">
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
          <h2 className="text-xl font-semibold mb-3 text-muted-foreground">Completed Tasks</h2>
           <div className="space-y-3">
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
