import { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import Button from './Button';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
    title: string;
    priority: 'low' | 'medium' | 'high';
    deadline?: string;
    }) => void;
}

export default function TaskDialog({ isOpen, onClose, onSubmit }: TaskDialogProps) {
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('12:00');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
        title,
        priority,
        deadline: selectedDate && selectedTime ? `${selectedDate}T${selectedTime}:00` : undefined
    });
    setTitle('');
    setPriority('medium');
    setSelectedDate('');
    setSelectedTime('12:00');
    onClose();
    };

    const today = new Date().toISOString().split('T')[0];

    return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 shadow-xl relative"
        >
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Create New Task</h2>
            <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
            >
            <X className="h-5 w-5" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
                Task Title
            </label>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                placeholder="Enter task title"
                required
            />
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
                Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map((p) => (
                <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                    priority === p
                        ? p === 'low'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                        : p === 'medium'
                        ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                        : 'bg-red-500/20 border-red-500 text-red-400'
                        : 'border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
                ))}
            </div>
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
                Deadline
            </label>
            <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                <input
                    type="date"
                    value={selectedDate}
                    min={today}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                />
                <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                />
                </div>
                {selectedDate && (
                <p className="text-sm text-gray-400">
                    Deadline set for: {new Date(`${selectedDate}T${selectedTime}`).toLocaleString()}
                </p>
                )}
            </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
            <Button variant="ghost" onClick={onClose}>
                Cancel
            </Button>
            <Button type="submit">
                Create Task
            </Button>
            </div>
        </form>
        </motion.div>
    </div>
    );
}