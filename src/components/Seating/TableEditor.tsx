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
  // Increase base size by 50%
  const width = table.template.width * scale * 1.5;
  const length = table.template.length * scale * 1.5;
  
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
          ...style
        }}
      >
        <span className="text-lg font-medium">{table.name}</span>
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
          ...style
        }}
      >
        <span className="text-lg font-medium">{table.name}</span>
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
        ...style
      }}
    >
      <span className="text-lg font-medium">{table.name}</span>
    </div>
  );
};

const DraggableTable: React.FC<{
  table: TableInstance;
  scale: number;
  onMouseDown: (e: React.MouseEvent) => void;
  onRotate: (amount: number) => void;
}> = ({ table, scale, onMouseDown, onRotate }) => {
  // Increase base size by 50%
  const adjustedScale = scale * 1.5;
  
  return (
    <div
      style={{
        position: 'absolute',
        left: table.position_x * scale,
        top: table.position_y * scale,
        cursor: 'move',
        userSelect: 'none',
      }}
      onMouseDown={onMouseDown}
    >
      <div style={{ position: 'relative' }}>
        <div
          style={{
            transform: `rotate(${table.rotation}deg)`,
          }}
        >
          <TableShape table={table} scale={scale} />
        </div>
        
        {/* Rotation controls */}
        <div className="absolute top-0 right-0 -mr-8 space-y-1">
          <button
            className="p-1.5 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 text-lg"
            onClick={() => onRotate(-45)}
            title="Rotate left"
          >
            ↺
          </button>
          <button
            className="p-1.5 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 text-lg"
            onClick={() => onRotate(45)}
            title="Rotate right"
          >
            ↻
          </button>
        </div>
      </div>
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

  const handleRotate = (tableId: string, amount: number) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    const newRotation = (table.rotation + amount + 360) % 360;
    
    // Update table rotation
    onUpdateTable(table.id, {
      rotation: newRotation
    });

    // Update local state for immediate feedback
    setTables(tables.map(t =>
      t.id === table.id ? { ...t, rotation: newRotation } : t
    ));
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
    newX = Math.max(0, Math.min(room.length - table.template.length * 1.5, newX));
    newY = Math.max(0, Math.min(room.width - table.template.width * 1.5, newY));

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
    maxWidth: 'calc(100vw - 24px)', // 12px margin on each side
    maxHeight: 'calc(100vh - 80px)', // 40px margin on top and bottom
    margin: '12px auto' // Center horizontally with minimal top/bottom margin
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
            onRotate={(amount) => handleRotate(table.id, amount)}
          />
        ))}
      </div>
    </div>
  );
};

export default TableEditor;
