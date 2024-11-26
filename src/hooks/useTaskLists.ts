import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  order: number;
  listId: string;
  priority?: 'low' | 'medium' | 'high';
}

interface List {
  id: string;
  title: string;
  order: number;
  tasks: Task[];
}

export function useTaskLists() {
  const [lists, setLists] = useState<List[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLists = async () => {
    try {
      const response = await axios.get('/api/lists');
      setLists(response.data.sort((a: List, b: List) => a.order - b.order));
    } catch (error) {
      toast.error('Failed to fetch lists');
    }
  };

  const addList = async (title: string) => {
    try {
      const response = await axios.post('/api/lists', {
        title,
        order: lists.length
      });
      setLists([...lists, response.data]);
      toast.success('List created successfully');
    } catch (error) {
      toast.error('Failed to create list');
    }
  };

  const deleteList = async (listId: string) => {
    try {
      await axios.delete(`/api/lists/${listId}`);
      setLists(lists.filter(list => list.id !== listId));
      toast.success('List deleted successfully');
    } catch (error) {
      toast.error('Failed to delete list');
    }
  };

  const addTask = async (listId: string, title: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
    try {
      const response = await axios.post(`/api/lists/${listId}/tasks`, {
        title,
        order: lists.find(list => list.id === listId)?.tasks.length || 0,
        priority
      });

      setLists(lists.map(list => {
        if (list.id === listId) {
          return { ...list, tasks: [...list.tasks, { ...response.data, priority }] };
        }
        return list;
      }));
      toast.success('Task created successfully');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    setIsLoading(true);
    try {
      const response = await axios.patch(`/api/tasks/${taskId}`, updates);
      setLists(lists.map(list => ({
        ...list,
        tasks: list.tasks.map(task => 
          task.id === taskId ? { ...response.data, priority: task.priority } : task
        )
      })));
    } catch (error) {
      toast.error('Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    setIsLoading(true);
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      setLists(lists.map(list => ({
        ...list,
        tasks: list.tasks.filter(task => task.id !== taskId)
      })));
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  return {
    lists,
    isLoading,
    addList,
    deleteList,
    addTask,
    updateTask,
    deleteTask,
    setLists
  };
}