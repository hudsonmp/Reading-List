interface AnalysisResult {
  summary: string;
  keywords: string[];
  readingTime: number;
  complexity: number;
  takeaways: string[];
}

export const analyzeContent = async (url: string): Promise<AnalysisResult> => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Analysis API error:', errorData);
      throw new Error(errorData.message || 'Failed to analyze content');
    }

    const data = await response.json();
    
    if (!data.summary || !Array.isArray(data.keywords) || 
        typeof data.readingTime !== 'number' || 
        typeof data.complexity !== 'number' || 
        !Array.isArray(data.takeaways)) {
      throw new Error('Missing required fields in analysis result');
    }

    return {
      summary: data.summary,
      keywords: data.keywords,
      readingTime: data.readingTime,
      complexity: data.complexity,
      takeaways: data.takeaways,
    };
  } catch (error) {
    console.error('Error analyzing content:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to analyze content');
  }
}; 