
import type { FC } from 'react';
import { ClipboardList } from 'lucide-react';
import ThemeToggleButton from './ThemeToggleButton';

const Header: FC = () => {
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
      </div>
      <ThemeToggleButton />
    </header>
  );
};

export default Header;
