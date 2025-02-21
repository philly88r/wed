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

export const analyzeFloorPlan = async (imageData: string): Promise<TableAnalysis> => {
  try {
    const response = await fetch('/api/analyze-floor-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageData }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to analyze floor plan: ${errorMessage}`);
  }
};
