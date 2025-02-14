import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus } from 'lucide-react';

interface Venue {
  id: string;
  name: string;
  address?: string;
}

interface VenueSelectorProps {
  onVenueSelect: (venue: Venue | null) => void;
}

export const VenueSelector: React.FC<VenueSelectorProps> = ({
  onVenueSelect,
}) => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueAddress, setNewVenueAddress] = useState('');

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    if (selectedVenue) {
      const venue = venues.find(v => v.id === selectedVenue) || null;
      onVenueSelect(venue);
    } else {
      onVenueSelect(null);
    }
  }, [selectedVenue, venues]);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Please log in to view venues');
      }

      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('created_by', user.id);

      if (error) throw error;

      setVenues(data || []);
    } catch (err) {
      console.error('Error fetching venues:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Please log in to create a venue');
      }

      const { data, error } = await supabase
        .from('venues')
        .insert({
          name: newVenueName,
          address: newVenueAddress,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setVenues(prev => [...prev, data]);
      setNewVenueName('');
      setNewVenueAddress('');
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error creating venue:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) return <div>Loading venues...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex-1 mr-4">
          <label htmlFor="venue" className="block text-sm font-medium text-gray-700">
            Select Venue
          </label>
          <select
            id="venue"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={selectedVenue}
            onChange={(e) => setSelectedVenue(e.target.value)}
          >
            <option value="">Select a venue</option>
            {venues.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {venue.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Venue
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateVenue} className="space-y-4 mt-4 p-4 bg-gray-50 rounded-md">
          <div>
            <label htmlFor="venueName" className="block text-sm font-medium text-gray-700">
              Venue Name
            </label>
            <input
              type="text"
              id="venueName"
              value={newVenueName}
              onChange={(e) => setNewVenueName(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="venueAddress" className="block text-sm font-medium text-gray-700">
              Address (optional)
            </label>
            <input
              type="text"
              id="venueAddress"
              value={newVenueAddress}
              onChange={(e) => setNewVenueAddress(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Venue
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default VenueSelector;
