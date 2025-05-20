
"use client";

import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card
      ref={itemRef}
      className={cn(
        "transition-all duration-300 ease-in-out shadow-md hover:shadow-lg",
        task.completed ? "bg-muted/30 opacity-60" : "bg-card",
        isHighlighted && "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-xl"
      )}
      data-task-id={task.id}
    >
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-start space-x-2">
          <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            onCheckedChange={() => onToggleComplete(task.id)}
            className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary-foreground"
            aria-label={task.completed ? "Mark task as incomplete" : "Mark task as complete"}
          />
          <div className="flex-1">
            <CardTitle
              className={cn(
                "text-sm font-semibold", // Reduced font size
                task.completed && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </CardTitle>
            {task.details && (
              <p className={cn("text-xs text-muted-foreground mt-0.5", task.completed && "line-through")}>
                {task.details}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pt-1 pb-1">
        {task.reminderAt && !task.completed && (
          <div className="flex items-center text-xs text-amber-600 dark:text-amber-400 mt-1">
            <Clock className="h-3 w-3 mr-1" />
            Reminder: {format(new Date(task.reminderAt), "MMM d, yyyy 'at' h:mm a")}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-1 pt-1 pb-2 px-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteTask(task.id)}
          aria-label="Delete task"
          className="text-destructive hover:bg-destructive/10 h-6 px-1.5" // Made button smaller
        >
          <Trash2 className="h-3 w-3" /> {/* Made icon smaller */}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TaskItem;
