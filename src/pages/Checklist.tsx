import { useState, useEffect } from 'react';
import { Plus, Check, Clock, ChevronUp, ChevronDown, Calendar } from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  category: string;
  priority: 'high' | 'medium' | 'low';
  assignedTo?: string;
}

const categories = [
  'Planning & Coordination',
  'Venue & Rentals',
  'Attire & Beauty',
  'Photography & Video',
  'Food & Beverage',
  'Decor & Flowers',
  'Music & Entertainment',
  'Stationery',
  'Transportation',
  'Legal & Documentation',
  'Honeymoon',
  'Other'
];

const priorityColors = {
  high: 'bg-rose-100 text-rose-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-blue-100 text-blue-800'
};

const priorityLabels = {
  high: 'High Priority',
  medium: 'Medium Priority',
  low: 'Low Priority'
};

export default function Checklist() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [newItem, setNewItem] = useState<Partial<ChecklistItem>>({
    completed: false,
    category: categories[0],
    priority: 'medium'
  });

  useEffect(() => {
    const savedItems = localStorage.getItem('wedding-checklist');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('wedding-checklist', JSON.stringify(items));
  }, [items]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.title) {
      setItems(prev => [...prev, { ...newItem, id: Date.now().toString() } as ChecklistItem]);
      setNewItem({
        completed: false,
        category: categories[0],
        priority: 'medium'
      });
      setShowForm(false);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleComplete = (id: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const deleteItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const itemsByCategory = categories.reduce((acc, category) => {
    acc[category] = items.filter(item => item.category === category);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  const getProgress = (category: string) => {
    const categoryItems = itemsByCategory[category];
    if (!categoryItems.length) return 0;
    const completed = categoryItems.filter(item => item.completed).length;
    return Math.round((completed / categoryItems.length) * 100);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Wedding Checklist</h1>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Task
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title
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
                  Due Date
                </label>
                <input
                  type="date"
                  value={newItem.dueDate || ''}
                  onChange={e => setNewItem(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newItem.category}
                  onChange={e => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newItem.priority}
                  onChange={e => setNewItem(prev => ({ ...prev, priority: e.target.value as ChecklistItem['priority'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                >
                  {Object.entries(priorityLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <input
                  type="text"
                  value={newItem.assignedTo || ''}
                  onChange={e => setNewItem(prev => ({ ...prev, assignedTo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                  placeholder="Optional"
                />
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
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {categories.map(category => {
          const categoryItems = itemsByCategory[category];
          if (!categoryItems?.length) return null;

          const progress = getProgress(category);
          const isExpanded = expandedCategories.includes(category);

          return (
            <div key={category} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <h3 className="text-lg font-medium text-gray-900">{category}</h3>
                  <span className="ml-4 text-sm text-gray-500">
                    {categoryItems.filter(item => item.completed).length} of {categoryItems.length} completed
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-6 pb-4">
                  <div className="divide-y divide-gray-200">
                    {categoryItems.map(item => (
                      <div
                        key={item.id}
                        className={`py-4 ${
                          item.completed ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-start">
                          <button
                            onClick={() => toggleComplete(item.id)}
                            className={`flex-shrink-0 w-5 h-5 rounded border ${
                              item.completed
                                ? 'bg-rose-600 border-rose-600'
                                : 'border-gray-300'
                            } flex items-center justify-center`}
                          >
                            {item.completed && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </button>
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <p
                                className={`text-sm font-medium ${
                                  item.completed
                                    ? 'text-gray-400 line-through'
                                    : 'text-gray-900'
                                }`}
                              >
                                {item.title}
                              </p>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  priorityColors[item.priority]
                                }`}
                              >
                                {priorityLabels[item.priority]}
                              </span>
                            </div>
                            {item.description && (
                              <p className="mt-1 text-sm text-gray-500">
                                {item.description}
                              </p>
                            )}
                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                              {item.dueDate && (
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {new Date(item.dueDate).toLocaleDateString()}
                                </div>
                              )}
                              {item.assignedTo && (
                                <div>Assigned to: {item.assignedTo}</div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="ml-3 text-gray-400 hover:text-gray-500"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first task to the checklist.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
