
import type { FC } from 'react';
import { ClipboardList, CheckCircle } from 'lucide-react';
import ThemeToggleButton from './ThemeToggleButton';

interface HeaderProps {
  completedTasksCount: number;
  totalTasksCount: number;
}

const Header: FC<HeaderProps> = ({ completedTasksCount, totalTasksCount }) => {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-start">
      <div>
        <div className="flex items-center space-x-2">
          <ClipboardList className="h-7 w-7 text-primary-foreground bg-primary p-1.5 rounded-md shadow-md" />
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            TaskPilot
          </h1>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Steer your day and get things done.
        </p>
        {totalTasksCount > 0 && (
          <div className="mt-2 flex items-center text-xs text-muted-foreground">
            <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-green-500" />
            <span>{completedTasksCount} of {totalTasksCount} tasks completed</span>
          </div>
        )}
      </div>
      <ThemeToggleButton />
    </header>
  );
};

export default Header;
