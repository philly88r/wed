import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus } from 'lucide-react';

interface Venue {
  id: string;
  name: string;
  address?: string;
}

interface VenueSelectorProps {
  venues: Venue[];
  selectedVenue: string;
  onSelect: (venueId: string) => void;
}

export const VenueSelector: React.FC<VenueSelectorProps> = ({
  venues,
  selectedVenue,
  onSelect
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueAddress, setNewVenueAddress] = useState('');

  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('venues')
        .insert({
          name: newVenueName,
          address: newVenueAddress
        })
        .select()
        .single();

      if (error) throw error;

      setNewVenueName('');
      setNewVenueAddress('');
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error creating venue:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <select
          className="border rounded p-2"
          value={selectedVenue}
          onChange={(e) => onSelect(e.target.value)}
        >
          <option value="">Select Venue</option>
          {venues.map(venue => (
            <option key={venue.id} value={venue.id}>
              {venue.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-emerald-500 text-white px-4 py-2 rounded flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Venue
        </button>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Create New Venue</h2>
            <form onSubmit={handleCreateVenue}>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1">Venue Name</label>
                  <input
                    type="text"
                    value={newVenueName}
                    onChange={(e) => setNewVenueName(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Address (Optional)</label>
                  <input
                    type="text"
                    value={newVenueAddress}
                    onChange={(e) => setNewVenueAddress(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                >
                  Create Venue
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
