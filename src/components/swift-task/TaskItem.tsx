
"use client";

import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Clock, CalendarDays, Tag, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
        variant = "default"; // Using primary color for medium
        className = "bg-amber-500 hover:bg-amber-600 text-white"; // Custom amber color
        text = "Medium";
        break;
      case 'low':
        variant = "secondary"; // Muted blue/green from theme
        className = "bg-sky-500 hover:bg-sky-600 text-white";
        text = "Low";
        break;
    }
    return <Badge variant={variant} className={cn("text-xs capitalize", className)}>{text}</Badge>;
  };
  
  const isOverdue = task.dueDate && !task.completed && task.dueDate < Date.now();

  return (
    <div
      ref={itemRef}
      className={cn(
        "transition-all duration-300 ease-in-out p-4 rounded-lg hover:shadow-md",
        task.completed ? "bg-muted/30 opacity-70" : "bg-card",
        isHighlighted && "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg",
        isOverdue && "border-l-4 border-destructive",
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
            {task.dueDate && !task.completed && (
              <div className={cn("flex items-center", isOverdue ? "text-destructive font-semibold" : "text-muted-foreground")}>
                {isOverdue && <AlertTriangle className="h-3.5 w-3.5 mr-1.5 shrink-0 text-destructive" />}
                <CalendarDays className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                {isOverdue && <span className="ml-1">(Overdue)</span>}
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
