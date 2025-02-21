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
  floor_plan_url?: string;
  table_scale?: number;
}

interface TableEditorProps {
  tables: TableInstance[];
  setTables: (tables: TableInstance[]) => void;
  room: Room;
  onUpdateTable: (tableId: string, updates: Partial<TableInstance>) => void;
  onDeleteTable: (tableId: string) => void;
}

interface SpecialAreaData {
  id: string;
  name: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  color: string;
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
          fontSize: Math.max(12, scale / 4),
          ...style
        }}
      >
        <span className="font-medium">{table.name}</span>
      </div>
    );
  }

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
        fontSize: Math.max(12, scale / 4),
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
  const buttonSize = Math.max(24, scale / 3);
  
  return (
    <div
      style={{
        position: 'absolute',
        left: `${table.position_x * scale}px`,
        top: `${table.position_y * scale}px`,
        transform: `rotate(${table.rotation}deg)`,
        cursor: 'move',
        userSelect: 'none',
        outline: selected ? '2px solid #4B5563' : 'none',
        outlineOffset: '2px',
        zIndex: selected ? 10 : 1
      }}
      onMouseDown={onMouseDown}
    >
      <TableShape table={table} scale={scale} />
      <button
        className="absolute -top-2 -right-2 bg-white rounded-full shadow-md hover:bg-gray-100"
        style={{ width: buttonSize, height: buttonSize }}
        onClick={(e) => {
          e.stopPropagation();
          onRotate(45);
        }}
      >
        ↻
      </button>
    </div>
  );
};

const DraggableSpecialArea: React.FC<{
  area: SpecialAreaData;
  scale: number;
  onMouseDown: (e: React.MouseEvent) => void;
  selected: boolean;
}> = ({ area, scale, onMouseDown, selected }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: area.position_x * scale,
        top: area.position_y * scale,
        width: area.width * scale,
        height: area.height * scale,
        border: `2px solid ${area.color}`,
        backgroundColor: `${area.color}33`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.max(12, scale / 4),
        color: area.color,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        cursor: 'move',
        outline: selected ? `2px solid #4B5563` : 'none',
        outlineOffset: '2px'
      }}
      onMouseDown={onMouseDown}
    >
      {area.name}
    </div>
  );
};

export const TableEditor: React.FC<TableEditorProps> = ({
  room,
  tables,
  onUpdateTable,
  onDeleteTable,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [tableStart, setTableStart] = useState<{ x: number; y: number } | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [floorPlanImage, setFloorPlanImage] = useState<HTMLImageElement | null>(null);

  // Use the AI-calculated scale if available, otherwise use 76.8 pixels per foot
  const scale = room.table_scale || 76.8; // pixels per foot

  useEffect(() => {
    // Load floor plan image once
    if (room.floor_plan_url && !floorPlanImage) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = room.floor_plan_url;
      img.onload = () => {
        setFloorPlanImage(img);
        setImageSize({ width: img.width, height: img.height });
        
        // Update room scale if not set
        if (!room.table_scale) {
          console.log('Setting default scale to 76.8 pixels per foot');
          supabase
            .from('rooms')
            .update({ table_scale: 76.8 })
            .eq('id', room.id)
            .then(({ error }) => {
              if (error) {
                console.error('Error updating room scale:', error);
              }
            });
        }
      };
      img.onerror = (e) => {
        console.error('Error loading floor plan image:', e);
      };
    }
  }, [room.floor_plan_url]);

  useEffect(() => {
    console.log('TableEditor state:', {
      room,
      tables,
      scale,
      imageSize,
      selectedTable
    });
    drawCanvas();
  }, [room, tables, scale, selectedTable, floorPlanImage]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas ref is null');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }

    // Set canvas size
    if (floorPlanImage) {
      canvas.width = floorPlanImage.width;
      canvas.height = floorPlanImage.height;
    } else {
      canvas.width = room.length * scale;
      canvas.height = room.width * scale;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw floor plan if available
    if (floorPlanImage) {
      ctx.drawImage(floorPlanImage, 0, 0);
    }

    // Draw tables
    tables.forEach(table => {
      drawTable(ctx, table);
    });
  };

  const drawTable = (ctx: CanvasRenderingContext2D, table: TableInstance) => {
    if (!scale) {
      console.error('Scale is 0 or undefined');
      return;
    }

    console.log('Drawing table:', {
      table,
      scale,
      dimensions: {
        width: table.template.width * scale,
        length: table.template.length * scale
      }
    });

    ctx.save();
    
    // Calculate scaled position
    const x = table.position_x * scale;
    const y = table.position_y * scale;
    
    // Move to table position
    ctx.translate(x, y);
    ctx.rotate((table.rotation * Math.PI) / 180);

    // Calculate table dimensions
    const tableWidth = table.template.width * scale;
    const tableLength = table.template.length * scale;

    // Draw table
    ctx.beginPath();
    if (table.template.shape === 'round') {
      ctx.arc(0, 0, tableWidth / 2, 0, 2 * Math.PI);
    } else {
      ctx.rect(
        -tableLength / 2,
        -tableWidth / 2,
        tableLength,
        tableWidth
      );
    }

    // Fill and stroke
    ctx.fillStyle = table.id === selectedTable ? '#e5e7eb' : '#f3f4f6';
    ctx.fill();
    ctx.strokeStyle = table.id === selectedTable ? '#2563eb' : '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Add table name
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(table.name, 0, 0);
    
    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !scale) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    // Find clicked table
    const clickedTable = tables.find(table => {
      const dx = x - table.position_x;
      const dy = y - table.position_y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance * scale <= (table.template.width * scale) / 2;
    });

    if (clickedTable) {
      setSelectedTable(clickedTable.id);
      setDragStart({ x: e.clientX, y: e.clientY });
      setTableStart({ x: clickedTable.position_x, y: clickedTable.position_y });
    } else {
      setSelectedTable(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragStart || !tableStart || !selectedTable || !scale) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const dx = (e.clientX - dragStart.x) / scale;
    const dy = (e.clientY - dragStart.y) / scale;

    onUpdateTable(selectedTable, {
      position_x: tableStart.x + dx,
      position_y: tableStart.y + dy
    });
  };

  const handleMouseUp = () => {
    setDragStart(null);
    setTableStart(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <h3 className="text-lg font-medium text-gray-900">Table Layout</h3>
        <p className="text-sm text-gray-500">Scale: {scale} pixels per foot</p>
      </div>
      <div className="p-4">
        <div className="relative w-full h-[600px] border border-gray-200 rounded">
          <canvas 
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-contain"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
      </div>
    </div>
  );
};

export default TableEditor;
