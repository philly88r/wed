// @ts-nocheck
import { useState, useEffect } from 'react';
import { Plus, MapPin, Clock, Users, Calendar, Trash2, Edit2 } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description?: string;
  type: 'ceremony' | 'reception' | 'rehearsal' | 'other';
  attendees?: string[];
  notes?: string;
}

const eventTypes = [
  { value: 'ceremony', label: 'Ceremony' },
  { value: 'reception', label: 'Reception' },
  { value: 'rehearsal', label: 'Rehearsal Dinner' },
  { value: 'other', label: 'Other' }
];

const typeColors = {
  ceremony: 'bg-rose-100 text-rose-800',
  reception: 'bg-emerald-100 text-emerald-800',
  rehearsal: 'bg-amber-100 text-amber-800',
  other: 'bg-blue-100 text-blue-800'
};

export function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    type: 'ceremony',
    attendees: []
  });

  useEffect(() => {
    const savedEvents = localStorage.getItem('wedding-events');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('wedding-events', JSON.stringify(events));
  }, [events]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      setEvents(prev =>
        prev.map(event =>
          event.id === editingEvent.id
            ? { ...editingEvent, ...newEvent }
            : event
        )
      );
    } else {
      setEvents(prev => [
        ...prev,
        { ...newEvent, id: Date.now().toString() } as Event
      ]);
    }
    setNewEvent({ type: 'ceremony', attendees: [] });
    setEditingEvent(null);
    setShowForm(false);
  };

  const deleteEvent = (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(prev => prev.filter(event => event.id !== id));
    }
  };

  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.startTime}`);
    const dateB = new Date(`${b.date} ${b.startTime}`);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Wedding Events</h1>
        <button
          onClick={() => {
            setNewEvent({ type: 'ceremony', attendees: [] });
            setEditingEvent(null);
            setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Event
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={newEvent.title || ''}
                    onChange={e => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
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
                    value={newEvent.date || ''}
                    onChange={e => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Type
                  </label>
                  <select
                    value={newEvent.type || 'ceremony'}
                    onChange={e => setNewEvent(prev => ({ ...prev, type: e.target.value as Event['type'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                  >
                    {eventTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newEvent.startTime || ''}
                    onChange={e => setNewEvent(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newEvent.endTime || ''}
                    onChange={e => setNewEvent(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newEvent.location || ''}
                    onChange={e => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newEvent.description || ''}
                    onChange={e => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                    rows={3}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={newEvent.notes || ''}
                    onChange={e => setNewEvent(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingEvent(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700"
                >
                  {editingEvent ? 'Save Changes' : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {sortedEvents.map(event => (
          <div
            key={event.id}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    {event.title}
                  </h3>
                  <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[event.type]}`}>
                    {eventTypes.find(t => t.value === event.type)?.label}
                  </span>
                </div>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
                    {event.startTime} - {event.endTime}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                </div>
                {event.description && (
                  <p className="mt-3 text-sm text-gray-500">
                    {event.description}
                  </p>
                )}
                {event.notes && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-900">Notes</h4>
                    <p className="mt-1 text-sm text-gray-500">{event.notes}</p>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingEvent(event);
                    setNewEvent(event);
                    setShowForm(true);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-500"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => deleteEvent(event.id)}
                  className="p-2 text-gray-400 hover:text-gray-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No events yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first wedding event.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
