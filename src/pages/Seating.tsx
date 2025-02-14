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
      .select(`
        *,
        template:table_templates (*)
      `)
      .eq('layout_id', selectedLayout);

    if (error) {
      console.error('Error fetching tables:', error);
      return;
    }

    setTables(data || []);
  };

  const handleCreateLayout = async (name: string, width: number, length: number) => {
    if (!selectedVenue) return;

    const { data, error } = await supabase
      .from('seating_layouts')
      .insert({
        name,
        venue_id: selectedVenue,
        width,
        length
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating layout:', error);
      return;
    }

    setLayouts(prev => [...prev, data]);
    setShowCreateLayoutModal(false);
  };

  const handleAddTable = async () => {
    if (!selectedLayout || !selectedTemplate) return;

    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    const { data, error } = await supabase
      .from('table_instances')
      .insert({
        name: template.name,
        template_id: template.id,
        layout_id: selectedLayout,
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

  return (
    <div className="container mx-auto p-4">
      <div className="space-y-4">
        <VenueSelector
          venues={venues}
          selectedVenue={selectedVenue}
          onSelect={setSelectedVenue}
        />

        {selectedVenue && (
          <div className="flex justify-between items-center">
            <div className="flex-1 mr-4">
              <label htmlFor="layout" className="block text-sm font-medium text-gray-700">
                Select Layout
              </label>
              <select
                id="layout"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={selectedLayout}
                onChange={(e) => setSelectedLayout(e.target.value)}
              >
                <option value="">Select a layout</option>
                {layouts.map((layout) => (
                  <option key={layout.id} value={layout.id}>
                    {layout.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowCreateLayoutModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Layout
            </button>
          </div>
        )}

        {selectedLayout && (
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
                      {template.name} ({template.seats} seats)
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

            <TableEditor
              tables={tables}
              setTables={setTables}
              scale={scale}
              layout={layouts.find(l => l.id === selectedLayout)}
              onUpdateTable={handleUpdateTable}
            />
          </div>
        )}
      </div>

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
