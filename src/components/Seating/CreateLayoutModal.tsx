import { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface CreateLayoutModalProps {
  venueId: string;
  onClose: () => void;
  onLayoutCreated: (layoutId: string) => void;
}

export function CreateLayoutModal({ venueId, onClose, onLayoutCreated }: CreateLayoutModalProps) {
  const [name, setName] = useState('');
  const [width, setWidth] = useState(40);
  const [length, setLength] = useState(60);
  const [squareFeet, setSquareFeet] = useState(2400);

  // Update square feet when dimensions change
  const updateSquareFeet = (w: number, l: number) => {
    setSquareFeet(w * l);
  };

  // Update dimensions when square feet changes
  const updateDimensions = (sf: number) => {
    // Maintain current aspect ratio
    const ratio = length / width;
    const newWidth = Math.sqrt(sf / ratio);
    const newLength = newWidth * ratio;
    setWidth(Math.round(newWidth));
    setLength(Math.round(newLength));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from('seating_layouts')
      .insert({
        venue_id: venueId,
        name,
        width,
        length,
        square_feet: squareFeet
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating layout:', error);
      return;
    }

    onLayoutCreated(data.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <h2 className="text-xl font-bold mb-4">Create New Layout</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Layout Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
              required
              placeholder="e.g., Main Hall Layout"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Width (feet)</label>
              <input
                type="number"
                value={width}
                onChange={(e) => {
                  const w = Number(e.target.value);
                  setWidth(w);
                  updateSquareFeet(w, length);
                }}
                className="w-full p-2 border rounded"
                min={10}
                required
              />
            </div>
            <div>
              <label className="block mb-2">Length (feet)</label>
              <input
                type="number"
                value={length}
                onChange={(e) => {
                  const l = Number(e.target.value);
                  setLength(l);
                  updateSquareFeet(width, l);
                }}
                className="w-full p-2 border rounded"
                min={10}
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-2">Total Square Feet</label>
            <input
              type="number"
              value={squareFeet}
              onChange={(e) => {
                const sf = Number(e.target.value);
                setSquareFeet(sf);
                updateDimensions(sf);
              }}
              className="w-full p-2 border rounded"
              min={100}
              required
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Create Layout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
