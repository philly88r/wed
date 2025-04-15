import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface TableTemplate {
  id: string;
  name: string;
  shape: 'round' | 'rectangular' | 'square' | 'oval';
  width: number;
  length: number;
  seats: number;
  description: string;
}

interface TableTemplateSelectorProps {
  onSelect: (template: TableTemplate) => void;
}

export const TableTemplateSelector: React.FC<TableTemplateSelectorProps> = ({ onSelect }) => {
  const [templates, setTemplates] = useState<TableTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('table_templates')
        .select('*')
        .order('seats');

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch table templates');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      onSelect(template);
    }
  };

  if (loading) return <div className="animate-pulse">Loading templates...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {templates.map((template) => (
        <div
          key={template.id}
          className={`
            border rounded-lg p-4 cursor-pointer transition-colors
            ${selectedTemplate === template.id
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-gray-200 hover:border-emerald-200 hover:bg-gray-50'
            }
          `}
          onClick={() => handleTemplateSelect(template.id)}
        >
          <div className="flex items-center space-x-4">
            {/* Table Shape Icon */}
            <div className="w-16 h-16 flex-shrink-0">
              {template.shape === 'round' && (
                <div className="w-full h-full rounded-full border-2 border-gray-400" />
              )}
              {template.shape === 'rectangular' && (
                <div className="w-full h-8 mt-4 border-2 border-gray-400" />
              )}
              {template.shape === 'square' && (
                <div className="w-full h-full border-2 border-gray-400" />
              )}
              {template.shape === 'oval' && (
                <div className="w-full h-12 mt-2 rounded-full border-2 border-gray-400" />
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{template.name}</h3>
              <p className="text-sm text-gray-500">{template.description}</p>
              <div className="mt-1 text-xs text-gray-400">
                {template.width}' × {template.length}' • {template.seats} seats
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableTemplateSelector;
