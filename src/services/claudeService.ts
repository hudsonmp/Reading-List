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
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const parsedContent = JSON.parse(data.content[0].text);

    return {
      summary: parsedContent.summary,
      keywords: parsedContent.keywords,
      readingTime: parsedContent.readingTime,
      complexity: parsedContent.complexity,
      takeaways: parsedContent.takeaways,
    };
  } catch (error) {
    console.error('Error analyzing content:', error);
    throw error;
  }
}; 