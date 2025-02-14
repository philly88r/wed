// @ts-nocheck
import React from 'react';
import { Move } from 'lucide-react';

interface TableProps {
  id: string;
  name: string;
  shape: 'round' | 'rectangular' | 'square' | 'oval';
  width: number;
  length: number;
  seats: number;
  positionX: number;
  positionY: number;
  rotation: number;
  pixelsPerFoot: number;
  selected: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onRotate: (id: string, rotation: number) => void;
}

export const Table: React.FC<TableProps> = ({
  id,
  name,
  shape,
  width,
  length,
  seats,
  positionX,
  positionY,
  rotation,
  pixelsPerFoot,
  selected,
  onSelect,
  onMove,
  onRotate,
}) => {
  const widthPx = width * pixelsPerFoot;
  const lengthPx = length * pixelsPerFoot;

  // Calculate seat positions
  const getSeatPositions = () => {
    const positions = [];
    if (shape === 'round') {
      // For round tables, distribute seats evenly around the circumference
      const radius = widthPx / 2;
      for (let i = 0; i < seats; i++) {
        const angle = (i * 360) / seats;
        const radians = (angle * Math.PI) / 180;
        positions.push({
          x: radius * Math.cos(radians),
          y: radius * Math.sin(radians),
          angle,
        });
      }
    } else {
      // For rectangular tables, distribute seats along the edges
      const seatsPerLongSide = Math.floor(seats / 2);
      const spacing = lengthPx / (seatsPerLongSide + 1);
      
      // Add seats to long sides
      for (let i = 0; i < seatsPerLongSide; i++) {
        // Top side
        positions.push({
          x: spacing * (i + 1) - widthPx / 2,
          y: -widthPx / 2 - 20,
          angle: 0,
        });
        // Bottom side
        positions.push({
          x: spacing * (i + 1) - widthPx / 2,
          y: widthPx / 2 + 20,
          angle: 180,
        });
      }
    }
    return positions;
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', id);
    onSelect(id);
  };

  const seatPositions = getSeatPositions();

  return (
    <div
      className={`absolute cursor-move ${selected ? 'z-10' : 'z-0'}`}
      style={{
        transform: `translate(${positionX}px, ${positionY}px) rotate(${rotation}deg)`,
        transition: 'transform 0.2s ease-out',
      }}
      draggable
      onDragStart={handleDragStart}
      onClick={() => onSelect(id)}
    >
      {/* Table Shape */}
      <div
        className={`
          relative
          ${selected ? 'ring-2 ring-emerald-500' : 'ring-1 ring-gray-300'}
          ${shape === 'round' ? 'rounded-full' : 'rounded-lg'}
          bg-white shadow-md
        `}
        style={{
          width: widthPx,
          height: shape === 'round' ? widthPx : lengthPx,
          marginLeft: -widthPx / 2,
          marginTop: shape === 'round' ? -widthPx / 2 : -lengthPx / 2,
        }}
      >
        {/* Table Name */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium text-gray-600">{name}</span>
        </div>

        {/* Move Handle */}
        {selected && (
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <Move className="w-5 h-5 text-emerald-600" />
          </div>
        )}

        {/* Rotation Handle */}
        {selected && (
          <div
            className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onRotate(id, (rotation + 45) % 360);
            }}
          >
            <svg
              className="w-5 h-5 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Seats */}
      {seatPositions.map((pos, index) => (
        <div
          key={index}
          className="absolute w-4 h-4 bg-gray-200 rounded-full border border-gray-300"
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) rotate(${pos.angle}deg)`,
          }}
        />
      ))}
    </div>
  );
};

export default Table;
