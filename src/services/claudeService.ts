interface AnalysisResult {
  summary: string;
  keywords: string[];
  readingTime: number;
  complexity: number;
  takeaways: string[];
}

export const analyzeContent = async (url: string): Promise<AnalysisResult> => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_CLAUDE_API_KEY!,
        'anthropic-version': '2024-01-01'
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        system: "You are an AI assistant that analyzes content and provides structured analysis in JSON format.",
        messages: [{
          role: "user",
          content: `Analyze the content at ${url} and provide:
          1. A brief summary (2-3 sentences)
          2. 5-7 key themes or keywords
          3. Estimated reading time in minutes
          4. Complexity score (1-10)
          5. 3-5 main takeaways

          Format the response as a JSON object with the following structure:
          {
            "summary": "string",
            "keywords": ["string"],
            "readingTime": number,
            "complexity": number,
            "takeaways": ["string"]
          }`
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Claude API error:', errorData);
      throw new Error(`API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    // Check if the response has the expected structure
    if (!data.content || !Array.isArray(data.content) || !data.content[0]?.text) {
      throw new Error('Invalid response format from Claude API');
    }

    try {
      const parsedContent = JSON.parse(data.content[0].text);
      
      // Validate the parsed content has all required fields
      if (!parsedContent.summary || !Array.isArray(parsedContent.keywords) || 
          typeof parsedContent.readingTime !== 'number' || 
          typeof parsedContent.complexity !== 'number' || 
          !Array.isArray(parsedContent.takeaways)) {
        throw new Error('Missing required fields in analysis result');
      }

      return {
        summary: parsedContent.summary,
        keywords: parsedContent.keywords,
        readingTime: parsedContent.readingTime,
        complexity: parsedContent.complexity,
        takeaways: parsedContent.takeaways,
      };
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
      throw new Error('Failed to parse analysis results');
    }
  } catch (error) {
    console.error('Error analyzing content:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to analyze content');
  }
}; 