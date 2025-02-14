// @ts-nocheck
import { useState, useEffect } from 'react';
import { Plus, Calendar, Check, Clock } from 'lucide-react';

interface TimelineItem {
  id: string;
  title: string;
  date: string;
  description: string;
  completed: boolean;
  category: 'planning' | 'vendor' | 'personal' | 'ceremony' | 'reception';
}

const categories = {
  planning: { label: 'Planning', color: 'bg-blue-100 text-blue-800' },
  vendor: { label: 'Vendor', color: 'bg-purple-100 text-purple-800' },
  personal: { label: 'Personal', color: 'bg-pink-100 text-pink-800' },
  ceremony: { label: 'Ceremony', color: 'bg-emerald-100 text-emerald-800' },
  reception: { label: 'Reception', color: 'bg-amber-100 text-amber-800' },
};

export function Timeline() {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState<Partial<TimelineItem>>({
    category: 'planning',
    completed: false,
  });

  useEffect(() => {
    const savedItems = localStorage.getItem('wedding-timeline');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('wedding-timeline', JSON.stringify(items));
  }, [items]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.title && newItem.date) {
      setItems(prev => [...prev, { ...newItem, id: Date.now().toString() } as TimelineItem]);
      setNewItem({ category: 'planning', completed: false });
      setShowForm(false);
    }
  };

  const toggleComplete = (id: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Wedding Timeline</h1>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Event
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Timeline Event</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newItem.title || ''}
                  onChange={e => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={newItem.date || ''}
                  onChange={e => setNewItem(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newItem.description || ''}
                  onChange={e => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newItem.category}
                  onChange={e => setNewItem(prev => ({ ...prev, category: e.target.value as TimelineItem['category'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                >
                  {Object.entries(categories).map(([value, { label }]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700"
                >
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {items
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map((item, index) => (
            <div
              key={item.id}
              className={`relative pb-8 ${index === items.length - 1 ? '' : 'border-l border-gray-200'}`}
            >
              <div className="relative flex items-start space-x-3">
                <div>
                  <div className="relative px-1">
                    <div className={`h-8 w-8 ${item.completed ? 'bg-emerald-100' : 'bg-gray-100'} rounded-full flex items-center justify-center ring-8 ring-white`}>
                      {item.completed ? (
                        <Check className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div>
                    <div className="text-sm">
                      <span className={`font-medium ${item.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {item.title}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    <p>{item.description}</p>
                  </div>
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={() => toggleComplete(item.id)}
                      className={`text-sm font-medium ${item.completed ? 'text-gray-400 hover:text-gray-500' : 'text-emerald-600 hover:text-emerald-700'}`}
                    >
                      {item.completed ? 'Mark Incomplete' : 'Mark Complete'}
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-sm font-medium text-rose-600 hover:text-rose-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

        {items.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events added yet</h3>
            <p className="text-gray-500">Click the "Add Event" button to create your first timeline event.</p>
          </div>
        )}
      </div>
    </div>
  );
}
