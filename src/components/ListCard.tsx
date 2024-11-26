import { Plus, Trash2, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import TaskCard from './TaskCard';
import TaskDialog from './TaskDialog';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  order: number;
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
}

interface ListCardProps {
  id: string;
  title: string;
  tasks: Task[];
  onAddTask: (data: { title: string; priority: 'low' | 'medium' | 'high'; deadline?: string }) => void;
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
  const [showOptions, setShowOptions] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const { setNodeRef } = useDroppable({ id });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-gray-800/40 rounded-xl p-4 backdrop-blur-sm border border-gray-700/50 shadow-xl"
        ref={setNodeRef}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white flex items-center space-x-2">
            <span>{title}</span>
            <span className="text-sm text-gray-400">({tasks.length})</span>
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              onClick={() => setShowTaskDialog(true)}
              className="p-2 hover:bg-gray-700/50"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <div className="relative">
              <Button
                variant="ghost"
                onClick={() => setShowOptions(!showOptions)}
                className="p-2 hover:bg-gray-700/50"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
              {showOptions && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg bg-gray-800 shadow-lg border border-gray-700 py-1 z-10">
                  <button
                    onClick={() => {
                      onDeleteList();
                      setShowOptions(false);
                    }}
                    className="w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700/50 flex items-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete List</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tasks
              .sort((a, b) => a.order - b.order)
              .map(task => (
                <TaskCard
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  completed={task.completed}
                  priority={task.priority}
                  deadline={task.deadline}
                  onComplete={() => onTaskComplete(task.id)}
                  onDelete={() => onTaskDelete(task.id)}
                />
              ))}
            {tasks.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm mb-4">No tasks yet</p>
                <Button
                  variant="ghost"
                  onClick={() => setShowTaskDialog(true)}
                  className="mx-auto flex items-center space-x-2 text-indigo-400 hover:text-indigo-300"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Task</span>
                </Button>
              </div>
            )}
          </div>
        </SortableContext>
      </motion.div>

      <TaskDialog
        isOpen={showTaskDialog}
        onClose={() => setShowTaskDialog(false)}
        onSubmit={onAddTask}
      />
    </>
  );
}