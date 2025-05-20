"use client";

import type { FC } from 'react';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

const TaskItem: FC<TaskItemProps> = ({ task, onToggleComplete, onDeleteTask }) => {
  return (
    <Card
      className={cn(
        "transition-all duration-300 ease-in-out shadow-md hover:shadow-lg",
        task.completed ? "bg-muted/30 opacity-60" : "bg-card"
      )}
    >
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-start space-x-2.5">
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
                "text-base font-semibold",
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
      <CardFooter className="flex justify-end space-x-1.5 pt-1 pb-2 px-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteTask(task.id)}
          aria-label="Delete task"
          className="text-destructive hover:bg-destructive/10 h-7 px-2"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TaskItem;
