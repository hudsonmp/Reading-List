import Anthropic from '@anthropic-ai/sdk';
import { google } from 'googleapis';

const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

const customSearch = google.customsearch('v1');

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  type: 'book' | 'article' | 'video';
  source: string;
  relevanceScore: number;
}

export interface ExtractedTerms {
  mainTopics: string[];
  specificConcepts: string[];
  authors: string[];
  keyPhrases: string[];
}

export async function processSummary(summary: string): Promise<ExtractedTerms> {
  // Use Claude to analyze the summary and extract key terms
  const response = await claude.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 1000,
    temperature: 0,
    messages: [{
      role: 'user',
      content: `Analyze this text and extract key terms in the following categories:
      - Main topics
      - Specific concepts
      - Authors/experts mentioned
      - Key phrases
      
      Text: ${summary}
      
      Format your response as JSON with these categories as keys and arrays of strings as values.`
    }]
  });

  const content = response.content[0];
  if (!content || typeof content !== 'object' || !('type' in content) || content.type !== 'text' || typeof content.text !== 'string') {
    throw new Error('Unexpected response format from Claude');
  }

  return JSON.parse(content.text) as ExtractedTerms;
}

export async function generateSearchQueries(terms: ExtractedTerms): Promise<string[]> {
  const queries: string[] = [];
  
  // Generate broad topic searches
  terms.mainTopics.forEach(topic => {
    queries.push(`"${topic}" (book OR article OR video)`);
  });
  
  // Generate specific concept searches
  terms.specificConcepts.forEach(concept => {
    queries.push(`"${concept}" methodology research`);
  });
  
  // Generate author searches
  terms.authors.forEach(author => {
    queries.push(`"${author}" (publications OR videos OR talks)`);
  });
  
  // Generate combined key phrase searches
  terms.keyPhrases.forEach(phrase => {
    const encoded = encodeURIComponent(`"${phrase}"`);
    queries.push(`${encoded} (site:youtube.com OR site:scholar.google.com)`);
  });
  
  return queries;
}

export async function performSearch(query: string): Promise<SearchResult[]> {
  try {
    const results = await customSearch.cse.list({
      auth: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
      cx: process.env.NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID,
      q: query,
      num: 10
    });

    if (!results.data.items) return [];

    return results.data.items.map(item => ({
      title: item.title || '',
      link: item.link || '',
      snippet: item.snippet || '',
      type: determineContentType(item.link || ''),
      source: extractSource(item.link || ''),
      relevanceScore: calculateRelevance(item.title || '', item.snippet || '', query)
    }));
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

function determineContentType(link: string): 'book' | 'article' | 'video' {
  const url = link.toLowerCase();
  if (url.includes('youtube.com') || url.includes('vimeo.com')) {
    return 'video';
  }
  if (url.includes('books.google.com') || url.includes('amazon.com')) {
    return 'book';
  }
  return 'article';
}

function extractSource(link: string): string {
  try {
    const url = new URL(link);
    return url.hostname.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

function calculateRelevance(title: string, snippet: string, query: string): number {
  let score = 0;
  const searchTerms = query.toLowerCase().split(' ');
  
  // Check title matches
  searchTerms.forEach(term => {
    if (title.toLowerCase().includes(term)) score += 2;
  });
  
  // Check description matches
  searchTerms.forEach(term => {
    if (snippet.toLowerCase().includes(term)) score += 1;
  });
  
  return score;
}

export async function filterAndRankResults(
  results: SearchResult[],
  originalSummary: string
): Promise<SearchResult[]> {
  // Use Claude to help rank results based on relevance to original summary
  const response = await claude.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 1000,
    temperature: 0,
    messages: [{
      role: 'user',
      content: `Given this original summary:
      ${originalSummary}
      
      Rank these search results by relevance (0-10):
      ${JSON.stringify(results, null, 2)}
      
      Return only a JSON array of numbers representing the relevance scores.`
    }]
  });

  const content = response.content[0];
  if (!content || typeof content !== 'object' || !('type' in content) || content.type !== 'text' || typeof content.text !== 'string') {
    throw new Error('Unexpected response format from Claude');
  }

  const relevanceScores = JSON.parse(content.text) as number[];
  
  // Combine original and AI-generated relevance scores
  const rankedResults = results.map((result, index) => ({
    ...result,
    relevanceScore: (result.relevanceScore + relevanceScores[index]) / 2
  }));

  // Sort by combined relevance score
  return rankedResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
} 