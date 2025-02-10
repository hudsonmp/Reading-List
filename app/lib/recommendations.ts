import Anthropic from '@anthropic-ai/sdk';
import { google } from 'googleapis';

const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

const customSearch = google.customsearch('v1');

export type ContentCategory = 'book' | 'website' | 'article' | 'report' | 'video';

export interface RecommendationResult {
  title: string;
  link: string;
  snippet: string;
  category: ContentCategory;
  source: string;
  relevanceScore: number;
  thumbnailUrl?: string;
}

interface KeywordAnalysis {
  mainTopics: string[];
  specificConcepts: string[];
  relatedTerms: string[];
}

async function extractKeywords(summary: string): Promise<KeywordAnalysis> {
  const response = await claude.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 1000,
    temperature: 0,
    messages: [{
      role: 'user',
      content: `Analyze this text and extract keywords in these categories:
      - Main topics (3-5 key subjects)
      - Specific concepts (4-6 technical or specific terms)
      - Related terms (4-6 broader or related concepts)
      
      Text: ${summary}
      
      Format your response as JSON with these categories as arrays of strings.
      Keep each term or phrase concise (1-3 words max).`
    }]
  });

  const content = response.content[0];
  if (!content || typeof content !== 'object' || !('type' in content) || content.type !== 'text' || typeof content.text !== 'string') {
    throw new Error('Unexpected response format from Claude');
  }

  return JSON.parse(content.text) as KeywordAnalysis;
}

function constructSearchQuery(
  keywords: KeywordAnalysis,
  category: ContentCategory
): string {
  // Start with the main topics
  let query = keywords.mainTopics.map(topic => `"${topic}"`).join(' OR ');

  // Add some specific concepts with AND
  if (keywords.specificConcepts.length > 0) {
    query += ` AND ("${keywords.specificConcepts.slice(0, 2).join('" OR "')}")`;
  }

  // Add category-specific filters
  switch (category) {
    case 'video':
      query += ' site:youtube.com';
      break;
    case 'book':
      query += ' (book OR novel OR publication) -site:youtube.com';
      break;
    case 'article':
      query += ' (article OR research OR paper OR analysis) -site:youtube.com';
      break;
  }

  return query;
}

function calculateRelevance(
  item: { title: string; snippet: string },
  keywords: KeywordAnalysis
): number {
  let score = 0;
  const text = `${item.title} ${item.snippet}`.toLowerCase();
  
  // Check for main topics (highest weight)
  keywords.mainTopics.forEach(topic => {
    if (text.includes(topic.toLowerCase())) score += 3;
  });
  
  // Check for specific concepts (medium weight)
  keywords.specificConcepts.forEach(concept => {
    if (text.includes(concept.toLowerCase())) score += 2;
  });
  
  // Check for related terms (lowest weight)
  keywords.relatedTerms.forEach(term => {
    if (text.includes(term.toLowerCase())) score += 1;
  });
  
  return Math.min(10, score);
}

export async function findSimilarContent(
  summary: string,
  category: ContentCategory
): Promise<RecommendationResult[]> {
  try {
    // Extract keywords from the summary
    const keywords = await extractKeywords(summary);
    
    // Construct the search query
    const query = constructSearchQuery(keywords, category);
    
    // Perform the search
    const results = await customSearch.cse.list({
      auth: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
      cx: process.env.NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID,
      q: query,
      num: 10,
      ...(category === 'video' && { videoSyndicated: 'true' })
    });

    if (!results.data.items) return [];

    // Process and score the results
    const recommendations = results.data.items.map(item => {
      const result: RecommendationResult = {
        title: item.title || '',
        link: item.link || '',
        snippet: item.snippet || '',
        category,
        source: new URL(item.link || '').hostname.replace('www.', ''),
        relevanceScore: calculateRelevance(
          { title: item.title || '', snippet: item.snippet || '' },
          keywords
        ),
        ...(item.pagemap?.cse_thumbnail?.[0]?.src && {
          thumbnailUrl: item.pagemap.cse_thumbnail[0].src
        })
      };
      return result;
    });

    // Sort by relevance score
    return recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
  } catch (error) {
    console.error('Error finding similar content:', error);
    throw error;
  }
}

export async function findAllSimilarContent(
  summary: string
): Promise<Record<ContentCategory, RecommendationResult[]>> {
  const categories: ContentCategory[] = ['book', 'article', 'video'];
  
  const results = await Promise.all(
    categories.map(async category => ({
      category,
      results: await findSimilarContent(summary, category)
    }))
  );
  
  return results.reduce((acc, { category, results }) => {
    acc[category] = results;
    return acc;
  }, {} as Record<ContentCategory, RecommendationResult[]>);
} 