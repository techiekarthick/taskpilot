
"use client";

import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Clock, Tag, AlertTriangle, Pencil } from 'lucide-react'; // Added Pencil
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenEditModal: (task: Task) => void; // New prop
  isHighlighted?: boolean;
}

const TaskItem: FC<TaskItemProps> = ({ task, onToggleComplete, onDeleteTask, onOpenEditModal, isHighlighted }) => {
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHighlighted && itemRef.current) {
      itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isHighlighted]);

  const getPriorityBadge = () => {
    if (!task.priority || task.priority === 'none') return null;

    let variant: "default" | "destructive" | "secondary" | "outline" = "default";
    let className = "";
    let text = "";

    switch (task.priority) {
      case 'high':
        variant = "destructive";
        text = "High";
        break;
      case 'medium':
        variant = "default"; 
        className = "bg-amber-500 hover:bg-amber-600 text-white"; 
        text = "Medium";
        break;
      case 'low':
        variant = "secondary";
        className = "bg-sky-500 hover:bg-sky-600 text-white";
        text = "Low";
        break;
    }
    return <Badge variant={variant} className={cn("text-xs capitalize", className)}>{text}</Badge>;
  };
  
  return (
    <div
      ref={itemRef}
      className={cn(
        "transition-all duration-300 ease-in-out p-4 rounded-lg hover:shadow-md",
        task.completed ? "bg-muted/30 opacity-70" : "bg-card",
        isHighlighted && "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg",
        "border-b border-border/20 last:border-b-0" 
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
          <div className="flex items-center justify-between">
            <p
              className={cn(
                "text-base font-medium text-foreground",
                task.completed && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </p>
             {!task.completed && getPriorityBadge()}
          </div>

          {task.details && (
            <p className={cn("text-sm text-muted-foreground mt-1 whitespace-pre-wrap break-words", task.completed && "line-through")}>
              {task.details}
            </p>
          )}
          
          <div className="mt-2 space-y-1.5 text-xs">
            {task.category && (
              <div className={cn("flex items-center text-muted-foreground", task.completed && "line-through")}>
                <Tag className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                Category: {task.category}
              </div>
            )}
            {task.reminderAt && !task.completed && (
              <div className="flex items-center text-amber-600 dark:text-amber-500">
                <Clock className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                Reminder: {format(new Date(task.reminderAt), "MMM d, yyyy 'at' h:mm a")}
              </div>
            )}
          </div>

        </div>
        <div className="flex flex-col sm:flex-row items-center shrink-0 ml-2 space-y-1 sm:space-y-0 sm:space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenEditModal(task)}
            aria-label="Edit task"
            className="text-muted-foreground hover:text-primary hover:bg-primary/10 h-7 w-7"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDeleteTask(task.id)}
            aria-label="Delete task"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
