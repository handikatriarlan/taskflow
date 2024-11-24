import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, Grip, Trash2 } from 'lucide-react';

interface TaskCardProps {
  id: string;
  title: string;
  completed: boolean;
  onComplete: () => void;
  onDelete: () => void;
}

export default function TaskCard({ 
  id, 
  title, 
  completed, 
  onComplete, 
  onDelete 
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center space-x-2 p-3 rounded-lg ${
        completed ? 'bg-gray-700/30' : 'bg-gray-700/50'
      } backdrop-blur-sm hover:bg-gray-700/70 transition-colors`}
    >
      <button
        {...attributes}
        {...listeners}
        className="touch-none text-gray-500 hover:text-gray-400"
      >
        <Grip className="h-4 w-4" />
      </button>

      <button
        onClick={onComplete}
        className={`flex-shrink-0 w-5 h-5 rounded border ${
          completed
            ? 'bg-green-500 border-green-600'
            : 'border-gray-600 hover:border-gray-500'
        } transition-colors`}
      >
        {completed && <Check className="h-4 w-4 text-white" />}
      </button>

      <span
        className={`flex-grow text-sm ${
          completed ? 'text-gray-400 line-through' : 'text-white'
        }`}
      >
        {title}
      </span>

      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition-opacity"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}