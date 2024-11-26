import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, Grip, Trash2, Clock, AlertCircle, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface TaskCardProps {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
  onComplete: () => void;
  onDelete: () => void;
}

export default function TaskCard({ 
  id, 
  title, 
  completed, 
  priority,
  deadline,
  onComplete, 
  onDelete 
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    low: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20',
    medium: 'bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/20',
    high: 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20'
  };

  const priorityIcons = {
    low: <Clock className="h-4 w-4 text-blue-500" />,
    medium: <Clock className="h-4 w-4 text-yellow-500" />,
    high: <AlertCircle className="h-4 w-4 text-red-500" />
  };

  const deadlineDate = deadline ? new Date(deadline) : null;
  const isOverdue = deadlineDate && deadlineDate < new Date();

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`group flex items-center space-x-3 p-4 rounded-xl border ${
        priorityColors[priority]
      } backdrop-blur-sm transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-105' : ''
      } ${completed ? 'opacity-60' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="touch-none text-gray-400 hover:text-gray-300 transition-colors cursor-grab active:cursor-grabbing"
      >
        <Grip className="h-4 w-4" />
      </button>

      <button
        onClick={onComplete}
        className={`flex-shrink-0 w-5 h-5 rounded-full border ${
          completed
            ? 'bg-green-500 border-green-600'
            : 'border-gray-500 hover:border-gray-400'
        } transition-all duration-200 flex items-center justify-center`}
      >
        {completed && <Check className="h-3 w-3 text-white" />}
      </button>

      <div className="flex-grow">
        <div className="flex items-center space-x-2">
          <span className={`text-sm ${completed ? 'text-gray-400 line-through' : 'text-white'}`}>
            {title}
          </span>
          <span className="flex-shrink-0">{priorityIcons[priority]}</span>
        </div>
        {deadlineDate && (
          <div className={`flex items-center space-x-1 mt-1 text-xs ${
            isOverdue ? 'text-red-400' : 'text-gray-400'
          }`}>
            <Calendar className="h-3 w-3" />
            <span>
              {deadlineDate.toLocaleDateString()} {deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>

      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all duration-200"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </motion.div>
  );
}