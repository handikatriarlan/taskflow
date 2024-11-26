import { useState } from 'react'
import { X, Calendar } from 'lucide-react'
import Button from './Button'

interface TaskDialogProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: {
        title: string
        priority: 'low' | 'medium' | 'high'
        deadline?: string
    }) => void
}

export default function TaskDialog({
    isOpen,
    onClose,
    onSubmit,
}: TaskDialogProps) {
    const [title, setTitle] = useState('')
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
    const [deadline, setDeadline] = useState('')

    if (!isOpen) return null

    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
        title,
        priority,
        deadline: deadline || undefined,
    })
    setTitle('')
    setPriority('medium')
    setDeadline('')
    onClose()
    }

    return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
        <div className='bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 shadow-xl'>
        <div className='flex justify-between items-center mb-4'>
            <h2 className='text-xl font-semibold text-white'>Create New Task</h2>
            <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-300 transition-colors'
            >
            <X className='h-5 w-5' />
            </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
            <label className='block text-sm font-medium text-gray-300 mb-1'>
                Task Title
            </label>
            <input
                type='text'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className='w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white'
                placeholder='Enter task title'
                required
            />
            </div>

            <div>
            <label className='block text-sm font-medium text-gray-300 mb-1'>
                Priority
            </label>
            <div className='grid grid-cols-3 gap-2'>
                {(['low', 'medium', 'high'] as const).map((p) => (
                <button
                    key={p}
                    type='button'
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
            <label className='block text-sm font-medium text-gray-300 mb-1'>
                Deadline
            </label>
            <div className='relative'>
                <input
                type='datetime-local'
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className='w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white'
                />
                <Calendar className='absolute right-3 top-2.5 h-5 w-5 text-gray-400' />
            </div>
            </div>

            <div className='flex justify-end space-x-3 pt-4'>
            <Button variant='ghost' onClick={onClose}>
                Cancel
            </Button>
            <Button type='submit'>Create Task</Button>
            </div>
        </form>
        </div>
    </div>
    )
}
