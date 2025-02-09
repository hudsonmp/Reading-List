import Anthropic from '@anthropic-ai/sdk';
import type { ReadingItem } from './firebase-service';

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
  dangerouslyAllowBrowser: true
});

interface AIAnalysisResult {
  description: string;
  summary: string;
  suggestedReadings: ReadingItem['suggestedReadings'];
  relatedVideos: ReadingItem['relatedVideos'];
  aiAnalysis: ReadingItem['aiAnalysis'];
}

export async function analyzeContent(title: string, url?: string): Promise<AIAnalysisResult> {
  try {
    let content = `Title: ${title}`;
    if (url) {
      content += `\nURL: ${url}`;
    }

    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      temperature: 0.5,
      system: `You are a specialized JSON generator that analyzes content. Always respond with valid, parseable JSON only. No other text or explanations.`,
      messages: [
        {
          role: "user",
          content: `Analyze this content and respond with a JSON object containing:
{
  "description": "2-3 sentence description",
  "summary": "1 sentence summary",
  "suggestedReadings": [
    {
      "title": "string",
      "url": "string (optional)",
      "reason": "1 sentence reason"
    }
  ],
  "relatedVideos": [
    {
      "title": "string",
      "url": "string",
      "platform": "youtube",
      "thumbnail": "string (optional)"
    }
  ],
  "aiAnalysis": {
    "keyPoints": ["3-5 key points"],
    "difficulty": "beginner|intermediate|advanced",
    "timeToConsume": "estimated time (e.g., '10 minutes')",
    "tags": ["3-5 relevant tags"],
    "lastAnalyzed": "current_timestamp"
  }
}

Content to analyze: ${content}`
        }
      ]
    });

    // Access the content safely and ensure it's valid JSON
    let messageContent = '';
    if (message.content[0].type === 'text') {
      // Remove any potential markdown code block markers
      messageContent = message.content[0].text.replace(/```json\n?|\n?```/g, '').trim();
    }

    try {
      const result = JSON.parse(messageContent);
      return {
        ...result,
        aiAnalysis: {
          ...result.aiAnalysis,
          lastAnalyzed: new Date().toISOString(),
        },
      };
    } catch (parseError) {
      console.error('Failed to parse AI response:', messageContent);
      // Return a minimal valid response
      return {
        description: title,
        summary: title,
        suggestedReadings: [],
        relatedVideos: [],
        aiAnalysis: {
          keyPoints: [],
          difficulty: 'beginner',
          timeToConsume: '5 minutes',
          tags: [],
          lastAnalyzed: new Date().toISOString(),
        },
      };
    }
  } catch (error) {
    console.error('Error analyzing content:', error);
    throw error;
  }
}

export async function getYouTubeInfo(url: string) {
  // You could integrate with YouTube Data API here
  // This would require a separate API key and setup
  return {
    title: '',
    thumbnail: '',
    platform: 'youtube',
  };
}

export async function generateSuggestions(items: ReadingItem[]) {
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 500,
      temperature: 0.5,
      system: `You are a specialized JSON generator that suggests related content. Always respond with valid, parseable JSON only. No other text or explanations.`,
      messages: [
        {
          role: "user",
          content: `Based on these items, generate an array of 3 suggested readings. Respond with JSON array only:
[
  {
    "title": "string",
    "url": "string (optional)",
    "reason": "1 sentence reason"
  }
]

Items: ${JSON.stringify(items)}`
        }
      ]
    });

    // Access the content safely and ensure it's valid JSON
    let messageContent = '';
    if (message.content[0].type === 'text') {
      // Remove any potential markdown code block markers
      messageContent = message.content[0].text.replace(/```json\n?|\n?```/g, '').trim();
    }

    try {
      return JSON.parse(messageContent);
    } catch (parseError) {
      console.error('Failed to parse AI suggestions:', messageContent);
      return [];
    }
  } catch (error) {
    console.error('Error generating suggestions:', error);
    throw error;
  }
} 