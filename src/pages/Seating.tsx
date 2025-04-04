import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus, Save, Trash2 } from "lucide-react";

// Define types for tables and guests
interface Guest {
  id: string;
  name: string;
}

interface Table {
  id: string;
  name: string;
  capacity: number;
  guests: Guest[];
}

export default function Seating() {
  // State for tables and unassigned guests
  const [tables, setTables] = useState<Table[]>([
    { id: "table-1", name: "Table 1", capacity: 8, guests: [] },
    { id: "table-2", name: "Table 2", capacity: 8, guests: [] },
  ]);
  
  const [unassignedGuests, setUnassignedGuests] = useState<Guest[]>([
    { id: "guest-1", name: "John Smith" },
    { id: "guest-2", name: "Jane Doe" },
    { id: "guest-3", name: "Robert Johnson" },
    { id: "guest-4", name: "Emily Davis" },
    { id: "guest-5", name: "Michael Brown" },
    { id: "guest-6", name: "Sarah Wilson" },
  ]);

  // Handle drag and drop
  const handleDragEnd = (result: any) => {
    const { source, destination } = result;
    
    // If dropped outside a droppable area
    if (!destination) return;
    
    // If dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;
    
    // If moving within unassigned guests
    if (source.droppableId === "unassigned" && destination.droppableId === "unassigned") {
      const newGuests = [...unassignedGuests];
      const [movedGuest] = newGuests.splice(source.index, 1);
      newGuests.splice(destination.index, 0, movedGuest);
      setUnassignedGuests(newGuests);
      return;
    }
    
    // If moving from unassigned to a table
    if (source.droppableId === "unassigned") {
      const tableId = destination.droppableId;
      const tableIndex = tables.findIndex(table => table.id === tableId);
      
      if (tableIndex !== -1) {
        // Check if table has capacity
        if (tables[tableIndex].guests.length >= tables[tableIndex].capacity) {
          return; // Table is full
        }
        
        const newUnassignedGuests = [...unassignedGuests];
        const [movedGuest] = newUnassignedGuests.splice(source.index, 1);
        
        const newTables = [...tables];
        newTables[tableIndex].guests.splice(destination.index, 0, movedGuest);
        
        setUnassignedGuests(newUnassignedGuests);
        setTables(newTables);
        return;
      }
    }
    
    // If moving from a table to unassigned
    if (destination.droppableId === "unassigned") {
      const tableId = source.droppableId;
      const tableIndex = tables.findIndex(table => table.id === tableId);
      
      if (tableIndex !== -1) {
        const newTables = [...tables];
        const [movedGuest] = newTables[tableIndex].guests.splice(source.index, 1);
        
        const newUnassignedGuests = [...unassignedGuests];
        newUnassignedGuests.splice(destination.index, 0, movedGuest);
        
        setTables(newTables);
        setUnassignedGuests(newUnassignedGuests);
        return;
      }
    }
    
    // If moving between tables
    const sourceTableIndex = tables.findIndex(table => table.id === source.droppableId);
    const destTableIndex = tables.findIndex(table => table.id === destination.droppableId);
    
    if (sourceTableIndex !== -1 && destTableIndex !== -1) {
      // Check if destination table has capacity
      if (tables[destTableIndex].guests.length >= tables[destTableIndex].capacity) {
        return; // Destination table is full
      }
      
      const newTables = [...tables];
      const [movedGuest] = newTables[sourceTableIndex].guests.splice(source.index, 1);
      newTables[destTableIndex].guests.splice(destination.index, 0, movedGuest);
      
      setTables(newTables);
    }
  };

  // Add a new table
  const addTable = () => {
    const newTableId = `table-${tables.length + 1}`;
    const newTable: Table = {
      id: newTableId,
      name: `Table ${tables.length + 1}`,
      capacity: 8,
      guests: []
    };
    setTables([...tables, newTable]);
  };

  // Remove a table
  const removeTable = (tableId: string) => {
    const tableIndex = tables.findIndex(table => table.id === tableId);
    if (tableIndex !== -1) {
      const newTables = [...tables];
      const removedTable = newTables.splice(tableIndex, 1)[0];
      
      // Move guests back to unassigned
      const newUnassignedGuests = [...unassignedGuests, ...removedTable.guests];
      
      setTables(newTables);
      setUnassignedGuests(newUnassignedGuests);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white py-12">
      <div className="container mx-auto">
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-semibold text-[#054697]">Seating Chart</h1>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                className="border-[#FFE8E4] text-[#054697] hover:bg-[#FFE8E4]/10"
                onClick={addTable}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Table
              </Button>
              <Button className="bg-[#FFE8E4] text-[#054697] hover:bg-[#FFD5CC]">
                <Save className="w-4 h-4 mr-2" /> Save Layout
              </Button>
            </div>
          </div>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex flex-col gap-8">
              {/* Unassigned Guests */}
              <Card className="border-[#FFE8E4]/30">
                <CardHeader>
                  <CardTitle className="text-[#054697]">Unassigned Guests</CardTitle>
                </CardHeader>
                <CardContent>
                  <Droppable droppableId="unassigned" direction="horizontal">
                    {(provided) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex flex-wrap gap-2 min-h-[60px] p-4 bg-[#FFE8E4]/10 rounded-md"
                      >
                        {unassignedGuests.map((guest, index) => (
                          <Draggable key={guest.id} draggableId={guest.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="px-3 py-2 bg-white border border-[#FFE8E4] rounded-md shadow-sm text-[#054697]"
                              >
                                {guest.name}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
              
              {/* Tables Grid with Background */}
              <div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8 rounded-lg relative"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(5, 70, 151, 0.05) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(5, 70, 151, 0.05) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px',
                  backgroundPosition: 'center center'
                }}
              >
                {tables.map((table) => (
                  <Card key={table.id} className="border-[#FFE8E4]/30 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-[#054697]">{table.name}</CardTitle>
                      <Button 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-[#054697]/70 hover:text-[#054697] hover:bg-[#FFE8E4]/10"
                        onClick={() => removeTable(table.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-[#054697]/70 mb-2">
                        {table.guests.length}/{table.capacity} seats filled
                      </div>
                      <Droppable droppableId={table.id} direction="horizontal">
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="flex flex-wrap gap-2 min-h-[100px] p-4 bg-[#FFE8E4]/10 rounded-md"
                            style={{
                              backgroundImage: `radial-gradient(circle, rgba(255, 232, 228, 0.3) 1px, transparent 1px)`,
                              backgroundSize: '10px 10px',
                            }}
                          >
                            {table.guests.map((guest, index) => (
                              <Draggable key={guest.id} draggableId={guest.id} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="px-3 py-2 bg-white border border-[#FFE8E4] rounded-md shadow-sm text-[#054697]"
                                  >
                                    {guest.name}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
}
