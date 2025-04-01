import { fal } from "@fal-ai/client";

// Define the ImageSize type to match fal.ai's expected types
type ImageSize = 
  | "square_hd" 
  | "square" 
  | "portrait_4_3" 
  | "portrait_16_9" 
  | "landscape_4_3" 
  | "landscape_16_9"
  | { width: number; height: number };

// Configure the fal client with the API key
// In production, this should be set as an environment variable
// For development, we can set it directly here
export const configureFalClient = (apiKey?: string) => {
  if (apiKey) {
    fal.config({
      credentials: apiKey
    });
  } else if (import.meta.env.VITE_FAL_KEY) {
    fal.config({
      credentials: import.meta.env.VITE_FAL_KEY
    });
  } else {
    console.warn('FAL_KEY not found. Please set it in your .env file or pass it to configureFalClient()');
  }
};

// Generate images using fal.ai Flux Pro model
export const generateMoodboardImage = async (
  prompt: string, 
  imageSize: ImageSize = 'landscape_4_3',
  numImages: number = 1
) => {
  try {
    const result = await fal.subscribe("fal-ai/flux-pro/v1.1", {
      input: {
        prompt,
        image_size: imageSize,
        num_images: numImages,
        enable_safety_checker: true,
        safety_tolerance: "2",
        output_format: "jpeg"
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("Generation in progress...");
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });
    
    return result.data;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

// Helper function to generate wedding-themed prompts based on user inputs
export const generateWeddingPrompt = (
  colors: string[],
  style: string,
  vibe: string,
  season: string,
  venue: string,
  category: string
) => {
  // Combine colors into a comma-separated list
  const colorList = colors.join(", ");
  
  // Base prompts for different wedding categories
  const categoryPrompts: Record<string, string> = {
    "decor": `Wedding decoration in ${style} style with ${colorList} colors. ${vibe} atmosphere, ${season} season, ${venue} setting.`,
    "flowers": `Wedding floral arrangement in ${style} style with ${colorList} colors. ${vibe} atmosphere, ${season} season, ${venue} setting.`,
    "attire": `Wedding attire in ${style} style with ${colorList} color accents. ${vibe} atmosphere, ${season} season, ${venue} setting.`,
    "venue": `Wedding ${venue} decorated in ${style} style with ${colorList} colors. ${vibe} atmosphere, ${season} season.`,
    "cake": `Wedding cake in ${style} style with ${colorList} colors. ${vibe} atmosphere, ${season} season, ${venue} setting.`,
    "tablescape": `Wedding table setting in ${style} style with ${colorList} colors. ${vibe} atmosphere, ${season} season, ${venue} setting.`,
    "invitation": `Wedding invitation in ${style} style with ${colorList} colors. ${vibe} atmosphere, ${season} season, ${venue} setting.`,
  };
  
  // Get the prompt for the specified category or use a default
  const prompt = categoryPrompts[category] || 
    `Wedding inspiration in ${style} style with ${colorList} colors. ${vibe} atmosphere, ${season} season, ${venue} setting.`;
  
  // Enhance the prompt for better AI image generation
  return `${prompt} Professional photography, high detail, elegant, cinematic lighting, wedding inspiration, mood board, 4K, high quality`;
};
