import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Upload } from 'lucide-react';
import { analyzeFloorPlan } from '../../services/floorPlanService';

// Update these values to match what's in your database
type RoomType = 'reception' | 'ceremony' | 'dining';

interface Room {
  id: string;
  name: string;
  length: number;
  width: number;
  room_type: RoomType;
  floor_plan_url?: string;
  table_scale?: number;
  ai_scale_found?: boolean;
  ai_scale_text?: string;
  ai_scale_value?: number;
  ai_pixels_per_foot?: number;
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
  const [newRoomType, setNewRoomType] = useState<RoomType>('reception');
  const [error, setError] = useState<string | null>(null);

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

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
      const { data, error: insertError } = await supabase
        .from('venue_rooms')
        .insert({
          name: newRoomName,
          length,
          width,
          room_type: newRoomType
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating room:', insertError);
        setError(insertError.message);
        return;
      }

      if (data) {
        setRooms(prev => [...prev, data as Room]);
        setShowCreateForm(false);
        setNewRoomName('');
        setNewRoomLength('');
        setNewRoomWidth('');
        setNewRoomType('reception');
      }
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Failed to create room. Please try again.');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('floor-plans')
        .upload(`temp/${file.name}`, file);

      if (error) {
        console.error('Error uploading image:', error);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('floor-plans')
        .getPublicUrl(data.path);

      // Analyze floor plan with AI
      const analysis = await analyzeFloorPlan(imageData);
      console.log('Floor plan analysis:', analysis);

      // Save room with floor plan and analysis results
      const { data: room, error: roomError } = await supabase
        .from('venue_rooms')
        .insert({
          name: newRoomName,
          floor_plan_url: publicUrl,
          length: analysis.dimensions.length || 0,
          width: analysis.dimensions.width || 0,
          table_scale: analysis.scale.pixelsPerFoot,
          ai_scale_found: analysis.scale.found,
          ai_scale_text: analysis.scale.text,
          ai_scale_value: analysis.scale.value,
          ai_pixels_per_foot: analysis.scale.pixelsPerFoot,
          room_type: newRoomType
        })
        .select()
        .single();

      if (roomError) {
        console.error('Insert error:', roomError);
        throw roomError;
      }

      // Move the file to the permanent location
      const { error: moveError } = await supabase.storage
        .from('floor-plans')
        .move(
          `temp/${file.name}`, 
          `${room.id}/${file.name}`
        );

      if (moveError) {
        console.error('Move error:', moveError);
        throw moveError;
      }

      // Update the room with the new URL
      const finalUrl = supabase.storage
        .from('floor-plans')
        .getPublicUrl(`${room.id}/${file.name}`).data.publicUrl;

      const { error: updateError } = await supabase
        .from('venue_rooms')
        .update({ floor_plan_url: finalUrl })
        .eq('id', room.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      // Add the new room to the list
      setRooms(prev => [...prev, { ...room, floor_plan_url: finalUrl }]);
      
      // Reset form
      setShowUploadForm(false);
      setNewRoomName('');
      setSelectedFile(null);
      setNewRoomType('reception');
    };
    reader.readAsDataURL(file);
  };

  const handleUploadFloorPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!selectedFile || !newRoomName) {
      setError('Please provide both a name and a floor plan');
      setLoading(false);
      return;
    }

    try {
      handleFileUpload(e as any);
    } catch (err) {
      console.error('Error uploading floor plan:', err);
      setError('Failed to upload floor plan. Please try again.');
      setLoading(false);
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
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name} ({room.length}' × {room.width}')
            </option>
          ))}
        </select>
        <button
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="h-5 w-5" />
          <span>New Room</span>
        </button>
        <button
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => setShowUploadForm(true)}
        >
          <Upload className="h-5 w-5" />
          <span>Upload Floor Plan</span>
        </button>
      </div>

      {/* Create Room Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Create New Room</h2>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Room Name</label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Length (feet)</label>
                <input
                  type="number"
                  value={newRoomLength}
                  onChange={(e) => setNewRoomLength(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Width (feet)</label>
                <input
                  type="number"
                  value={newRoomWidth}
                  onChange={(e) => setNewRoomWidth(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Room Type</label>
                <select
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value as RoomType)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="reception">Reception</option>
                  <option value="ceremony">Ceremony</option>
                  <option value="dining">Dining</option>
                </select>
              </div>
              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setError(null);
                  }}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Floor Plan Form */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Upload Floor Plan</h2>
            <form onSubmit={handleUploadFloorPlan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Room Name</label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Room Type</label>
                <select
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value as RoomType)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="reception">Reception</option>
                  <option value="ceremony">Ceremony</option>
                  <option value="dining">Dining</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Floor Plan</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  required
                />
              </div>
              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadForm(false);
                    setError(null);
                    setSelectedFile(null);
                  }}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default VenueSelector;
