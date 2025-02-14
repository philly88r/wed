// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Table from './Table';
import TableTemplateSelector from './TableTemplateSelector';

interface TableInstance {
  id: string;
  name: string;
  template_id: string;
  position_x: number;
  position_y: number;
  rotation: number;
  shape: 'round' | 'rectangular' | 'square' | 'oval';
  width: number;
  length: number;
  seats: number;
}

interface TableLayoutProps {
  layoutId: string;
  width: number;
  length: number;
  pixelsPerFoot: number;
}

export const TableLayout: React.FC<TableLayoutProps> = ({
  layoutId,
  width,
  length,
  pixelsPerFoot,
}) => {
  const [tables, setTables] = useState<TableInstance[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTables();
  }, [layoutId]);

  const fetchTables = async () => {
    try {
      const { data, error } = await supabase
        .from('table_instances')
        .select(`
          *,
          template:table_templates(
            shape,
            width,
            length,
            seats
          )
        `)
        .eq('layout_id', layoutId);

      if (error) throw error;

      const formattedTables = data.map((table: any) => ({
        id: table.id,
        name: table.name,
        template_id: table.template_id,
        position_x: table.position_x * pixelsPerFoot,
        position_y: table.position_y * pixelsPerFoot,
        rotation: table.rotation,
        shape: table.template.shape,
        width: table.template.width,
        length: table.template.length,
        seats: table.template.seats,
      }));

      setTables(formattedTables);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tables');
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelect = (tableId: string) => {
    setSelectedTable(tableId === selectedTable ? null : tableId);
  };

  const handleTableMove = async (tableId: string, x: number, y: number) => {
    // Convert pixels back to feet for storage
    const xFeet = x / pixelsPerFoot;
    const yFeet = y / pixelsPerFoot;

    try {
      const { error } = await supabase
        .from('table_instances')
        .update({
          position_x: xFeet,
          position_y: yFeet,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tableId);

      if (error) throw error;

      setTables(tables.map(table => 
        table.id === tableId
          ? { ...table, position_x: x, position_y: y }
          : table
      ));
    } catch (err) {
      console.error('Error updating table position:', err);
    }
  };

  const handleTableRotate = async (tableId: string, rotation: number) => {
    try {
      const { error } = await supabase
        .from('table_instances')
        .update({
          rotation,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tableId);

      if (error) throw error;

      setTables(tables.map(table => 
        table.id === tableId
          ? { ...table, rotation }
          : table
      ));
    } catch (err) {
      console.error('Error updating table rotation:', err);
    }
  };

  const handleTemplateSelect = async (template: any) => {
    try {
      // Calculate center position for new table
      const centerX = (width * pixelsPerFoot) / 2;
      const centerY = (length * pixelsPerFoot) / 2;

      const { data, error } = await supabase
        .from('table_instances')
        .insert({
          layout_id: layoutId,
          template_id: template.id,
          name: `Table ${tables.length + 1}`,
          position_x: centerX / pixelsPerFoot,
          position_y: centerY / pixelsPerFoot,
          rotation: 0,
        })
        .select()
        .single();

      if (error) throw error;

      const newTable: TableInstance = {
        id: data.id,
        name: data.name,
        template_id: template.id,
        position_x: centerX,
        position_y: centerY,
        rotation: 0,
        shape: template.shape,
        width: template.width,
        length: template.length,
        seats: template.seats,
      };

      setTables([...tables, newTable]);
      setShowTemplateSelector(false);
    } catch (err) {
      console.error('Error adding table:', err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const tableId = e.dataTransfer.getData('text/plain');
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    handleTableMove(tableId, x, y);
  };

  if (loading) {
    return <div className="animate-pulse">Loading tables...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <div className="relative">
      {/* Layout Area */}
      <div
        className="relative border-2 border-gray-200 rounded-xl bg-gray-50"
        style={{
          width: width * pixelsPerFoot,
          height: length * pixelsPerFoot,
          maxWidth: '100%',
          overflow: 'auto',
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {tables.map(table => (
          <Table
            key={table.id}
            {...table}
            selected={selectedTable === table.id}
            pixelsPerFoot={pixelsPerFoot}
            onSelect={handleTableSelect}
            onMove={handleTableMove}
            onRotate={handleTableRotate}
          />
        ))}
      </div>

      {/* Add Table Button */}
      <button
        onClick={() => setShowTemplateSelector(true)}
        className="mt-4 inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
      >
        Add Table
      </button>

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Select Table Template</h2>
            <TableTemplateSelector onSelect={handleTemplateSelect} />
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowTemplateSelector(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableLayout;
