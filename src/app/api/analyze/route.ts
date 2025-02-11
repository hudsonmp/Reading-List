import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    if (!process.env.CLAUDE_API_KEY) {
      return NextResponse.json(
        { message: 'Analysis service configuration is missing' },
        { status: 500 }
      );
    }

    const { url } = await request.json();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
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
      return NextResponse.json(
        { message: errorData.error?.message || 'Failed to analyze content' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (!data.content || !Array.isArray(data.content) || !data.content[0]?.text) {
      return NextResponse.json(
        { message: 'Invalid response format from analysis service' },
        { status: 500 }
      );
    }

    try {
      const parsedContent = JSON.parse(data.content[0].text);
      return NextResponse.json(parsedContent);
    } catch (parseError) {
      console.error('Error parsing analysis response:', parseError);
      return NextResponse.json(
        { message: 'Failed to parse analysis results' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 