import { useState, useEffect } from 'react';
import { supabase } from '../../../src/supabaseClient';

interface Guest {
  id: string;
  name: string;
  table_id: string;
  seat_number: number;
}

interface GuestEditorProps {
  tableId: string;
  tableName: string;
  onClose: () => void;
  seats: number;
}

export function GuestEditor({ tableId, tableName, onClose, seats }: GuestEditorProps) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [newGuestName, setNewGuestName] = useState('');
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuests();
  }, [tableId]);

  const fetchGuests = async () => {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('table_id', tableId)
      .order('seat_number');

    if (error) {
      console.error('Error fetching guests:', error);
      return;
    }

    setGuests(data || []);
    setLoading(false);
  };

  const addGuest = async () => {
    if (!newGuestName.trim() || selectedSeat === null) return;

    const { data, error } = await supabase
      .from('guests')
      .insert([
        {
          name: newGuestName.trim(),
          table_id: tableId,
          seat_number: selectedSeat
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding guest:', error);
      return;
    }

    setGuests([...guests, data]);
    setNewGuestName('');
    setSelectedSeat(null);
  };

  const removeGuest = async (guestId: string) => {
    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', guestId);

    if (error) {
      console.error('Error removing guest:', error);
      return;
    }

    setGuests(guests.filter(g => g.id !== guestId));
  };

  const getAvailableSeats = () => {
    const takenSeats = new Set(guests.map(g => g.seat_number));
    return Array.from({ length: seats }, (_, i) => i + 1)
      .filter(seatNum => !takenSeats.has(seatNum));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Guests at {tableName}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Add new guest */}
        <div className="mb-6">
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newGuestName}
              onChange={(e) => setNewGuestName(e.target.value)}
              placeholder="Guest name"
              className="flex-1 px-3 py-2 border rounded"
            />
            <select
              value={selectedSeat || ''}
              onChange={(e) => setSelectedSeat(Number(e.target.value))}
              className="px-3 py-2 border rounded"
            >
              <option value="">Seat #</option>
              {getAvailableSeats().map(seatNum => (
                <option key={seatNum} value={seatNum}>
                  {seatNum}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={addGuest}
            disabled={!newGuestName.trim() || selectedSeat === null}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded disabled:bg-gray-400"
          >
            Add Guest
          </button>
        </div>

        {/* Guest list */}
        <div className="space-y-2">
          {loading ? (
            <p className="text-center text-gray-500">Loading guests...</p>
          ) : guests.length === 0 ? (
            <p className="text-center text-gray-500">No guests assigned to this table</p>
          ) : (
            guests
              .sort((a, b) => a.seat_number - b.seat_number)
              .map(guest => (
                <div
                  key={guest.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div>
                    <span className="font-medium">Seat {guest.seat_number}:</span>{' '}
                    {guest.name}
                  </div>
                  <button
                    onClick={() => removeGuest(guest.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
