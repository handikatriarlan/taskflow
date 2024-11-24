import { Plus, Trash2 } from 'lucide-react';
import Button from './Button';
import TaskCard from './TaskCard';
import { SortableContext } from '@dnd-kit/sortable';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

interface ListCardProps {
  id: string;
  title: string;
  tasks: Task[];
  onAddTask: () => void;
  onDeleteList: () => void;
  onTaskComplete: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
}

export default function ListCard({
  id,
  title,
  tasks,
  onAddTask,
  onDeleteList,
  onTaskComplete,
  onTaskDelete
}: ListCardProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">{title}</h3>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            onClick={onAddTask}
            className="p-2"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            onClick={onDeleteList}
            className="p-2 hover:bg-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <SortableContext items={tasks.map(task => task.id)}>
        <div className="space-y-2">
          {tasks
            .sort((a, b) => a.order - b.order)
            .map(task => (
              <TaskCard
                key={task.id}
                id={task.id}
                title={task.title}
                completed={task.completed}
                onComplete={() => onTaskComplete(task.id)}
                onDelete={() => onTaskDelete(task.id)}
              />
            ))}
          {tasks.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              No tasks yet. Add one above!
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}