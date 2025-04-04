import React, { useState, useEffect, useRef } from 'react';
import { Plus, Image as ImageIcon, X, ExternalLink, Download } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { createCustomLink } from '../utils/customLinksHelper';
import MoodboardGenerator from '../components/MoodboardGenerator';
import { Tabs, Tab, Box } from '@mui/material';

interface InspirationImage {
  id: string;
  title: string;
  description?: string;
  url: string;
  category: string;
  source?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`moodboard-tabpanel-${index}`}
      aria-labelledby={`moodboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
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
  const [tabValue, setTabValue] = useState(0);
  const [falApiKey, setFalApiKey] = useState<string>('');

  // Create a custom link for the current path to fix the 406 error
  useEffect(() => {
    const setupCustomLink = async () => {
      try {
        // Create a custom link for both paths to ensure they work
        await createCustomLink('vision-board', 'Mood Board');
        await createCustomLink('mood-board', 'Mood Board');
        console.log('Custom links created successfully');
      } catch (error) {
        console.error('Error creating custom links:', error);
      }
    };
    
    setupCustomLink();
  }, []);

  useEffect(() => {
    // Try to load from mood-board key first, then fall back to vision-board for backward compatibility
    const savedImages = localStorage.getItem('wedding-mood-board') || localStorage.getItem('wedding-vision-board');
    if (savedImages) {
      setImages(JSON.parse(savedImages));
    }
  }, []);

  useEffect(() => {
    // Save to the new mood-board key
    localStorage.setItem('wedding-mood-board', JSON.stringify(images));
  }, [images]);

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase
        .from('images')
        .select('*');
      if (error) {
        console.error(error);
      } else {
        setImages(data);
      }
    };
    fetchImages();
  }, []);

  useEffect(() => {
    const saveImages = async () => {
      const { error } = await supabase
        .from('images')
        .upsert(images);
      if (error) {
        console.error(error);
      }
    };
    saveImages();
  }, [images]);

  useEffect(() => {
    // Get FAL API key from environment variables
    if (import.meta.env.VITE_FAL_KEY) {
      setFalApiKey(import.meta.env.VITE_FAL_KEY as string);
    }
  }, []);

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

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const importedData = JSON.parse(reader.result as string);
          setImages(importedData);
          localStorage.setItem('wedding-mood-board', JSON.stringify(importedData));
          alert('Mood board imported successfully!');
        } catch (error) {
          alert('Error importing mood board. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Mood Board</h1>
        <div className="flex space-x-3">
          <button
            onClick={downloadBoard}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Download className="w-5 h-5 mr-2" />
            Export Mood Board
          </button>
          <button
            onClick={() => document.getElementById('import-board')?.click()}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            Import Mood Board
          </button>
          <input
            type="file"
            id="import-board"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
          <button
            onClick={() => {
              setNewImage({ category: categories[0] });
              setShowForm(true);
            }}
            className="flex items-center px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700"
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

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Mood Board Generator</h1>
        <div className="flex space-x-3">
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Classic Mood Board" />
            <Tab label="AI Mood Board Generator" />
          </Tabs>
        </div>
      </div>

      <TabPanel value={tabValue} index={0}>
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
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <MoodboardGenerator falApiKey={falApiKey} />
      </TabPanel>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add to Mood Board</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
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

      {filteredImages.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No images yet</h3>
          <p className="mt-1 text-gray-500">Get started by adding images to your mood board.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Add Your First Image
          </button>
        </div>
      )}
    </div>
  );
}
