import { supabase } from '../lib/supabase';

interface TableAnalysis {
  scale: {
    found: boolean;
    text: string;
    value: number; // how many feet the scale represents
    pixelsPerFoot: number;
  };
  dimensions: {
    length: number;
    width: number;
    confirmed: boolean;
    foundText: string[];
  };
}

export async function analyzeFloorPlan(imageBase64: string): Promise<TableAnalysis> {
  const TIMEOUT_MS = 30000; // 30 seconds timeout
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Wedding Seating Planner"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        max_tokens: 1000,
        messages: [
          {
            role: "system",
            content: `You are analyzing floor plans. Your response must be VALID JSON in this exact format:

{
  "scale": {
    "found": false,
    "text": "",
    "value": 0,
    "pixelsPerFoot": 0
  },
  "dimensions": {
    "length": 0,
    "width": 0,
    "confirmed": false,
    "foundText": []
  }
}

Look for:
1. A scale bar at the bottom of the image (like "Scale: 1/4" = 1'-0"" or a line marked "10 feet")
2. Dimension numbers written along walls

If you find a scale:
- Set "found" to true
- Put the exact text in "text"
- Put the number of feet in "value"
- Calculate pixels per foot and put in "pixelsPerFoot"

If you find dimensions:
- Set "confirmed" to true
- Put the numbers in "length" and "width"
- Add the text you found to "foundText"

DO NOT add any text before or after the JSON.
Your entire response must be valid JSON.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this floor plan. Look for a scale bar at the bottom and dimension numbers along the walls. Return ONLY valid JSON."
              },
              {
                type: "image_url",
                image_url: `data:image/jpeg;base64,${imageBase64}`
              }
            ]
          }
        ]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText
      });
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenRouter API response:', data);
    
    const content = data.choices[0].message.content;
    console.log('AI response content:', content);
    
    try {
      const analysis = JSON.parse(content.trim());
      
      // Validate the analysis object has required properties
      if (!analysis.scale || !analysis.dimensions) {
        throw new Error('Missing required properties in analysis');
      }

      return {
        scale: {
          found: Boolean(analysis.scale.found),
          text: String(analysis.scale.text || ''),
          value: Number(analysis.scale.value || 0),
          pixelsPerFoot: Number(analysis.scale.pixelsPerFoot || 0)
        },
        dimensions: {
          length: Number(analysis.dimensions.length || 0),
          width: Number(analysis.dimensions.width || 0),
          confirmed: Boolean(analysis.dimensions.confirmed),
          foundText: Array.isArray(analysis.dimensions.foundText) ? analysis.dimensions.foundText.map(String) : []
        }
      };
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error(`Invalid JSON response from AI: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Error analyzing floor plan:', error);
    throw error;
  }
}
