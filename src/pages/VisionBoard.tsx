import { useState, useEffect, useRef } from 'react';
import { Plus, Image as ImageIcon, X, ExternalLink, Download } from 'lucide-react';

interface InspirationImage {
  id: string;
  url: string;
  title: string;
  description?: string;
  category: string;
  source?: string;
}

const categories = [
  'Ceremony',
  'Reception',
  'Decor',
  'Flowers',
  'Attire',
  'Hair & Makeup',
  'Food & Cake',
  'Other'
];

export default function VisionBoard() {
  const [images, setImages] = useState<InspirationImage[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newImage, setNewImage] = useState<Partial<InspirationImage>>({
    category: categories[0]
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedImages = localStorage.getItem('wedding-vision-board');
    if (savedImages) {
      setImages(JSON.parse(savedImages));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('wedding-vision-board', JSON.stringify(images));
  }, [images]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(prev => ({ ...prev, url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newImage.url && newImage.title) {
      setImages(prev => [
        ...prev,
        { ...newImage, id: Date.now().toString() } as InspirationImage
      ]);
      setNewImage({ category: categories[0] });
      setShowForm(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const deleteImage = (id: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      setImages(prev => prev.filter(image => image.id !== id));
    }
  };

  const filteredImages = images.filter(
    image => selectedCategory === 'all' || image.category === selectedCategory
  );

  const downloadBoard = () => {
    const data = JSON.stringify(images, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wedding-vision-board.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Vision Board</h1>
        <div className="flex space-x-3">
          <button
            onClick={downloadBoard}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <Download className="w-5 h-5 mr-2" />
            Export Board
          </button>
          <button
            onClick={() => {
              setNewImage({ category: categories[0] });
              setShowForm(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Image
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-4 mb-8">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => setSelectedCategory(category === selectedCategory ? '' : category)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                category === selectedCategory
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Inspiration Image</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newImage.title || ''}
                  onChange={e => setNewImage(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newImage.description || ''}
                  onChange={e => setNewImage(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newImage.category}
                  onChange={e => setNewImage(prev => ({ ...prev, category: e.target.value }))}
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
                  Source URL
                </label>
                <input
                  type="url"
                  value={newImage.source || ''}
                  onChange={e => setNewImage(prev => ({ ...prev, source: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                  placeholder="Optional"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700"
                >
                  Add Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredImages.map(image => (
          <div
            key={image.id}
            className="bg-white rounded-xl shadow-sm overflow-hidden group"
          >
            <div className="relative aspect-w-16 aspect-h-9">
              <img
                src={image.url}
                alt={image.title}
                className="object-cover w-full h-full"
              />
              <button
                onClick={() => deleteImage(image.id)}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {image.title}
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {image.category}
                </span>
              </div>
              {image.description && (
                <p className="mt-2 text-sm text-gray-500">{image.description}</p>
              )}
              {image.source && (
                <a
                  href={image.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center text-sm text-rose-600 hover:text-rose-700"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Source
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No images yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            {images.length === 0
              ? "Get started by adding your first inspiration image."
              : "No images found in this category."}
          </p>
        </div>
      )}
    </div>
  );
}
