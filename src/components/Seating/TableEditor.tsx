// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

interface TableEditorProps {
  tables: Table[];
  onTableMove: (tableId: string, x: number, y: number) => void;
  layoutWidth: number;
  layoutLength: number;
  scale: number; // pixels per foot
}

interface Table {
  id: string;
  name: string;
  position_x: number;
  position_y: number;
  rotation: number;
  template: TableTemplate;
}

interface TableTemplate {
  id: string;
  name: string;
  shape: 'round' | 'rectangular' | 'square' | 'oval';
  width: number;
  length: number;
  seats: number;
}

const TableShape: React.FC<{
  table: Table;
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
  table: Table;
  scale: number;
}> = ({ table, scale }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: table.position_x,
        top: table.position_y,
        cursor: 'move',
        userSelect: 'none',
        transform: CSS.Transform.toString({
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
        })
      }}
    >
      <TableShape table={table} scale={scale} />
    </div>
  );
};

export const TableEditor: React.FC<TableEditorProps> = ({
  tables,
  onTableMove,
  layoutWidth,
  layoutLength,
  scale
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const tableId = active.id as string;
    const { x, y } = delta;
    onTableMove(tableId, x, y);
  };

  return (
    <div
      className="relative bg-white border-2 border-gray-300 rounded-lg"
      style={{
        width: layoutWidth * scale,
        height: layoutLength * scale,
      }}
    >
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        {tables.map((table) => (
          <DraggableTable
            key={table.id}
            table={table}
            scale={scale}
          />
        ))}
      </DndContext>

      {/* Grid Lines */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: Math.floor(layoutWidth) }).map((_, i) => (
          <div
            key={`vertical-${i}`}
            className="absolute top-0 bottom-0 border-l border-gray-200"
            style={{ left: i * scale }}
          />
        ))}
        {Array.from({ length: Math.floor(layoutLength) }).map((_, i) => (
          <div
            key={`horizontal-${i}`}
            className="absolute left-0 right-0 border-t border-gray-200"
            style={{ top: i * scale }}
          />
        ))}
      </div>
    </div>
  );
};
