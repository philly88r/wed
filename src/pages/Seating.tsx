// @ts-nocheck
import { useState, useEffect } from 'react';
import { Plus, TableIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TableEditor } from '../components/Seating/TableEditor';
import { VenueSelector } from '../components/Seating/VenueSelector';

interface Room {
  id: string;
  name: string;
  length: number;
  width: number;
}

interface TableTemplate {
  id: string;
  name: string;
  shape: 'round' | 'rectangular' | 'square' | 'oval';
  width: number;
  length: number;
  seats: number;
  is_premium: boolean;
}

interface TableInstance {
  id: string;
  name: string;
  template_id: string;
  position_x: number;
  position_y: number;
  rotation: number;
  room_id: string;
  template: TableTemplate;
}

export function Seating() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [tables, setTables] = useState<TableInstance[]>([]);
  const [templates, setTemplates] = useState<TableTemplate[]>([]);
  const [scale, setScale] = useState(30); // Adjusted scale to fit the layout better
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRooms();
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      fetchTables();
    }
  }, [selectedRoom]);

  const fetchRooms = async () => {
    try {
      console.log('Fetching rooms...');
      const { data, error } = await supabase
        .from('venue_rooms')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching rooms:', error);
        return;
      }

      console.log('Fetched rooms:', data);
      setRooms(data || []);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('table_templates')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching templates:', error);
        return;
      }

      setTemplates(data || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  const fetchTables = async () => {
    try {
      const { data, error } = await supabase
        .from('table_instances')
        .select(`
          *,
          template:table_templates (*)
        `)
        .eq('room_id', selectedRoom);

      if (error) {
        console.error('Error fetching tables:', error);
        return;
      }

      setTables(data || []);
    } catch (err) {
      console.error('Error fetching tables:', err);
    }
  };

  const createDefaultLayout = async (roomId: string) => {
    setLoading(true);
    try {
      // Find the round table template
      const roundTemplate = templates.find(t => t.shape === 'round');
      if (!roundTemplate) {
        console.error('No round table template found');
        return;
      }

      // Create 15 tables in a 3x5 grid
      const tablePositions = [];
      const spacing = 12; // 12 feet between table centers
      const startX = 20; // Starting X position
      const startY = 25; // Starting Y position to leave room for the bar

      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 3; col++) {
          const tableNumber = row * 3 + col + 1;
          tablePositions.push({
            template_id: roundTemplate.id,
            name: `Table ${tableNumber}`,
            position_x: startX + col * spacing,
            position_y: startY + row * spacing,
            rotation: 0,
            room_id: roomId
          });
        }
      }

      // Add special areas (these will be handled by UI overlays)
      // Bar, DJ booth, and cake area positions are fixed in the room layout

      // Insert all tables at once
      const { data, error } = await supabase
        .from('table_instances')
        .insert(tablePositions)
        .select();

      if (error) {
        console.error('Error creating default layout:', error);
        return;
      }

      // Refresh the tables
      fetchTables();
    } catch (err) {
      console.error('Error creating default layout:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = async () => {
    if (!selectedRoom || !selectedTemplate) return;

    try {
      const template = templates.find(t => t.id === selectedTemplate);
      if (!template) return;

      const { data, error } = await supabase
        .from('table_instances')
        .insert({
          name: template.name,
          template_id: template.id,
          room_id: selectedRoom,
          position_x: 0,
          position_y: 0,
          rotation: 0,
          created_by: '00000000-0000-0000-0000-000000000000'
        })
        .select(`
          *,
          template:table_templates (*)
        `)
        .single();

      if (error) {
        console.error('Error adding table:', error);
        return;
      }

      setTables(prev => [...prev, data]);
    } catch (err) {
      console.error('Error adding table:', err);
    }
  };

  const handleUpdateTable = async (tableId: string, updates: Partial<TableInstance>) => {
    try {
      const { error } = await supabase
        .from('table_instances')
        .update(updates)
        .eq('id', tableId);

      if (error) {
        console.error('Error updating table:', error);
        return;
      }

      setTables(tables.map(table =>
        table.id === tableId ? { ...table, ...updates } : table
      ));
    } catch (err) {
      console.error('Error updating table:', err);
    }
  };

  const calculateScale = (room: Room) => {
    // Get window dimensions with minimal margins
    const maxWidth = window.innerWidth - 24; // 12px margin on each side
    const maxHeight = window.innerHeight - 80; // 40px margin on top and bottom

    // Calculate scales that would fit the room in each dimension
    const scaleX = maxWidth / room.length;
    const scaleY = maxHeight / room.width;

    // Use the smaller scale to ensure room fits in both dimensions
    // Round down to nearest multiple of 10 for cleaner numbers
    // Base scale is now 30 pixels per foot instead of previous smaller value
    const baseScale = Math.floor(Math.min(scaleX, scaleY) * 0.98 / 10) * 10;
    return Math.max(baseScale, 30); // Minimum of 30 pixels per foot
  };

  useEffect(() => {
    if (selectedRoom) {
      const room = rooms.find(r => r.id === selectedRoom);
      if (room) {
        setScale(calculateScale(room));
      }
    }
  }, [selectedRoom, rooms]);

  const selectedRoomData = selectedRoom ? rooms.find(r => r.id === selectedRoom) : null;

  return (
    <div className="container mx-auto p-4">
      <div className="space-y-4">
        <VenueSelector
          rooms={rooms}
          selectedRoom={selectedRoom}
          onSelect={setSelectedRoom}
          setRooms={setRooms}
        />

        {selectedRoom && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex-1 mr-4">
                <label htmlFor="template" className="block text-sm font-medium text-gray-700">
                  Select Table Template
                </label>
                <select
                  id="template"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                  <option value="">Select a template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({template.length}' × {template.width}', {template.seats} seats)
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAddTable}
                disabled={!selectedTemplate}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <TableIcon className="h-5 w-5 mr-2" />
                Add Table
              </button>
              <button
                onClick={() => createDefaultLayout(selectedRoom)}
                disabled={!selectedRoom}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Create Default Layout
              </button>
            </div>

            {selectedRoomData && (
              <div className="border rounded-lg p-4 bg-white">
                <TableEditor
                  tables={tables}
                  setTables={setTables}
                  scale={scale}
                  room={selectedRoomData}
                  onUpdateTable={handleUpdateTable}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Seating;
