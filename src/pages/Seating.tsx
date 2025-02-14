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
  const [scale, setScale] = useState(50); // 50 pixels per foot
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
      const { data, error } = await supabase
        .from('venue_rooms')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching rooms:', error);
        return;
      }

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
          rotation: 0
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
