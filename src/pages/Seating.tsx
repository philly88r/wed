// @ts-nocheck
import { useState, useEffect } from 'react';
import { Plus, TableIcon, Save, RotateCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TableEditor } from '../components/Seating/TableEditor';
import { CreateLayoutModal } from '../components/Seating/CreateLayoutModal';
import { VenueSelector } from '../components/Seating/VenueSelector';

interface Venue {
  id: string;
  name: string;
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
  layout_id: string;
  template: TableTemplate;
}

interface SeatingLayout {
  id: string;
  name: string;
  venue_id: string;
  width: number;
  length: number;
}

export function Seating() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<string>('');
  const [layouts, setLayouts] = useState<SeatingLayout[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<string>('');
  const [tables, setTables] = useState<TableInstance[]>([]);
  const [templates, setTemplates] = useState<TableTemplate[]>([]);
  const [scale, setScale] = useState(50); // 50 pixels per foot
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCreateLayoutModal, setShowCreateLayoutModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVenues();
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (selectedVenue) {
      fetchLayouts();
    }
  }, [selectedVenue]);

  useEffect(() => {
    if (selectedLayout) {
      fetchTables();
    }
  }, [selectedLayout]);

  const fetchVenues = async () => {
    const { data, error } = await supabase
      .from('venues')
      .select('*');

    if (error) {
      console.error('Error fetching venues:', error);
      return;
    }

    setVenues(data || []);
  };

  const fetchLayouts = async () => {
    const { data, error } = await supabase
      .from('seating_layouts')
      .select('*')
      .eq('venue_id', selectedVenue);

    if (error) {
      console.error('Error fetching layouts:', error);
      return;
    }

    setLayouts(data || []);
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
      .select('*, template:table_templates(*)')
      .eq('layout_id', selectedLayout);

    if (error) {
      console.error('Error fetching tables:', error);
      return;
    }

    setTables(data || []);
  };

  const handleCreateLayout = async (layoutData: Partial<SeatingLayout>) => {
    const { data, error } = await supabase
      .from('seating_layouts')
      .insert([{ ...layoutData, venue_id: selectedVenue }])
      .select()
      .single();

    if (error) {
      console.error('Error creating layout:', error);
      return;
    }

    setLayouts([...layouts, data]);
    setSelectedLayout(data.id);
    setShowCreateLayoutModal(false);
  };

  const handleUpdateTable = async (tableId: string, updates: Partial<TableInstance>) => {
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
  };

  const handleAddTable = async () => {
    if (!selectedTemplate || !selectedLayout) return;

    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    const { data, error } = await supabase
      .from('table_instances')
      .insert([{
        template_id: selectedTemplate,
        layout_id: selectedLayout,
        position_x: 0,
        position_y: 0,
        rotation: 0,
        name: `Table ${tables.length + 1}`
      }])
      .select('*, template:table_templates(*)')
      .single();

    if (error) {
      console.error('Error adding table:', error);
      return;
    }

    setTables([...tables, data]);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <VenueSelector
            venues={venues}
            selectedVenue={selectedVenue}
            onSelect={setSelectedVenue}
          />
          {selectedVenue && (
            <>
              <select
                className="border rounded p-2"
                value={selectedLayout}
                onChange={(e) => setSelectedLayout(e.target.value)}
              >
                <option value="">Select Layout</option>
                {layouts.map(layout => (
                  <option key={layout.id} value={layout.id}>
                    {layout.name}
                  </option>
                ))}
              </select>
              <button
                className="bg-emerald-500 text-white px-4 py-2 rounded flex items-center"
                onClick={() => setShowCreateLayoutModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Layout
              </button>
            </>
          )}
        </div>
      </div>

      {selectedLayout && (
        <div className="mb-4 flex items-center space-x-4">
          <select
            className="border rounded p-2"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
          >
            <option value="">Select Table Template</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name} ({template.shape}, {template.seats} seats)
              </option>
            ))}
          </select>
          <button
            className="bg-emerald-500 text-white px-4 py-2 rounded flex items-center"
            onClick={handleAddTable}
            disabled={!selectedTemplate}
          >
            <TableIcon className="w-4 h-4 mr-2" />
            Add Table
          </button>
        </div>
      )}

      {selectedLayout && (
        <div className="border rounded-lg p-4 bg-white">
          <TableEditor
            tables={tables}
            scale={scale}
            onUpdateTable={handleUpdateTable}
            layout={layouts.find(l => l.id === selectedLayout)}
          />
        </div>
      )}

      {showCreateLayoutModal && (
        <CreateLayoutModal
          onClose={() => setShowCreateLayoutModal(false)}
          onCreate={handleCreateLayout}
        />
      )}
    </div>
  );
}

export default Seating;
