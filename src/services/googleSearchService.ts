interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

const buildSearchQuery = (keywords: string, type: 'book' | 'video' | 'article' | 'academic') => {
  const baseQuery = keywords;
  let refinements = '';
  let siteFilters = '';
  let customParams = '';

  switch (type) {
    case 'book':
      refinements = ' (book OR novel OR publication)';
      siteFilters = ' site:goodreads.com OR site:amazon.com/books';
      customParams = '&tbm=bks';
      break;
    case 'video':
      refinements = ' (video OR lecture OR tutorial)';
      siteFilters = ' site:youtube.com OR site:coursera.org OR site:udemy.com';
      customParams = '&tbm=vid';
      break;
    case 'article':
      refinements = ' (article OR blog OR news)';
      siteFilters = ' site:medium.com OR site:dev.to OR site:hackernoon.com';
      customParams = '&tbm=nws';
      break;
    case 'academic':
      refinements = ' (research OR paper OR study)';
      siteFilters = ' site:scholar.google.com OR site:arxiv.org OR site:researchgate.net';
      customParams = '&tbm=sch';
      break;
  }

  return {
    query: `${baseQuery}${refinements}${siteFilters}`,
    params: customParams
  };
};

export const findRelatedContent = async (
  keywords: string,
  type: 'book' | 'video' | 'article' | 'academic' = 'article'
): Promise<SearchResult[]> => {
  try {
    const { query, params } = buildSearchQuery(keywords, type);
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        params,
        type
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Search API error:', errorData);
      throw new Error(errorData.message || 'Failed to fetch related content');
    }

    const data = await response.json();
    
    if (!data.items || !Array.isArray(data.items)) {
      console.warn('No search results found');
      return [];
    }

    return data.items.map((item: any) => ({
      title: item.title || 'Untitled',
      link: item.link,
      snippet: item.snippet || item.title || 'No description available',
    }));
  } catch (error) {
    console.error('Error finding related content:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to find related content');
  }
}; 