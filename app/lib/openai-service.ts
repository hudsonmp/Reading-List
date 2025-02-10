import Anthropic from '@anthropic-ai/sdk';
import type { ReadingItem } from './firebase-service';

let anthropicClient: Anthropic | null = null;

async function getAnthropicClient(): Promise<Anthropic | null> {
  if (anthropicClient) return anthropicClient;

  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicApiKey) {
    console.error('Anthropic API key not found in environment variables');
    return null;
  }

  anthropicClient = new Anthropic({
    apiKey: anthropicApiKey,
    dangerouslyAllowBrowser: true
  });

  return anthropicClient;
}

interface AIAnalysisResult {
  description: string;
  summary: string;
  suggestedReadings: ReadingItem['suggestedReadings'];
  relatedVideos: ReadingItem['relatedVideos'];
  aiAnalysis: ReadingItem['aiAnalysis'];
}

// Helper function to validate URLs
async function validateUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Helper function to search for related content using Google Custom Search API
async function searchRelatedContent(
  query: string, 
  type: 'article' | 'video' = 'article'
): Promise<any[]> {
  try {
    const googleApiKey = process.env.GOOGLE_API_KEY;
    const googleSearchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (!googleApiKey || !googleSearchEngineId) {
      console.warn('Google API credentials not found in environment variables');
      return [];
    }

    const searchType = type === 'video' ? '&videoSyndicated=true&type=video' : '';
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${googleSearchEngineId}${searchType}&q=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error searching related content:', error);
    return [];
  }
}

export async function analyzeContent(title: string, url?: string): Promise<AIAnalysisResult> {
  try {
    const anthropic = await getAnthropicClient();
    if (!anthropic) {
      throw new Error('Failed to initialize Anthropic client');
    }

    let content = `Title: ${title}`;
    if (url) {
      content += `\nURL: ${url}`;
      
      // Validate the URL
      const isValidUrl = await validateUrl(url);
      if (!isValidUrl) {
        console.warn('Invalid or inaccessible URL provided');
      }
    }

    // First, get AI analysis
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1500,
      temperature: 0.7,
      system: `You are a specialized content analyzer that provides comprehensive analysis. Focus on extracting key insights, providing detailed summaries, and identifying core concepts. Always format responses as valid JSON.`,
      messages: [
        {
          role: "user",
          content: `Analyze this content and provide a detailed response with:
- A thorough multi-paragraph description
- A comprehensive summary covering main points
- 3-5 key insights
- Difficulty assessment with reasoning
- Estimated time to consume with explanation
- Relevant topic tags
- Target audience

Format as JSON:
{
  "description": "string (2-3 paragraphs)",
  "summary": "string (comprehensive, 3-4 sentences)",
  "aiAnalysis": {
    "keyPoints": ["string"],
    "difficulty": "beginner|intermediate|advanced",
    "difficultyReasoning": "string",
    "timeToConsume": "string",
    "timeExplanation": "string",
    "tags": ["string"],
    "targetAudience": "string",
    "lastAnalyzed": "string"
  }
}

Content to analyze: ${content}`
        }
      ]
    });

    let messageContent = '';
    if (message.content[0].type === 'text') {
      messageContent = message.content[0].text.replace(/```json\n?|\n?```/g, '').trim();
    }

    const aiResult = JSON.parse(messageContent);

    // Get related content
    const searchResults = await searchRelatedContent(title, 'article');
    const videoResults = await searchRelatedContent(title, 'video');

    // Format suggested readings from search results
    const suggestedReadings = searchResults.slice(0, 3).map(item => ({
      title: item.title,
      url: item.link,
      reason: `This ${item.pagemap?.metatags?.[0]?.['og:type'] || 'content'} appears relevant because it covers similar topics and comes from ${item.displayLink}`,
    }));

    // Format related videos from video search
    const relatedVideos = videoResults.slice(0, 2).map(item => ({
      title: item.title,
      url: item.link,
      platform: 'youtube',
      thumbnail: item.pagemap?.videoobject?.[0]?.thumbnailurl || item.pagemap?.cse_thumbnail?.[0]?.src,
    }));

    return {
      description: aiResult.description,
      summary: aiResult.summary,
      suggestedReadings,
      relatedVideos,
      aiAnalysis: {
        ...aiResult.aiAnalysis,
        lastAnalyzed: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error analyzing content:', error);
    return {
      description: `Analysis of: ${title}`,
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
    // Extract key information from existing items
    const topics = items.flatMap(item => item.aiAnalysis?.tags || []);
    const topicSummary = Array.from(new Set(topics)).join(', ');

    const anthropicClient = await getAnthropicClient();
    if (!anthropicClient) {
      throw new Error('Failed to initialize Anthropic client');
    }

    const message = await anthropicClient.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      temperature: 0.7,
      system: `You are a specialized recommendation engine that suggests high-quality content based on user interests. Focus on current, authoritative sources.`,
      messages: [
        {
          role: "user",
          content: `Based on these topics: ${topicSummary}
Generate 3 highly relevant content suggestions. For each suggestion:
- Ensure it's from a reputable source
- Provide clear reasoning for the recommendation
- Match the user's apparent expertise level

Format as JSON array:
[
  {
    "title": "string (specific title)",
    "type": "article|book|video|website",
    "reason": "string (1-2 sentences explaining relevance)"
  }
]`
        }
      ]
    });

    let messageContent = '';
    if (message.content[0].type === 'text') {
      messageContent = message.content[0].text.replace(/```json\n?|\n?```/g, '').trim();
    }

    const suggestions = JSON.parse(messageContent);

    // Enhance suggestions with real URLs
    const enhancedSuggestions = await Promise.all(
      suggestions.map(async (suggestion: any) => {
        const searchResults = await searchRelatedContent(suggestion.title);
        const bestMatch = searchResults[0];
        return {
          ...suggestion,
          url: bestMatch?.link || undefined,
        };
      })
    );

    return enhancedSuggestions;
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return [];
  }
} 