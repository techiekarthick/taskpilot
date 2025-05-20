
"use client";

import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  isHighlighted?: boolean;
}

const TaskItem: FC<TaskItemProps> = ({ task, onToggleComplete, onDeleteTask, isHighlighted }) => {
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHighlighted && itemRef.current) {
      itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isHighlighted]);

  return (
    <div
      ref={itemRef}
      className={cn(
        "transition-all duration-300 ease-in-out p-4 rounded-lg hover:shadow-md",
        task.completed ? "bg-muted/30 opacity-70" : "bg-card",
        isHighlighted && "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg",
        "border-b border-border/20 last:border-b-0" // Subtle border for separation
      )}
      data-task-id={task.id}
    >
      <div className="flex items-start space-x-3">
        <Checkbox
          id={`task-${task.id}`}
          checked={task.completed}
          onCheckedChange={() => onToggleComplete(task.id)}
          className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary-foreground shrink-0"
          aria-label={task.completed ? "Mark task as incomplete" : "Mark task as complete"}
        />
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-base font-medium text-foreground",
              task.completed && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </p>
          {task.details && (
            <p className={cn("text-sm text-muted-foreground mt-1 whitespace-pre-wrap break-words", task.completed && "line-through")}>
              {task.details}
            </p>
          )}
          {task.reminderAt && !task.completed && (
            <div className="flex items-center text-xs text-amber-600 dark:text-amber-500 mt-2">
              <Clock className="h-3.5 w-3.5 mr-1.5 shrink-0" />
              Reminder: {format(new Date(task.reminderAt), "MMM d, yyyy 'at' h:mm a")}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDeleteTask(task.id)}
          aria-label="Delete task"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 ml-2 shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TaskItem;
