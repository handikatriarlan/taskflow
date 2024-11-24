import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Plus } from 'lucide-react';
import Button from '../components/Button';
import ListCard from '../components/ListCard';
import { useTaskLists } from '../hooks/useTaskLists';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  order: number;
  listId: string;
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

  const handleAddTask = async (listId: string) => {
    const title = prompt('Enter task title:');
    if (!title) return;
    await addTask(listId, title);
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
    if (!over) return;

    const activeTask = lists
      .flatMap(list => list.tasks)
      .find(task => task.id === active.id);
    
    if (!activeTask) return;

    const overList = lists.find(list => 
      list.tasks.some(task => task.id === over.id) || list.id === over.id
    );

    if (!overList || activeTask.listId === overList.id) return;

    setLists(lists.map(list => {
      if (list.id === activeTask.listId) {
        return {
          ...list,
          tasks: list.tasks.filter(task => task.id !== activeTask.id)
        };
      }
      if (list.id === overList.id) {
        return {
          ...list,
          tasks: [...list.tasks, { ...activeTask, listId: overList.id }]
        };
      }
      return list;
    }));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !activeTask) return;

    const overList = lists.find(list => 
      list.tasks.some(task => task.id === over.id) || list.id === over.id
    );

    if (!overList) return;

    try {
      if (activeList !== overList.id) {
        await updateTask(activeTask.id, { listId: overList.id });
      }
    } catch (error) {
      // Error handling is done in the hook
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <header className="bg-gray-800/50 shadow-lg backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Taskflow</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {user?.name}</span>
              <Button
                variant="secondary"
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
          <h2 className="text-xl font-semibold text-white">Your Lists</h2>
          <Button onClick={handleAddList} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add List</span>
          </Button>
        </div>

        <DndContext
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <ListCard
                key={list.id}
                id={list.id}
                title={list.title}
                tasks={list.tasks}
                onAddTask={() => handleAddTask(list.id)}
                onDeleteList={() => deleteList(list.id)}
                onTaskComplete={(taskId) => 
                  updateTask(taskId, { completed: !list.tasks.find(t => t.id === taskId)?.completed })
                }
                onTaskDelete={deleteTask}
              />
            ))}
          </div>
        </DndContext>

        {lists.length === 0 && !isTasksLoading && (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No lists yet. Create your first list to get started!</p>
            <Button onClick={handleAddList} className="flex items-center space-x-2 mx-auto">
              <Plus className="h-4 w-4" />
              <span>Add Your First List</span>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}