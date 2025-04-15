// @ts-nocheck
import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface FloorPlanUploadProps {
  venueId: string;
  roomId: string;
  currentFloorPlan: string | null;
  onUploadComplete: (url: string) => void;
}

export const FloorPlanUpload: React.FC<FloorPlanUploadProps> = ({
  venueId,
  roomId,
  currentFloorPlan,
  onUploadComplete,
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentFloorPlan);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null);
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setUploading(true);

      // Create a preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${venueId}/${roomId}/floor-plan.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('floor-plans')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('floor-plans')
        .getPublicUrl(fileName);

      // Update the venue_rooms table with the new URL
      const { error: updateError } = await supabase
        .from('venue_rooms')
        .update({ floor_plan_url: publicUrl })
        .eq('id', roomId);

      if (updateError) throw updateError;

      onUploadComplete(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error uploading floor plan');
      setPreview(currentFloorPlan);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFloorPlan = async () => {
    try {
      setError(null);
      setUploading(true);

      // Delete from Storage
      const fileName = `${venueId}/${roomId}/floor-plan`;
      const { error: deleteError } = await supabase.storage
        .from('floor-plans')
        .remove([fileName]);

      if (deleteError) throw deleteError;

      // Update venue_rooms table
      const { error: updateError } = await supabase
        .from('venue_rooms')
        .update({ floor_plan_url: null })
        .eq('id', roomId);

      if (updateError) throw updateError;

      setPreview(null);
      onUploadComplete('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error removing floor plan');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Floor Plan Preview"
              className="w-full h-48 object-contain"
            />
            <button
              onClick={handleRemoveFloorPlan}
              className="absolute top-2 right-2 p-1 bg-red-100 rounded-full hover:bg-red-200"
              disabled={uploading}
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">
              {uploading ? 'Uploading...' : 'Click to upload floor plan'}
            </span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="text-xs text-gray-500">
        Supported formats: PNG, JPG, GIF • Max file size: 5MB
      </div>
    </div>
  );
};

export default FloorPlanUpload;
