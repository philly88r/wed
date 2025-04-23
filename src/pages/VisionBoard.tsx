import React, { useState, useEffect, useRef } from 'react';
import { Plus, Image as ImageIcon, X, ExternalLink } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { createCustomLink } from '../utils/customLinksHelper';
import { setupMoodboardDatabase, ensureUserHasMoodboard } from '../utils/databaseSetup';
import MoodboardGenerator from '../components/MoodboardGenerator/MoodboardGenerator';
import MoodboardTemplate from '../components/MoodboardGenerator/MoodboardTemplate';
import { 
  Box, 
  Typography, 
  Button, 
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme
} from '@mui/material';
import { HexColorPicker } from 'react-colorful';

interface InspirationImage {
  id: string;
  moodboard_id: string;
  title: string;
  description: string;
  url: string;
  storage_path: string | null;
  category: string;
  source: string;
  position: number;
}

interface Moodboard {
  id: string;
  title: string;
  description?: string;
  colors: string[];
  isLocal?: boolean;
}

// Categories for the moodboard
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
  const theme = useTheme();
  const [images, setImages] = useState<InspirationImage[]>([]);
  const [moodboard, setMoodboard] = useState<Moodboard | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newImage, setNewImage] = useState<Partial<InspirationImage>>({
    category: categories[0]
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [falApiKey, setFalApiKey] = useState<string>('');
  const [showMoodboardTemplate, setShowMoodboardTemplate] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [classicColors, setClassicColors] = useState<string[]>([]);
  const [currentClassicColor, setCurrentClassicColor] = useState<string>('#054697');
  const [generatedImages, setGeneratedImages] = useState<{category: string, imageUrl: string}[]>([]);
  const [showAITemplate, setShowAITemplate] = useState(false);
  const [activeTab, setActiveTab] = useState<'classic' | 'ai'>('classic');

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
    const initializeMoodboard = async () => {
      try {
        // First, ensure the database structure is set up correctly
        await setupMoodboardDatabase();
        
        // Then ensure the user has a moodboard and get its ID
        const moodboardId = await ensureUserHasMoodboard();
        
        if (!moodboardId) {
          console.error('Could not get or create moodboard');
          return;
        }
        
        // Default colors following brand guidelines
        const defaultColors = ['#054697', '#FFE8E4', '#FF5C39', '#B8BDD7'];
        
        // Get the moodboard details
        const { data: moodboards, error: boardError } = await supabase
          .from('moodboards')
          .select('*')
          .eq('id', moodboardId)
          .limit(1);
        
        if (boardError) {
          console.error('Error fetching moodboard:', boardError);
          return;
        }
        
        if (moodboards && moodboards.length > 0) {
          // Use existing moodboard
          setMoodboard(moodboards[0]);
          
          // Set colors if available
          if (moodboards[0].colors) {
            setSelectedColors(moodboards[0].colors);
            setClassicColors(moodboards[0].colors);
          } else {
            setSelectedColors(defaultColors);
            setClassicColors(defaultColors);
            
            // Update moodboard with default colors
            const { error: updateError } = await supabase
              .from('moodboards')
              .update({ colors: defaultColors })
              .eq('id', moodboardId);
              
            if (updateError) {
              console.error('Error updating moodboard colors:', updateError);
            }
          }
          
          // Now fetch the images for this moodboard
          const { data: imageData, error: imageError } = await supabase
            .from('moodboard_images')
            .select('*')
            .eq('moodboard_id', moodboardId)
            .order('position', { ascending: true });
          
          if (imageError) {
            console.error('Error fetching images:', imageError);
            return;
          }
          
          if (imageData && imageData.length > 0) {
            setImages(imageData);
          }
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    };
    
    initializeMoodboard();
  }, []);

  useEffect(() => {
    // Save colors to moodboard when they change
    const saveMoodboardColors = async () => {
      if (!moodboard) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      const { error } = await supabase
        .from('moodboards')
        .update({ colors: selectedColors })
        .eq('id', moodboard.id);
      
      if (error) {
        console.error('Error updating moodboard colors:', error);
      }
    };
    
    if (selectedColors.length > 0 && moodboard) {
      saveMoodboardColors();
    }
  }, [selectedColors, moodboard]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!moodboard) {
      console.error('No moodboard found');
      return;
    }
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      console.error('User not authenticated');
      return;
    }
    
    if (newImage.url && newImage.title) {
      // If the image is a data URL (uploaded file), save it to storage
      let storagePath = '';
      let imageUrl = newImage.url;
      
      if (newImage.url.startsWith('data:')) {
        try {
          // Convert data URL to file
          const res = await fetch(newImage.url);
          const blob = await res.blob();
          const file = new File([blob], `${Date.now()}.jpg`, { type: 'image/jpeg' });
          
          // Upload to storage
          const filePath = `${moodboard.id}/${Date.now()}-${file.name}`;
          const { data: storageData, error: storageError } = await supabase.storage
            .from('moodboard-images')
            .upload(filePath, file);
          
          if (storageError) {
            console.error('Error uploading image:', storageError);
            // Continue with the data URL as the image URL
          } else {
            // Get public URL
            const { data: publicUrlData } = supabase.storage
              .from('moodboard-images')
              .getPublicUrl(filePath);
            
            storagePath = filePath;
            imageUrl = publicUrlData.publicUrl;
          }
        } catch (error) {
          console.error('Error processing image:', error);
          // Continue with the data URL as the image URL
        }
      }
      
      // Get the current highest position
      try {
        const { data: positionData, error: positionError } = await supabase
          .from('moodboard_images')
          .select('position')
          .eq('moodboard_id', moodboard.id)
          .order('position', { ascending: false })
          .limit(1);
        
        const nextPosition = positionData && positionData.length > 0 
          ? (positionData[0].position + 1) 
          : 0;
        
        // Insert the new image
        const { data: insertData, error: insertError } = await supabase
          .from('moodboard_images')
          .insert([{
            moodboard_id: moodboard.id,
            title: newImage.title,
            description: newImage.description || '',
            url: imageUrl,
            storage_path: storagePath || null,
            category: newImage.category || categories[0],
            source: newImage.source || '',
            position: nextPosition
          }])
          .select();
        
        if (insertError) {
          console.error('Error inserting image:', insertError);
          return;
        }
        
        // Update the local state
        if (insertData && insertData.length > 0) {
          setImages(prev => [...prev, insertData[0]]);
        }
      } catch (error) {
        console.error('Error saving image:', error);
        return;
      }
      
      setNewImage({ category: categories[0] });
      setShowForm(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const deleteImage = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      console.error('User not authenticated');
      return;
    }
    
    try {
      // Get the image to delete (to get the storage path)
      const { data: imageData, error: fetchError } = await supabase
        .from('moodboard_images')
        .select('storage_path')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        console.error('Error fetching image:', fetchError);
      } else {
        // If the image is stored in storage, delete it
        if (imageData.storage_path) {
          const { error: storageError } = await supabase.storage
            .from('moodboard-images')
            .remove([imageData.storage_path]);
          
          if (storageError) {
            console.error('Error deleting image from storage:', storageError);
          }
        }
      }
      
      // Delete the image record
      const { error: deleteError } = await supabase
        .from('moodboard_images')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        console.error('Error deleting image:', deleteError);
        return;
      }
      
      // Update the local state
      setImages(prev => prev.filter(image => image.id !== id));
    } catch (error) {
      console.error('Error during image deletion:', error);
    }
  };

  const filteredImages = images.filter(
    image => selectedCategory === 'all' || image.category === selectedCategory
  );

  const checkImageUrl = (url: string) => {
    console.log('Image URL:', url);
    // Create a test image to check if the URL is valid
    const img = new Image();
    img.onload = () => console.log('Image loaded successfully');
    img.onerror = (e) => console.error('Error loading image:', e);
    img.src = url;
    return url;
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = async () => {
      try {
        const importedData = JSON.parse(reader.result as string);
        
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user || !moodboard) {
          console.error('User not authenticated or no moodboard found');
          return;
        }
        
        // Clear existing images
        const { error: deleteError } = await supabase
          .from('moodboard_images')
          .delete()
          .eq('moodboard_id', moodboard.id);
        
        if (deleteError) {
          console.error('Error deleting existing images:', deleteError);
          alert('Error importing mood board.');
          return;
        }
        
        // Import new images
        for (let i = 0; i < importedData.length; i++) {
          const img = importedData[i];
          await supabase
            .from('moodboard_images')
            .insert([{
              moodboard_id: moodboard.id,
              title: img.title,
              description: img.description || '',
              url: img.url,
              category: img.category,
              source: img.source || '',
              position: i
            }]);
        }
        
        // Refresh images
        const { data: refreshedData, error: refreshError } = await supabase
          .from('moodboard_images')
          .select('*')
          .eq('moodboard_id', moodboard.id)
          .order('position', { ascending: true });
        
        if (refreshError) {
          console.error('Error refreshing images:', refreshError);
        } else if (refreshedData) {
          setImages(refreshedData);
        }
        
        alert('Mood board imported successfully!');
      } catch (error) {
        console.error('Error importing mood board:', error);
        alert('Error importing mood board. Please check the file format.');
      }
    };
    
    reader.readAsText(file);
  };

  // Convert AI-generated images to the format expected by MoodboardTemplate
  const convertGeneratedImagesToTemplateFormat = () => {
    return generatedImages.map((img, index) => ({
      id: `ai-${index}`,
      url: img.imageUrl,
      title: img.category.charAt(0).toUpperCase() + img.category.slice(1),
      category: img.category
    }));
  };

  // Handle when AI generates images
  const handleImagesGenerated = (images: {category: string, imageUrl: string}[]) => {
    setGeneratedImages(images);
    if (images.length > 0) {
      setShowAITemplate(true);
    }
  };

  // Export the moodboard data to a JSON file
  const handleExportMoodboard = () => {
    if (!moodboard || images.length === 0) {
      alert('No moodboard data to export');
      return;
    }

    // Create a simplified version of the data for export
    const exportData = {
      title: moodboard.title,
      description: moodboard.description,
      colors: moodboard.colors,
      images: images.map(img => ({
        title: img.title,
        description: img.description,
        url: img.url,
        category: img.category,
        source: img.source,
      }))
    };

    // Create a downloadable JSON file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileName = `${moodboard.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-8">
      <div 
        className="bg-white p-6 space-y-6"
        style={{
          border: '1px solid #E8B4B4',
          boxShadow: '0 4px 20px rgba(5, 70, 151, 0.05)',
          borderRadius: '4px'
        }}
      >
        <div className="flex items-center justify-between">
          <h1 
            className="text-2xl font-semibold"
            style={{ 
              fontFamily: "'Giaza', serif", 
              color: '#054697',
              letterSpacing: '-0.05em'
            }}
          >
            Wedding Moodboard
          </h1>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 
              className="text-xl font-medium"
              style={{ 
                fontFamily: "'Giaza', serif", 
                color: '#054697',
                letterSpacing: '-0.05em'
              }}
            >
              Moodboard Options
            </h2>
            <div>
              {!showAITemplate && activeTab === 'classic' && (
                <button
                  onClick={() => setShowMoodboardTemplate(!showMoodboardTemplate)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium"
                  style={{
                    backgroundColor: showMoodboardTemplate ? 'transparent' : '#E8B4B4',
                    color: '#054697',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 400,
                    textTransform: 'uppercase',
                    border: showMoodboardTemplate ? '1px solid #E8B4B4' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  {showMoodboardTemplate ? 'Back to Grid View' : 'View as Template'}
                </button>
              )}
              {showAITemplate && (
                <button
                  onClick={() => setShowAITemplate(false)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#054697',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 400,
                    textTransform: 'uppercase',
                    border: '1px solid #E8B4B4',
                    cursor: 'pointer'
                  }}
                >
                  Back to Generator
                </button>
              )}
            </div>
          </div>
          <div 
            className="border-b mb-4"
            style={{
              borderColor: '#E8B4B4'
            }}
          >
            <div className="flex">
              <button
                onClick={() => {
                  setActiveTab('classic');
                  setShowAITemplate(false);
                }}
                className={`py-2 px-4 text-sm font-medium relative`}
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  textTransform: 'uppercase',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: activeTab === 'classic' ? '#054697' : 'rgba(5, 70, 151, 0.6)'
                }}
              >
                Classic Mood Board
                {activeTab === 'classic' && (
                  <div 
                    className="absolute bottom-0 left-0 w-full h-0.5"
                    style={{
                      backgroundColor: '#E8B4B4'
                    }}
                  ></div>
                )}
              </button>
              <button
                onClick={() => {
                  setActiveTab('ai');
                  setShowMoodboardTemplate(false);
                }}
                className={`py-2 px-4 text-sm font-medium relative`}
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  textTransform: 'uppercase',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: activeTab === 'ai' ? '#054697' : 'rgba(5, 70, 151, 0.6)'
                }}
              >
                AI Mood Board Generator
                {activeTab === 'ai' && (
                  <div 
                    className="absolute bottom-0 left-0 w-full h-0.5"
                    style={{
                      backgroundColor: '#E8B4B4'
                    }}
                  ></div>
                )}
              </button>
            </div>
          </div>
        </div>

        {showAITemplate ? (
          <MoodboardTemplate 
            images={convertGeneratedImagesToTemplateFormat()} 
            colors={selectedColors}
          />
        ) : (
          <>
            {activeTab === 'classic' && (
              <>
                <div className="flex justify-end mb-4">
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
                      textTransform: 'uppercase',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Image
                  </button>
                  <button
                    onClick={() => document.getElementById('import-board')?.click()}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium ml-2"
                    style={{
                      backgroundColor: '#E8B4B4',
                      color: '#054697',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 400,
                      textTransform: 'uppercase',
                      border: 'none',
                      cursor: 'pointer',
                      marginLeft: '8px'
                    }}
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Import Board
                  </button>
                  <input
                    type="file"
                    id="import-board"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={handleImport}
                  />
                  <button
                    onClick={handleExportMoodboard}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium ml-2"
                    style={{
                      backgroundColor: '#E8B4B4',
                      color: '#054697',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 400,
                      textTransform: 'uppercase',
                      border: 'none',
                      cursor: 'pointer',
                      marginLeft: '8px'
                    }}
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Export Board
                  </button>
                </div>

                {/* Color Palette Picker for Classic Board */}
                <div className="mb-6 p-4 border" style={{ borderColor: '#E8B4B4' }}>
                  <h3 
                    className="text-lg font-medium mb-3"
                    style={{ 
                      fontFamily: "'Giaza', serif", 
                      color: '#054697',
                      letterSpacing: '-0.05em'
                    }}
                  >
                    Color Palette
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
                    Select up to 5 colors for your moodboard
                  </p>
                  
                  <div className="flex flex-wrap gap-3 mb-4">
                    {classicColors.map((color, index) => (
                      <div 
                        key={index} 
                        className="relative"
                      >
                        <div 
                          style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: color,
                            border: '1px solid #E8B4B4',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setCurrentClassicColor(color);
                            const newColors = [...classicColors];
                            newColors.splice(index, 1);
                            setClassicColors(newColors);
                          }}
                        />
                        <button
                          onClick={() => {
                            const newColors = [...classicColors];
                            newColors.splice(index, 1);
                            setClassicColors(newColors);
                          }}
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm"
                          style={{
                            color: '#054697',
                            border: '1px solid #E8B4B4'
                          }}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    
                    {classicColors.length < 5 && (
                      <div 
                        style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: '#EEEEEE',
                          border: '1px dashed #E8B4B4',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          if (classicColors.length < 5 && !classicColors.includes(currentClassicColor)) {
                            setClassicColors([...classicColors, currentClassicColor]);
                          }
                        }}
                      >
                        <Plus className="w-5 h-5" style={{ color: 'rgba(5, 70, 151, 0.5)' }} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <HexColorPicker 
                        color={currentClassicColor} 
                        onChange={setCurrentClassicColor} 
                        style={{ width: '200px', height: '200px' }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="mb-3">
                        <div 
                          style={{
                            width: '100%',
                            height: '40px',
                            backgroundColor: currentClassicColor,
                            marginBottom: '8px',
                            border: '1px solid #E8B4B4'
                          }}
                        />
                        <input
                          type="text"
                          value={currentClassicColor}
                          onChange={(e) => setCurrentClassicColor(e.target.value)}
                          className="w-full p-2 text-sm"
                          style={{
                            border: '1px solid #E8B4B4',
                            color: '#054697',
                            fontFamily: 'Poppins, sans-serif'
                          }}
                        />
                      </div>
                      
                      <button
                        onClick={() => {
                          if (classicColors.length < 5 && !classicColors.includes(currentClassicColor)) {
                            setClassicColors([...classicColors, currentClassicColor]);
                          }
                        }}
                        disabled={classicColors.length >= 5 || classicColors.includes(currentClassicColor)}
                        className="px-4 py-2 text-sm font-medium"
                        style={{
                          backgroundColor: classicColors.length >= 5 || classicColors.includes(currentClassicColor) ? '#EEEEEE' : '#E8B4B4',
                          color: '#054697',
                          fontFamily: 'Poppins, sans-serif',
                          fontWeight: 400,
                          textTransform: 'uppercase',
                          border: 'none',
                          cursor: classicColors.length >= 5 || classicColors.includes(currentClassicColor) ? 'not-allowed' : 'pointer',
                          opacity: classicColors.length >= 5 || classicColors.includes(currentClassicColor) ? 0.5 : 1
                        }}
                      >
                        Add to Palette
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex flex-wrap gap-3 mb-4">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className="px-3 py-1 text-sm font-medium"
                      style={{
                        backgroundColor: selectedCategory === 'all' ? '#E8B4B4' : '#EEEEEE',
                        color: '#054697',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 400,
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      All
                    </button>
                    {categories.map((category, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedCategory(category === selectedCategory ? 'all' : category)}
                        className="px-3 py-1 text-sm font-medium"
                        style={{
                          backgroundColor: category === selectedCategory ? '#E8B4B4' : '#EEEEEE',
                          color: '#054697',
                          fontFamily: 'Poppins, sans-serif',
                          fontWeight: 400,
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {showMoodboardTemplate ? (
                  <MoodboardTemplate 
                    images={filteredImages.map(img => ({ 
                      id: img.id, 
                      url: img.url, 
                      title: img.title,
                      category: img.category
                    }))} 
                    colors={classicColors}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredImages.map(image => (
                      <div 
                        key={image.id} 
                        className="bg-white overflow-hidden flex flex-col relative"
                        style={{
                          border: '1px solid #E8B4B4',
                          boxShadow: '0 2px 10px rgba(5, 70, 151, 0.03)',
                          borderRadius: '4px'
                        }}
                      >
                        <div 
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '4px',
                            height: '100%',
                            backgroundColor: '#054697'
                          }}
                        ></div>
                        <div className="relative aspect-square overflow-hidden">
                          <img 
                            src={checkImageUrl(image.url)} 
                            alt={image.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Image failed to load:', image.url);
                              // Fallback to a placeholder image
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=Image+Not+Found';
                            }}
                          />
                          <button
                            onClick={() => deleteImage(image.id)}
                            className="absolute top-2 right-2 p-1 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor: '#FFFFFF',
                              color: '#054697',
                              width: '24px',
                              height: '24px',
                              border: '1px solid #FFE8E4',
                              boxShadow: '0 2px 4px rgba(5, 70, 151, 0.1)'
                            }}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-4 flex-grow">
                          <div className="flex justify-between items-start mb-2">
                            <h3 
                              className="text-lg font-medium"
                              style={{ 
                                fontFamily: "'Giaza', serif", 
                                color: '#054697',
                                letterSpacing: '-0.05em'
                              }}
                            >
                              {image.title}
                            </h3>
                            <span 
                              className="text-xs px-2 py-1"
                              style={{
                                backgroundColor: '#E8B4B4',
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
                              className="text-sm mb-3"
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
                )}
              </>
            )}

            {activeTab === 'ai' && !showAITemplate && (
              <div 
                className="bg-white p-6 space-y-6"
                style={{ 
                  border: '1px solid #E8B4B4',
                  borderRadius: '4px'
                }}
              >
                <h2 
                  className="text-xl font-medium"
                  style={{ 
                    fontFamily: "'Giaza', serif", 
                    color: '#054697',
                    letterSpacing: '-0.05em'
                  }}
                >
                  AI Mood Board Generator
                </h2>
                <p 
                  className="text-sm"
                  style={{ 
                    color: '#054697', 
                    opacity: 0.8,
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 300
                  }}
                >
                  Describe your dream wedding and our AI will generate a mood board for you.
                </p>
                <MoodboardGenerator 
                  falApiKey={falApiKey} 
                  onColorsSelected={(colors) => setSelectedColors(colors)}
                  onImagesGenerated={handleImagesGenerated}
                />
              </div>
            )}
          </>
        )}
        {filteredImages.length === 0 && (
          <div 
            className="bg-gray-50 p-8 text-center border border-dashed"
            style={{
              borderColor: '#E8B4B4',
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
            {activeTab === 'classic' && (
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
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add First Image
              </button>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <Dialog 
          open={showForm} 
          onClose={() => setShowForm(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 0, // Square corners per brand guidelines
              p: 3
            }
          }}
        >
          <DialogTitle sx={{ 
            p: 0, 
            mb: 2,
            color: theme.palette.primary.main,
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 'medium',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="h5" component="h2">
              Add to Moodboard
            </Typography>
            <IconButton 
              onClick={() => setShowForm(false)}
              sx={{ 
                color: theme.palette.primary.main,
                p: 1
              }}
            >
              <X size={20} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="subtitle2" 
                  component="label"
                  htmlFor="image-upload"
                  sx={{ 
                    display: 'block', 
                    mb: 1,
                    color: theme.palette.primary.main
                  }}
                >
                  Image
                </Typography>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  style={{ width: '100%' }}
                  required
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Title"
                  value={newImage.title || ''}
                  onChange={e => setNewImage(prev => ({ ...prev, title: e.target.value }))}
                  required
                  variant="outlined"
                  InputLabelProps={{
                    sx: { color: theme.palette.primary.main }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: theme.palette.divider,
                        borderRadius: 0 // Square corners per brand guidelines
                      },
                      '&:hover fieldset': {
                        borderColor: theme.palette.accent?.rose || '#FFE8E4'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.accent?.rose || '#FFE8E4'
                      }
                    },
                    '& .MuiInputBase-input': {
                      color: theme.palette.primary.main
                    }
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Description"
                  value={newImage.description || ''}
                  onChange={e => setNewImage(prev => ({ ...prev, description: e.target.value }))}
                  multiline
                  rows={3}
                  variant="outlined"
                  InputLabelProps={{
                    sx: { color: theme.palette.primary.main }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: theme.palette.divider,
                        borderRadius: 0 // Square corners per brand guidelines
                      },
                      '&:hover fieldset': {
                        borderColor: theme.palette.accent?.rose || '#FFE8E4'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.accent?.rose || '#FFE8E4'
                      }
                    },
                    '& .MuiInputBase-input': {
                      color: theme.palette.primary.main
                    }
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel 
                    id="category-label"
                    sx={{ color: theme.palette.primary.main }}
                  >
                    Category
                  </InputLabel>
                  <Select
                    labelId="category-label"
                    value={newImage.category}
                    onChange={e => setNewImage(prev => ({ ...prev, category: e.target.value }))}
                    label="Category"
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.divider,
                        borderRadius: 0 // Square corners per brand guidelines
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.accent?.rose || '#FFE8E4'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.accent?.rose || '#FFE8E4'
                      },
                      color: theme.palette.primary.main
                    }}
                  >
                    {categories.map(category => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Source URL (Optional)"
                  value={newImage.source || ''}
                  onChange={e => setNewImage(prev => ({ ...prev, source: e.target.value }))}
                  type="url"
                  variant="outlined"
                  InputLabelProps={{
                    sx: { color: theme.palette.primary.main }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: theme.palette.divider,
                        borderRadius: 0 // Square corners per brand guidelines
                      },
                      '&:hover fieldset': {
                        borderColor: theme.palette.accent?.rose || '#FFE8E4'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.accent?.rose || '#FFE8E4'
                      }
                    },
                    '& .MuiInputBase-input': {
                      color: theme.palette.primary.main
                    }
                  }}
                />
              </Box>
            </form>
          </DialogContent>
          <DialogActions sx={{ p: 0, mt: 2 }}>
            <Button
              onClick={() => setShowForm(false)}
              variant="outlined"
              sx={{ 
                color: theme.palette.primary.main,
                borderColor: theme.palette.divider,
                borderRadius: 0, // Square corners per brand guidelines
                '&:hover': {
                  borderColor: theme.palette.divider,
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                },
                textTransform: 'uppercase'
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{ 
                backgroundColor: theme.palette.accent?.rose || '#FFE8E4',
                color: theme.palette.primary.main,
                borderRadius: 0, // Square corners per brand guidelines
                '&:hover': {
                  backgroundColor: theme.palette.accent?.roseDark || '#FFD5CC'
                },
                marginLeft: '2px',
                textTransform: 'uppercase'
              }}
            >
              Add Image
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}
