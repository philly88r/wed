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
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.href = '/auth';
        return;
      }
      setUser(session.user);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (user) {
      fetchVenues();
      fetchTemplates();
    }
  }, [user]);

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
      .select('*')
      .eq('created_by', user.id);

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
      .eq('venue_id', selectedVenue)
      .eq('created_by', user.id);

    if (error) {
      console.error('Error fetching layouts:', error);
      return;
    }

    setLayouts(data || []);
  };

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from('table_templates')
      .select('*')
      .eq('created_by', user.id);

    if (error) {
      console.error('Error fetching templates:', error);
      return;
    }

    setTemplates(data || []);
  };

  const fetchTables = async () => {
    const { data, error } = await supabase
      .from('table_instances')
      .select('*, template:template_id(*)')
      .eq('layout_id', selectedLayout);

    if (error) {
      console.error('Error fetching tables:', error);
      return;
    }

    setTables(data || []);
  };

  const handleTableMove = async (tableId: string, deltaX: number, deltaY: number) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    const newX = table.position_x + deltaX;
    const newY = table.position_y + deltaY;

    const { error } = await supabase
      .from('table_instances')
      .update({
        position_x: newX,
        position_y: newY
      })
      .eq('id', tableId);

    if (error) {
      console.error('Error updating table position:', error);
      return;
    }

    setTables(prev => prev.map(t => 
      t.id === tableId 
        ? { ...t, position_x: newX, position_y: newY }
        : t
    ));
  };

  const handleRotateTable = async (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    const newRotation = (table.rotation + 45) % 360;

    const { error } = await supabase
      .from('table_instances')
      .update({
        rotation: newRotation
      })
      .eq('id', tableId);

    if (error) {
      console.error('Error updating table rotation:', error);
      return;
    }

    setTables(prev => prev.map(t => 
      t.id === tableId 
        ? { ...t, rotation: newRotation }
        : t
    ));
  };

  const addTable = async () => {
    if (!selectedTemplate || !selectedLayout) return;

    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    const { data, error } = await supabase
      .from('table_instances')
      .insert({
        layout_id: selectedLayout,
        template_id: selectedTemplate,
        name: `${template.name} ${tables.length + 1}`,
        position_x: 100,
        position_y: 100,
        rotation: 0
      })
      .select('*, template:template_id(*)')
      .single();

    if (error) {
      console.error('Error adding table:', error);
      return;
    }

    setTables(prev => [...prev, data]);
    setShowTemplateModal(false);
  };

  const currentLayout = layouts.find(l => l.id === selectedLayout);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-red-500">TESTING - CAN YOU SEE THIS?</h1>
        <button
          onClick={() => window.location.href = '/auth'}
          className="bg-red-500 text-white px-4 py-2 rounded-lg text-xl"
        >
          TEST LOGIN BUTTON
        </button>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Seating Layout</h1>
        <div className="flex gap-4">
          {selectedVenue && (
            <button
              onClick={() => setShowCreateLayoutModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              <Plus className="w-4 h-4" />
              New Layout
            </button>
          )}
          {selectedLayout && (
            <button
              onClick={() => setShowTemplateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <TableIcon className="w-4 h-4" />
              Add Table
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <VenueSelector 
          onVenueSelect={(venue) => {
            if (venue) {
              setSelectedVenue(venue.id);
            } else {
              setSelectedVenue('');
              setSelectedLayout('');
            }
          }} 
        />

        {selectedVenue && (
          <div className="flex items-center justify-between">
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
                    {layout.name} ({layout.width}' × {layout.length}')
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block mb-2">Scale (px/ft)</label>
          <input
            type="number"
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            min={20}
            max={100}
            step={5}
            className="w-full p-2 border rounded"
          />
        </div>

        {currentLayout && (
          <div>
            <label className="block mb-2">Room Size</label>
            <div className="text-sm text-gray-600">
              {currentLayout.width}' × {currentLayout.length}'
              ({currentLayout.width * currentLayout.length} sq ft)
            </div>
          </div>
        )}
      </div>

      {currentLayout && (
        <div className="overflow-auto p-4 bg-gray-100 rounded-lg">
          <div className="mb-4 text-sm text-gray-600">
            Grid lines represent 1 foot intervals. Tables are drawn to scale.
          </div>
          <TableEditor
            tables={tables}
            onTableMove={handleTableMove}
            layoutWidth={currentLayout.width}
            layoutLength={currentLayout.length}
            scale={scale}
          />
        </div>
      )}

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Add Table</h2>
            <div className="mb-4">
              <label className="block mb-2">Table Template</label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Template</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.width}' × {template.length}', {template.seats} seats)
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={addTable}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={!selectedTemplate}
              >
                Add Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Layout Modal */}
      {showCreateLayoutModal && (
        <CreateLayoutModal
          venueId={selectedVenue}
          onClose={() => setShowCreateLayoutModal(false)}
          onLayoutCreated={(layoutId) => {
            fetchLayouts();
            setSelectedLayout(layoutId);
          }}
        />
      )}
    </div>
  );
}
