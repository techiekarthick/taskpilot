import type { FC } from 'react';
import { ClipboardList } from 'lucide-react';

const Header: FC = () => {
  return (
    <header className="py-5 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center space-x-2">
        <ClipboardList className="h-8 w-8 text-primary-foreground bg-primary p-1.5 rounded-md shadow-md" />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          SwiftTask
        </h1>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Your friendly to-do list for organized productivity.
      </p>
    </header>
  );
};

export default Header;
