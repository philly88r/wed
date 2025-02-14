import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  length: number;
  width: number;
}

interface VenueSelectorProps {
  rooms: Room[];
  selectedRoom: string;
  onSelect: (roomId: string) => void;
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
}

export const VenueSelector: React.FC<VenueSelectorProps> = ({
  rooms,
  selectedRoom,
  onSelect,
  setRooms
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomLength, setNewRoomLength] = useState('');
  const [newRoomWidth, setNewRoomWidth] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate dimensions
    const length = parseFloat(newRoomLength);
    const width = parseFloat(newRoomWidth);
    
    if (isNaN(length) || length <= 0 || isNaN(width) || width <= 0) {
      setError('Please enter valid dimensions (greater than 0)');
      return;
    }

    try {
      console.log('Creating room with:', { name: newRoomName, length, width });
      const { data, error: insertError } = await supabase
        .from('venue_rooms')
        .insert({
          name: newRoomName,
          length,
          width
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating room:', insertError);
        setError(insertError.message);
        return;
      }

      console.log('Created room:', data);
      if (data) {
        setRooms(prev => [...prev, data as Room]);
        setShowCreateForm(false);
        setNewRoomName('');
        setNewRoomLength('');
        setNewRoomWidth('');
      }
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Failed to create room. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <select
          className="border rounded p-2"
          value={selectedRoom}
          onChange={(e) => onSelect(e.target.value)}
        >
          <option value="">Select Room</option>
          {rooms.map(room => (
            <option key={room.id} value={room.id}>
              {room.name} ({room.length}' × {room.width}')
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-emerald-500 text-white px-4 py-2 rounded flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Room
        </button>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Create New Room</h2>
            <form onSubmit={handleCreateRoom}>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1">Room Name</label>
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Length (feet)</label>
                    <input
                      type="number"
                      value={newRoomLength}
                      onChange={(e) => setNewRoomLength(e.target.value)}
                      className="w-full p-2 border rounded"
                      min="1"
                      step="0.1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Width (feet)</label>
                    <input
                      type="number"
                      value={newRoomWidth}
                      onChange={(e) => setNewRoomWidth(e.target.value)}
                      className="w-full p-2 border rounded"
                      min="1"
                      step="0.1"
                      required
                    />
                  </div>
                </div>
              </div>
              {error && (
                <div className="mt-2 text-red-500 text-sm">
                  {error}
                </div>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setError(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VenueSelector;
