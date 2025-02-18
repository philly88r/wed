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
  // Use exact scale - no artificial multiplier
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
          fontSize: Math.max(12, scale / 4), // Scale font size with table size
          ...style
        }}
      >
        <span className="font-medium">{table.name}</span>
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
          fontSize: Math.max(12, scale / 4), // Scale font size with table size
          ...style
        }}
      >
        <span className="font-medium">{table.name}</span>
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
        fontSize: Math.max(12, scale / 4), // Scale font size with table size
        ...style
      }}
    >
      <span className="font-medium">{table.name}</span>
    </div>
  );
};

const DraggableTable: React.FC<{
  table: TableInstance;
  scale: number;
  onMouseDown: (e: React.MouseEvent) => void;
  onRotate: (amount: number) => void;
  selected: boolean;
}> = ({ table, scale, onMouseDown, onRotate, selected }) => {
  const buttonSize = Math.max(24, scale / 3); // Scale button size with table size
  
  return (
    <div
      style={{
        position: 'absolute',
        left: table.position_x * scale,
        top: table.position_y * scale,
        cursor: 'move',
        userSelect: 'none',
        border: selected ? '2px solid #4B5563' : 'none'
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
            style={{
              width: buttonSize,
              height: buttonSize,
              fontSize: Math.max(14, scale / 5),
            }}
            className="bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 flex items-center justify-center"
            onClick={() => onRotate(-45)}
            title="Rotate left"
          >
            ↺
          </button>
          <button
            style={{
              width: buttonSize,
              height: buttonSize,
              fontSize: Math.max(14, scale / 5),
            }}
            className="bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 flex items-center justify-center"
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

const SpecialArea: React.FC<{
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  color: string;
}> = ({ name, x, y, width, height, scale, color }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: x * scale,
        top: y * scale,
        width: width * scale,
        height: height * scale,
        border: `2px solid ${color}`,
        backgroundColor: `${color}33`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.max(12, scale / 4),
        color: color,
        fontWeight: 'bold',
        textTransform: 'uppercase'
      }}
    >
      {name}
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Fixed dimensions for all rooms (in pixels)
  const FIXED_ROOM_WIDTH = 800;
  const FIXED_ROOM_HEIGHT = 600;

  // Calculate the scale factor based on room dimensions
  const roomScaleFactor = Math.min(
    FIXED_ROOM_WIDTH / (room.length || 1),
    FIXED_ROOM_HEIGHT / (room.width || 1)
  );

  // Scale table dimensions based on room size
  const getTableDimensions = (table: TableInstance) => {
    const baseSize = table.template.width * roomScaleFactor;
    return {
      width: baseSize,
      height: table.template.shape === 'round' ? baseSize : table.template.length * roomScaleFactor
    };
  };

  const handleMouseDown = (e: React.MouseEvent, tableId: string) => {
    setSelectedTable(tableId);
    const table = tables.find(t => t.id === tableId);
    if (table) {
      setDragOffset({
        x: e.clientX - table.position_x * scale,
        y: e.clientY - table.position_y * scale
      });
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
    if (!selectedTable || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const table = tables.find(t => t.id === selectedTable);
    if (!table) return;

    // Calculate new position in feet
    let newX = (e.clientX - dragOffset.x) / scale;
    let newY = (e.clientY - dragOffset.y) / scale;

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
    setSelectedTable(null);
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: FIXED_ROOM_WIDTH,
          height: FIXED_ROOM_HEIGHT,
          border: '2px solid #000',
          backgroundColor: '#fff',
          overflow: 'hidden'
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Special Areas - scaled according to room size */}
        <SpecialArea
          name="Bar"
          x={10}
          y={2}
          width={30 * roomScaleFactor / scale}
          height={8 * roomScaleFactor / scale}
          scale={scale}
          color="#2563EB"
        />
        <SpecialArea
          name="DJ"
          x={15}
          y={15}
          width={6 * roomScaleFactor / scale}
          height={6 * roomScaleFactor / scale}
          scale={scale}
          color="#3B82F6"
        />
        <SpecialArea
          name="Cake"
          x={45}
          y={45}
          width={6 * roomScaleFactor / scale}
          height={6 * roomScaleFactor / scale}
          scale={scale}
          color="#10B981"
        />

        {tables.map(table => {
          const dimensions = getTableDimensions(table);
          return (
            <DraggableTable
              key={table.id}
              table={{
                ...table,
                template: {
                  ...table.template,
                  width: dimensions.width / scale,
                  length: dimensions.height / scale
                }
              }}
              scale={scale}
              onMouseDown={(e) => handleMouseDown(e, table.id)}
              onRotate={(angle) => handleRotate(table.id, angle)}
              selected={selectedTable === table.id}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TableEditor;
