import { useState, FormEvent } from 'react';
import { Plus } from 'lucide-react';

interface CategoryVendorProps {
  categoryId: string;
  onAddVendor: (name: string, allocated: number, categoryId: string) => void;
}

export default function CategoryVendor({ categoryId, onAddVendor }: CategoryVendorProps) {
  const [vendorName, setVendorName] = useState('');
  const [vendorAmount, setVendorAmount] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (vendorName && vendorAmount) {
      const amount = parseInt(vendorAmount);
      if (!isNaN(amount) && amount > 0) {
        onAddVendor(vendorName, amount, categoryId);
        setVendorName('');
        setVendorAmount('');
        setShowForm(false);
      }
    }
  };
  
  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="mt-2 flex items-center text-sm"
        style={{ 
          color: '#054697',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 400,
        }}
      >
        <Plus size={16} className="mr-1" />
        Add Custom Vendor
      </button>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="mt-3 p-3 border border-[#E8B4B4]/30 bg-[#E8B4B4]/5">
      <div className="mb-3">
        <label 
          className="block text-sm font-medium mb-1"
          style={{ 
            fontFamily: 'Poppins, sans-serif', 
            color: '#054697',
            opacity: 0.8
          }}
        >
          Vendor Name
        </label>
        <input
          type="text"
          value={vendorName}
          onChange={(e) => setVendorName(e.target.value)}
          placeholder="Enter vendor name"
          className="block w-full border-[#B8BDD7] shadow-sm focus:ring-[#054697] focus:border-[#054697]"
          style={{ 
            fontFamily: 'Poppins, sans-serif', 
            color: '#054697'
          }}
          required
        />
      </div>
      <div className="mb-3">
        <label 
          className="block text-sm font-medium mb-1"
          style={{ 
            fontFamily: 'Poppins, sans-serif', 
            color: '#054697',
            opacity: 0.8
          }}
        >
          Allocated Budget
        </label>
        <input
          type="number"
          value={vendorAmount}
          onChange={(e) => setVendorAmount(e.target.value)}
          placeholder="Enter amount"
          className="block w-full border-[#B8BDD7] shadow-sm focus:ring-[#054697] focus:border-[#054697]"
          style={{ 
            fontFamily: 'Poppins, sans-serif', 
            color: '#054697'
          }}
          required
          min="1"
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="px-3 py-1 border border-[#054697] text-[#054697] hover:bg-[#054697]/5"
          style={{ 
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 400,
            textTransform: 'uppercase'
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-1"
          style={{ 
            backgroundColor: '#FFE8E4', 
            color: '#054697',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 400,
            textTransform: 'uppercase'
          }}
        >
          <Plus size={16} className="inline-block mr-1" />
          Add Vendor
        </button>
      </div>
    </form>
  );
}
