import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, Grip, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  order: number;
  listId: string;
}

interface TaskItemProps {
  task: Task;
  onDelete: (taskId: string) => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
}

function TaskItem({ task, onDelete, onUpdate }: TaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center space-x-2 p-3 rounded-lg ${
        task.completed ? 'bg-gray-700/30' : 'bg-gray-700/50'
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
        onClick={() => onUpdate(task.id, { completed: !task.completed })}
        className={`flex-shrink-0 w-5 h-5 rounded border ${
          task.completed
            ? 'bg-green-500 border-green-600'
            : 'border-gray-600 hover:border-gray-500'
        } transition-colors`}
      >
        {task.completed && <Check className="h-4 w-4 text-white" />}
      </button>

      <span
        className={`flex-grow text-sm ${
          task.completed ? 'text-gray-400 line-through' : 'text-white'
        }`}
      >
        {task.title}
      </span>

      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition-opacity"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

interface TaskListProps {
  tasks: Task[];
  listId: string;
  onTasksChange: (tasks: Task[]) => void;
}

export default function TaskList({ tasks, listId, onTasksChange }: TaskListProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    setIsLoading(true);
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      onTasksChange(tasks.filter(task => task.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    setIsLoading(true);
    try {
      const response = await axios.patch(`/api/tasks/${taskId}`, updates);
      onTasksChange(
        tasks.map(task => (task.id === taskId ? response.data : task))
      );
    } catch (error) {
      toast.error('Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2" style={{ opacity: isLoading ? 0.7 : 1 }}>
      {tasks
        .sort((a, b) => a.order - b.order)
        .map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onDelete={handleDeleteTask}
            onUpdate={handleUpdateTask}
          />
        ))}
      {tasks.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          No tasks yet. Add one above!
        </div>
      )}
    </div>
  );
}