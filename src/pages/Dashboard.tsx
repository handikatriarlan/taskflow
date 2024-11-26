import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Plus, Layout } from 'lucide-react';
import Button from '../components/Button';
import ListCard from '../components/ListCard';
import { useTaskLists } from '../hooks/useTaskLists';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  order: number;
  listId: string;
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { 
    lists, 
    isLoading: isTasksLoading, 
    addList, 
    deleteList, 
    addTask, 
    updateTask, 
    deleteTask,
    setLists 
  } = useTaskLists();
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeList, setActiveList] = useState<string | null>(null);

  const handleAddList = async () => {
    const title = prompt('Enter list title:');
    if (!title) return;
    await addList(title);
  };

  const handleAddTask = async (listId: string, data: { 
    title: string; 
    priority: 'low' | 'medium' | 'high';
    deadline?: string;
  }) => {
    await addTask(listId, data.title, data.priority, data.deadline);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = lists
      .flatMap(list => list.tasks)
      .find(task => task.id === active.id);
    
    if (task) {
      setActiveTask(task);
      setActiveList(task.listId);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !activeTask) return;

    const activeListId = lists.find(list => 
      list.tasks.some(task => task.id === active.id)
    )?.id;

    const overListId = lists.find(list => 
      list.tasks.some(task => task.id === over.id) || list.id === over.id
    )?.id;

    if (!activeListId || !overListId || activeListId === overListId) return;

    setLists(lists.map(list => {
      if (list.id === activeListId) {
        return {
          ...list,
          tasks: list.tasks.filter(task => task.id !== active.id)
        };
      }
      if (list.id === overListId) {
        const overTask = list.tasks.find(task => task.id === over.id);
        const updatedTasks = [...list.tasks];
        const insertIndex = overTask 
          ? updatedTasks.indexOf(overTask)
          : updatedTasks.length;

        updatedTasks.splice(insertIndex, 0, {
          ...activeTask,
          listId: overListId,
          order: insertIndex
        });

        return {
          ...list,
          tasks: updatedTasks.map((task, index) => ({
            ...task,
            order: index
          }))
        };
      }
      return list;
    }));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !activeTask) return;

    const activeListId = lists.find(list => 
      list.tasks.some(task => task.id === active.id)
    )?.id;

    const overListId = lists.find(list => 
      list.tasks.some(task => task.id === over.id) || list.id === over.id
    )?.id;

    if (activeListId && overListId) {
      if (activeListId === overListId) {
        // Reorder within the same list
        const list = lists.find(l => l.id === activeListId)!;
        const oldIndex = list.tasks.findIndex(t => t.id === active.id);
        const newIndex = list.tasks.findIndex(t => t.id === over.id);

        setLists(lists.map(l => {
          if (l.id === activeListId) {
            const newTasks = arrayMove(l.tasks, oldIndex, newIndex);
            return {
              ...l,
              tasks: newTasks.map((task, index) => ({
                ...task,
                order: index
              }))
            };
          }
          return l;
        }));

        await updateTask(active.id, { 
          order: newIndex,
          listId: activeListId
        });
      } else {
        // Move to different list
        const overList = lists.find(l => l.id === overListId)!;
        const overTask = overList.tasks.find(t => t.id === over.id);
        const newOrder = overTask 
          ? overList.tasks.indexOf(overTask)
          : overList.tasks.length;

        await updateTask(active.id, {
          listId: overListId,
          order: newOrder
        });
      }
    }

    setActiveTask(null);
    setActiveList(null);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900">
      <header className="bg-gray-900/50 shadow-lg backdrop-blur-sm sticky top-0 z-10 border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Layout className="h-6 w-6 text-indigo-400" />
              <h1 className="text-2xl font-bold text-white">Taskflow</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {user?.name}</span>
              <Button
                variant="ghost"
                onClick={handleLogout}
                isLoading={isLoading}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <span>Your Lists</span>
            <span className="text-sm text-gray-400">({lists.length})</span>
          </h2>
          <Button onClick={handleAddList} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add List</span>
          </Button>
        </div>

        <DndContext
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCorners}
        >
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            layout
          >
            {lists.map((list) => (
              <ListCard
                key={list.id}
                id={list.id}
                title={list.title}
                tasks={list.tasks}
                onAddTask={(data) => handleAddTask(list.id, data)}
                onDeleteList={() => deleteList(list.id)}
                onTaskComplete={(taskId) => 
                  updateTask(taskId, { completed: !list.tasks.find(t => t.id === taskId)?.completed })
                }
                onTaskDelete={deleteTask}
              />
            ))}
          </motion.div>
        </DndContext>

        {lists.length === 0 && !isTasksLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <p className="text-gray-400 mb-4">No lists yet. Create your first list to get started!</p>
            <Button onClick={handleAddList} className="flex items-center space-x-2 mx-auto">
              <Plus className="h-4 w-4" />
              <span>Add Your First List</span>
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
}