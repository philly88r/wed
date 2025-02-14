// @ts-nocheck
import React, { useRef, useEffect, useState } from 'react';

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

interface Room {
  id: string;
  name: string;
  length: number;
  width: number;
}

interface TableEditorProps {
  tables: TableInstance[];
  setTables: (tables: TableInstance[]) => void;
  scale: number; // pixels per foot
  room: Room;
  onUpdateTable: (tableId: string, updates: Partial<TableInstance>) => void;
}

const TableShape: React.FC<{
  table: TableInstance;
  scale: number;
  style?: React.CSSProperties;
}> = ({ table, scale, style }) => {
  const width = table.template.width * scale;
  const length = table.template.length * scale;
  
  if (table.template.shape === 'round') {
    return (
      <div
        style={{
          width: width,
          height: width,
          borderRadius: '50%',
          border: '2px solid #4B5563',
          backgroundColor: '#F3F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `rotate(${table.rotation}deg)`,
          ...style
        }}
      >
        <span className="text-sm font-medium">{table.name}</span>
      </div>
    );
  }

  if (table.template.shape === 'oval') {
    return (
      <div
        style={{
          width: length,
          height: width,
          borderRadius: '50%',
          border: '2px solid #4B5563',
          backgroundColor: '#F3F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `rotate(${table.rotation}deg)`,
          ...style
        }}
      >
        <span className="text-sm font-medium">{table.name}</span>
      </div>
    );
  }

  // Rectangle or Square
  return (
    <div
      style={{
        width: length,
        height: width,
        border: '2px solid #4B5563',
        backgroundColor: '#F3F4F6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `rotate(${table.rotation}deg)`,
        ...style
      }}
    >
      <span className="text-sm font-medium">{table.name}</span>
    </div>
  );
};

const DraggableTable: React.FC<{
  table: TableInstance;
  scale: number;
  onMouseDown: (e: React.MouseEvent) => void;
}> = ({ table, scale, onMouseDown }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: table.position_x * scale,
        top: table.position_y * scale,
        cursor: 'move',
        userSelect: 'none',
        transform: `rotate(${table.rotation}deg)`,
      }}
      onMouseDown={onMouseDown}
    >
      <TableShape table={table} scale={scale} />
    </div>
  );
};

export const TableEditor: React.FC<TableEditorProps> = ({
  tables,
  setTables,
  scale,
  room,
  onUpdateTable
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const draggedTableRef = useRef<string | null>(null);
  const initialPositionRef = useRef<{ x: number, y: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent, tableId: string) => {
    draggedTableRef.current = tableId;
    const table = tables.find(t => t.id === tableId);
    if (table) {
      initialPositionRef.current = {
        x: e.clientX - table.position_x * scale,
        y: e.clientY - table.position_y * scale
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedTableRef.current || !initialPositionRef.current || !editorRef.current) return;

    const editorRect = editorRef.current.getBoundingClientRect();
    const table = tables.find(t => t.id === draggedTableRef.current);
    if (!table) return;

    // Calculate new position in feet
    let newX = (e.clientX - initialPositionRef.current.x) / scale;
    let newY = (e.clientY - initialPositionRef.current.y) / scale;

    // Constrain to room boundaries
    newX = Math.max(0, Math.min(room.length - table.template.length, newX));
    newY = Math.max(0, Math.min(room.width - table.template.width, newY));

    // Update table position
    onUpdateTable(table.id, {
      position_x: newX,
      position_y: newY
    });

    // Update local state for smooth dragging
    setTables(tables.map(t =>
      t.id === table.id ? { ...t, position_x: newX, position_y: newY } : t
    ));
  };

  const handleMouseUp = () => {
    draggedTableRef.current = null;
    initialPositionRef.current = null;
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const roomStyle = {
    width: room.length * scale,
    height: room.width * scale,
    position: 'relative' as const,
    border: '2px solid #ccc',
    backgroundColor: '#f9fafb',
    overflow: 'hidden',
    maxWidth: '100%',
    maxHeight: 'calc(100vh - 200px)' // Leave space for header and margins
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          {room.name} ({room.length}' × {room.width}')
        </h3>
        <div className="text-sm text-gray-500">
          Scale: 1' = {scale}px
        </div>
      </div>

      <div
        ref={editorRef}
        style={roomStyle}
        onMouseMove={handleMouseMove}
        className="mx-auto"
      >
        {tables.map(table => (
          <DraggableTable
            key={table.id}
            table={table}
            scale={scale}
            onMouseDown={(e) => handleMouseDown(e, table.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default TableEditor;
