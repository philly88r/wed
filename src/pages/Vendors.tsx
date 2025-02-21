// @ts-nocheck
import { useState, useEffect } from 'react';
import { Plus, Phone, Mail, MapPin, DollarSign, Star, Trash2, Edit2 } from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  category: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  price?: number;
  notes?: string;
  rating?: number;
  status: 'researching' | 'contacted' | 'meeting-scheduled' | 'hired' | 'declined';
}

const categories = [
  'Venue',
  'Catering',
  'Photography',
  'Videography',
  'Music',
  'Florist',
  'Cake',
  'Attire',
  'Hair & Makeup',
  'Transportation',
  'Rentals',
  'Lighting',
  'Invitations',
  'Other'
];

const statusColors = {
  'researching': 'bg-gray-100 text-gray-800',
  'contacted': 'bg-blue-100 text-blue-800',
  'meeting-scheduled': 'bg-purple-100 text-purple-800',
  'hired': 'bg-emerald-100 text-emerald-800',
  'declined': 'bg-rose-100 text-rose-800'
};

const statusLabels = {
  'researching': 'Researching',
  'contacted': 'Contacted',
  'meeting-scheduled': 'Meeting Scheduled',
  'hired': 'Hired',
  'declined': 'Declined'
};

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [newVendor, setNewVendor] = useState<Partial<Vendor>>({
    category: categories[0],
    status: 'researching'
  });

  useEffect(() => {
    const savedVendors = localStorage.getItem('wedding-vendors');
    if (savedVendors) {
      setVendors(JSON.parse(savedVendors));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('wedding-vendors', JSON.stringify(vendors));
  }, [vendors]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVendor) {
      setVendors(prev =>
        prev.map(vendor =>
          vendor.id === editingVendor.id
            ? { ...editingVendor, ...newVendor }
            : vendor
        )
      );
    } else {
      setVendors(prev => [
        ...prev,
        { ...newVendor, id: Date.now().toString() } as Vendor
      ]);
    }
    setNewVendor({ category: categories[0], status: 'researching' });
    setEditingVendor(null);
    setShowForm(false);
  };

  const startEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setNewVendor(vendor);
    setShowForm(true);
  };

  const deleteVendor = (id: string) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      setVendors(prev => prev.filter(vendor => vendor.id !== id));
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Vendor Management</h1>
        <button
          onClick={() => {
            setNewVendor({ category: categories[0], status: 'researching' });
            setEditingVendor(null);
            setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Vendor
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">
              {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor Name
                  </label>
                  <input
                    type="text"
                    value={newVendor.name || ''}
                    onChange={e => setNewVendor(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newVendor.category}
                    onChange={e => setNewVendor(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newVendor.phone || ''}
                    onChange={e => setNewVendor(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newVendor.email || ''}
                    onChange={e => setNewVendor(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={newVendor.address || ''}
                    onChange={e => setNewVendor(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={newVendor.website || ''}
                    onChange={e => setNewVendor(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    value={newVendor.price || ''}
                    onChange={e => setNewVendor(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={newVendor.status}
                    onChange={e => setNewVendor(prev => ({ ...prev, status: e.target.value as Vendor['status'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  <select
                    value={newVendor.rating || ''}
                    onChange={e => setNewVendor(prev => ({ ...prev, rating: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                  >
                    <option value="">Select rating</option>
                    {[1, 2, 3, 4, 5].map(rating => (
                      <option key={rating} value={rating}>
                        {'★'.repeat(rating)} {'☆'.repeat(5 - rating)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={newVendor.notes || ''}
                    onChange={e => setNewVendor(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingVendor(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700"
                >
                  {editingVendor ? 'Save Changes' : 'Add Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map(vendor => (
          <div
            key={vendor.id}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                {vendor.name}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  statusColors[vendor.status]
                }`}
              >
                {statusLabels[vendor.status]}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {vendor.phone && (
                <div className="flex items-center text-sm text-gray-500">
                  <Phone className="w-4 h-4 mr-2" />
                  {vendor.phone}
                </div>
              )}
              {vendor.email && (
                <div className="flex items-center text-sm text-gray-500">
                  <Mail className="w-4 h-4 mr-2" />
                  {vendor.email}
                </div>
              )}
              {vendor.address && (
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="w-4 h-4 mr-2" />
                  {vendor.address}
                </div>
              )}
              {vendor.price && (
                <div className="flex items-center text-sm text-gray-500">
                  <DollarSign className="w-4 h-4 mr-2" />
                  {vendor.price.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  })}
                </div>
              )}
              {vendor.rating && (
                <div className="flex items-center text-sm text-gray-500">
                  <Star className="w-4 h-4 mr-2" />
                  {'★'.repeat(vendor.rating)}{'☆'.repeat(5 - vendor.rating)}
                </div>
              )}
            </div>

            {vendor.notes && (
              <p className="mt-4 text-sm text-gray-600">{vendor.notes}</p>
            )}

            <div className="mt-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[vendor.status]}`}>
                {statusLabels[vendor.status]}
              </span>
            </div>
          </div>
        ))}
      </div>

      {vendors.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors added yet</h3>
          <p className="text-gray-500">Click the "Add Vendor" button to start managing your vendors.</p>
        </div>
      )}
    </div>
  );
}
