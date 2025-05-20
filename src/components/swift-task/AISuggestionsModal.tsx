"use client";

import type { FC } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { SuggestedTask, Task } from '@/lib/types';
import { Loader2, PlusCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AISuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle?: string;
  suggestions: SuggestedTask[];
  isLoading: boolean;
  onAddSuggestionAsTask: (title: string) => void;
}

const AISuggestionsModal: FC<AISuggestionsModalProps> = ({
  isOpen,
  onClose,
  taskTitle,
  suggestions,
  isLoading,
  onAddSuggestionAsTask,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl">AI Subtask Suggestions</DialogTitle>
          {taskTitle && (
            <DialogDescription>
              Suggestions for &quot;{taskTitle}&quot;
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Generating suggestions...</p>
            </div>
          ) : suggestions.length > 0 ? (
            <ScrollArea className="h-[200px] pr-4">
              <ul className="space-y-2">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.id}
                    className="flex items-center justify-between p-2 rounded-md border bg-background hover:bg-accent/20"
                  >
                    <span className="text-sm">{suggestion.title}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onAddSuggestionAsTask(suggestion.title)}
                      className="text-primary hover:text-primary-foreground hover:bg-primary"
                      aria-label={`Add suggestion ${suggestion.title} as a new task`}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <p className="text-center text-muted-foreground">No suggestions available or task too short.</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AISuggestionsModal;
