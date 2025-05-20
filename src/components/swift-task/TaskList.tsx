
"use client";

import type { FC } from 'react';
import type { Task } from '@/lib/types';
import TaskItem from './TaskItem';
import { ClipboardList, FolderKanban } from 'lucide-react'; // Added FolderKanban for category icon

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenEditModal: (task: Task) => void;
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

const sortTasksInCategory = (tasks: Task[]): Task[] => {
  return tasks.sort((a, b) => {
    const priorityComparison = getPriorityValue(a.priority) - getPriorityValue(b.priority);
    if (priorityComparison !== 0) return priorityComparison;
    return b.createdAt - a.createdAt; // Newest first as a tie-breaker
  });
};

const groupTasksByCategory = (tasks: Task[]): Map<string, Task[]> => {
  const grouped = new Map<string, Task[]>();
  tasks.forEach(task => {
    const categoryKey = task.category || 'Uncategorized';
    if (!grouped.has(categoryKey)) {
      grouped.set(categoryKey, []);
    }
    grouped.get(categoryKey)!.push(task);
  });

  // Sort tasks within each category
  grouped.forEach((taskList, categoryKey) => {
    grouped.set(categoryKey, sortTasksInCategory(taskList));
  });
  
  // Sort categories themselves (e.g., alphabetically, with "Uncategorized" last or first)
  // For simplicity, let's convert map to array of [key, value] pairs and sort by key
  // then reconstruct into a new Map to preserve order.
  const sortedEntries = Array.from(grouped.entries()).sort(([keyA], [keyB]) => {
    if (keyA === 'Uncategorized') return 1; // Push "Uncategorized" to the end
    if (keyB === 'Uncategorized') return -1;
    return keyA.localeCompare(keyB); // Alphabetical sort for other categories
  });
  
  return new Map(sortedEntries);
};


const TaskList: FC<TaskListProps> = ({ tasks, onToggleComplete, onDeleteTask, onOpenEditModal, highlightedTaskId }) => {

  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  const groupedActiveTasks = groupTasksByCategory(activeTasks);
  const groupedCompletedTasks = groupTasksByCategory(completedTasks);

  if (tasks.length === 0) {
    return (
      <div className="text-center py-10 flex flex-col items-center justify-center h-full">
        <ClipboardList className="h-12 w-12 text-muted-foreground/70 mb-4" />
        <p className="text-md font-semibold text-foreground">No tasks match your current filters.</p>
        <p className="text-xs text-muted-foreground">Try adjusting your filters or add a new task.</p>
      </div>
    );
  }
  
  const renderTaskGroup = (groupedTasks: Map<string, Task[]>, groupTitle: string, isCompletedGroup: boolean) => {
    if (Array.from(groupedTasks.values()).every(list => list.length === 0)) {
      if (!isCompletedGroup && activeTasks.length === 0 && tasks.length > 0) { // Show if all tasks are completed but some match filters
         return <p className="px-1 pt-2 text-sm text-muted-foreground">No active tasks match your current filters.</p>;
      }
      if (isCompletedGroup && completedTasks.length === 0 && tasks.length > 0) {
         return <p className="px-1 pt-2 text-sm text-muted-foreground">No completed tasks match your current filters.</p>;
      }
      return null;
    }

    return (
      <div>
        <h2 className={`text-md font-semibold mb-2 px-1 pt-2 ${isCompletedGroup ? 'text-muted-foreground' : 'text-foreground'}`}>
          {groupTitle}
        </h2>
        {Array.from(groupedTasks.entries()).map(([category, taskList]) => (
          taskList.length > 0 && (
            <div key={category} className="mb-3">
              <h3 className="text-sm font-medium text-foreground/80 mb-1.5 px-1 flex items-center">
                <FolderKanban className="h-4 w-4 mr-2 text-primary/70" />
                {category} 
                <span className="ml-1.5 text-xs text-muted-foreground">({taskList.length})</span>
              </h3>
              <div className="space-y-0">
                {taskList.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onDeleteTask={onDeleteTask}
                    onOpenEditModal={onOpenEditModal}
                    isHighlighted={task.id === highlightedTaskId}
                  />
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    );
  };


  return (
    <div className="space-y-0">
      {renderTaskGroup(groupedActiveTasks, "Active Tasks", false)}
      {renderTaskGroup(groupedCompletedTasks, "Completed Tasks", true)}
    </div>
  );
};

export default TaskList;
