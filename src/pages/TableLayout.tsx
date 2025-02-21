// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { TableIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TableEditor } from '../components/Seating/TableEditor';
import { VenueSelector } from '../components/Seating/VenueSelector';

interface Room {
  id: string;
  name: string;
  length: number;
  width: number;
  floor_plan_url?: string;
  table_scale?: number;
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
  created_by: string;
}

export default function TableLayout() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [tables, setTables] = useState<TableInstance[]>([]);
  const [templates, setTemplates] = useState<TableTemplate[]>([]);
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
    const { data, error } = await supabase
      .from('venue_rooms')
      .select('*');

    if (error) {
      console.error('Error fetching rooms:', error);
      return;
    }

    setRooms(data || []);
  };

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from('table_templates')
      .select('*');

    if (error) {
      console.error('Error fetching templates:', error);
      return;
    }

    setTemplates(data || []);
  };

  const fetchTables = async () => {
    const { data, error } = await supabase
      .from('table_instances')
      .select(`
        *,
        template:table_templates(*)
      `)
      .eq('room_id', selectedRoom);

    if (error) {
      console.error('Error fetching tables:', error);
      return;
    }

    setTables(data || []);
  };

  const handleAddTable = async () => {
    if (!selectedTemplate || !selectedRoom) {
      console.error('No template or room selected', { selectedTemplate, selectedRoom });
      return;
    }

    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) {
      console.error('Template not found', { selectedTemplate, templates });
      return;
    }

    // Get the room to check its dimensions
    const room = rooms.find(r => r.id === selectedRoom);
    if (!room) {
      console.error('Room not found', { selectedRoom, rooms });
      return;
    }

    // Using default user ID for development
    const defaultUserId = '00000000-0000-0000-0000-000000000000';

    console.log('Adding table with:', {
      template,
      room,
      currentTables: tables,
      userId: defaultUserId
    });

    // If we have a floor plan, use its dimensions for centering
    let initialX = room.length / 2;
    let initialY = room.width / 2;

    if (room.floor_plan_url) {
      // Create a temporary image to get dimensions
      const img = new Image();
      img.src = room.floor_plan_url;
      await new Promise((resolve) => {
        img.onload = () => {
          // Use 76.8 pixels per foot if scale not set
          const scale = room.table_scale || 76.8;
          initialX = (img.width / scale) / 2;
          initialY = (img.height / scale) / 2;
          resolve(null);
        };
        img.onerror = () => {
          console.warn('Could not load image, using room dimensions for centering');
          resolve(null);
        };
      });
    }

    try {
      const { data, error } = await supabase
        .from('table_instances')
        .insert({
          name: `${template.name} ${tables.length + 1}`,
          template_id: template.id,
          room_id: selectedRoom,
          position_x: initialX,
          position_y: initialY,
          rotation: 0,
          created_by: defaultUserId
        })
        .select(`
          *,
          template:table_templates(*)
        `)
        .single();

      if (error) {
        console.error('Error adding table:', error);
        return;
      }

      if (data) {
        console.log('Successfully added new table:', data);
        // Update tables state with the new table
        setTables(prev => {
          const newTables = [...prev, data];
          console.log('Updated tables state:', newTables);
          return newTables;
        });
      }
    } catch (error) {
      console.error('Error in handleAddTable:', error);
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

      setTables(prev => prev.map(table => 
        table.id === tableId ? { ...table, ...updates } : table
      ));
    } catch (error) {
      console.error('Error in handleUpdateTable:', error);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    try {
      const { error } = await supabase
        .from('table_instances')
        .delete()
        .eq('id', tableId);

      if (error) {
        console.error('Error deleting table:', error);
        return;
      }

      setTables(prev => prev.filter(table => table.id !== tableId));
    } catch (error) {
      console.error('Error in handleDeleteTable:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Seating Arrangement</h1>
      
      {/* Room Selector */}
      <VenueSelector
        rooms={rooms}
        selectedRoom={selectedRoom}
        onSelect={setSelectedRoom}
        setRooms={setRooms}
      />

      {selectedRoom && (
        <div className="space-y-6">
          {/* Table Controls */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
              <h3 className="text-lg font-medium text-gray-900">Table Controls</h3>
            </div>
            <div className="p-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block mb-2">
                    <span className="text-gray-700">Select Table Template</span>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select a template</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name} ({template.length}' × {template.width}', {template.seats} seats)
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    onClick={handleAddTable}
                    disabled={!selectedTemplate}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    Add Table
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Table Editor */}
          <TableEditor
            room={rooms.find(r => r.id === selectedRoom)!}
            tables={tables}
            onUpdateTable={handleUpdateTable}
            onDeleteTable={handleDeleteTable}
          />
        </div>
      )}
    </div>
  );
}
