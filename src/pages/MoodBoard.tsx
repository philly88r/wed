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

export default function MoodBoard() {
  const [images, setImages] = useState<InspirationImage[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newImage, setNewImage] = useState<Partial<InspirationImage>>({
    category: categories[0]
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedImages = localStorage.getItem('wedding-mood-board');
    if (savedImages) {
      setImages(JSON.parse(savedImages));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('wedding-mood-board', JSON.stringify(images));
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
    a.download = 'wedding-mood-board.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 
          className="text-3xl font-bold" 
          style={{ 
            fontFamily: "'Giaza', serif", 
            color: '#054697',
            letterSpacing: '-0.05em'
          }}
        >
          Wedding Mood Board
        </h1>
        <div className="flex gap-4">
          <button
            onClick={downloadBoard}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium"
            style={{
              backgroundColor: 'transparent',
              color: '#054697',
              borderColor: '#E8B4B4',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 400,
              textTransform: 'uppercase'
            }}
          >
            <Download className="w-5 h-5 mr-2" />
            Export Board
          </button>
          <button
            onClick={() => {
              setNewImage({ category: categories[0] });
              setShowForm(true);
            }}
            className="inline-flex items-center px-4 py-2 text-sm font-medium"
            style={{
              backgroundColor: '#E8B4B4',
              color: '#054697',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 400,
              textTransform: 'uppercase'
            }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Image
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className="px-4 py-2 rounded-full text-sm font-medium"
            style={{
              backgroundColor: selectedCategory === 'all' ? '#E8B4B4' : 'rgba(5, 70, 151, 0.1)',
              color: '#054697',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 400
            }}
          >
            All
          </button>
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => setSelectedCategory(category === selectedCategory ? 'all' : category)}
              className="px-4 py-2 rounded-full text-sm font-medium"
              style={{
                backgroundColor: category === selectedCategory ? '#E8B4B4' : 'rgba(5, 70, 151, 0.1)',
                color: '#054697',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 400
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div 
            className="bg-white p-6 w-full max-w-md"
            style={{
              position: 'relative',
              boxShadow: '0 4px 20px rgba(5, 70, 151, 0.1)',
              border: '1px solid rgba(5, 70, 151, 0.1)'
            }}
          >
            <div 
              style={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                backgroundColor: '#054697'
              }}
            ></div>
            <h2 
              className="text-xl font-semibold mb-4"
              style={{ 
                fontFamily: "'Giaza', serif", 
                color: '#054697',
                letterSpacing: '-0.05em'
              }}
            >
              Add Inspiration Image
            </h2>
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

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#054697',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 400,
                    textTransform: 'uppercase'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium"
                  style={{
                    backgroundColor: '#E8B4B4',
                    color: '#054697',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 400,
                    textTransform: 'uppercase'
                  }}
                >
                  Add Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredImages.map((image) => (
          <div 
            key={image.id} 
            className="bg-white shadow-md overflow-hidden flex flex-col"
            style={{
              border: '1px solid rgba(5, 70, 151, 0.1)',
              position: 'relative'
            }}
          >
            <div 
              style={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                backgroundColor: '#054697'
              }}
            ></div>
            <div className="relative aspect-w-16 aspect-h-9 bg-gray-200">
              <img
                src={image.url}
                alt={image.title}
                className="object-cover w-full h-full"
              />
              <button
                onClick={() => deleteImage(image.id)}
                className="absolute top-2 right-2 p-1 rounded-full bg-white text-gray-700 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 flex-grow">
              <div className="flex justify-between items-start mb-2">
                <h3 
                  className="text-lg font-semibold line-clamp-1"
                  style={{ 
                    fontFamily: "'Giaza', serif", 
                    color: '#054697',
                    letterSpacing: '-0.05em'
                  }}
                >
                  {image.title}
                </h3>
                <span 
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: 'rgba(5, 70, 151, 0.1)',
                    color: '#054697',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 400
                  }}
                >
                  {image.category}
                </span>
              </div>
              {image.description && (
                <p 
                  className="text-sm mb-3 line-clamp-2"
                  style={{ 
                    color: '#054697', 
                    opacity: 0.8,
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 300
                  }}
                >
                  {image.description}
                </p>
              )}
              {image.source && (
                <a
                  href={image.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs mt-2"
                  style={{ 
                    color: '#054697', 
                    opacity: 0.8,
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 300
                  }}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Source
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div 
          className="bg-gray-50 p-8 text-center rounded-lg border border-dashed"
          style={{
            borderColor: 'rgba(5, 70, 151, 0.2)',
          }}
        >
          <ImageIcon className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(5, 70, 151, 0.3)' }} />
          <h3 
            className="text-lg font-medium mb-2"
            style={{ 
              fontFamily: "'Giaza', serif", 
              color: '#054697',
              letterSpacing: '-0.05em'
            }}
          >
            No images yet
          </h3>
          <p 
            className="text-sm mb-4"
            style={{ 
              color: '#054697', 
              opacity: 0.8,
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 300
            }}
          >
            Start adding inspiration images to your mood board
          </p>
          <button
            onClick={() => {
              setNewImage({ category: categories[0] });
              setShowForm(true);
            }}
            className="inline-flex items-center px-4 py-2 text-sm font-medium"
            style={{
              backgroundColor: '#E8B4B4',
              color: '#054697',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 400,
              textTransform: 'uppercase'
            }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add First Image
          </button>
        </div>
      )}
    </div>
  );
}
