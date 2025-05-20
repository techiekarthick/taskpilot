"use client";

import type { FC } from 'react';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onSuggestSubtasks: (task: Task) => void;
}

const TaskItem: FC<TaskItemProps> = ({ task, onToggleComplete, onDeleteTask, onSuggestSubtasks }) => {
  return (
    <Card 
      className={cn(
        "transition-all duration-300 ease-in-out shadow-md hover:shadow-lg",
        task.completed ? "bg-muted/50 opacity-70" : "bg-card"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-3">
          <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            onCheckedChange={() => onToggleComplete(task.id)}
            className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary-foreground"
            aria-label={task.completed ? "Mark task as incomplete" : "Mark task as complete"}
          />
          <div className="flex-1">
            <CardTitle 
              className={cn(
                "text-lg font-semibold",
                task.completed && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </CardTitle>
            {task.details && (
              <p className={cn("text-sm text-muted-foreground mt-1", task.completed && "line-through")}>
                {task.details}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardFooter className="flex justify-end space-x-2 pt-2 pb-3 px-4">
        {!task.completed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSuggestSubtasks(task)}
            aria-label="Suggest subtasks"
            className="text-accent-foreground hover:bg-accent/80"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Suggest
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteTask(task.id)}
          aria-label="Delete task"
          className="text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TaskItem;
