import type { FC } from 'react';
import { ClipboardList } from 'lucide-react';

const Header: FC = () => {
  return (
    <header className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center space-x-3">
        <ClipboardList className="h-10 w-10 text-primary-foreground bg-primary p-2 rounded-lg shadow-md" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          SwiftTask
        </h1>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Your friendly to-do list for organized productivity.
      </p>
    </header>
  );
};

export default Header;
