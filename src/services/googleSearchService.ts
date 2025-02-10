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
      siteFilters = ' site:youtube.com';
      customParams = '&tbm=vid';
      break;
    case 'article':
      refinements = ' (article OR blog OR news)';
      siteFilters = ' site:medium.com OR site:dev.to';
      customParams = '&tbm=nws';
      break;
    case 'academic':
      refinements = ' (research OR paper OR study)';
      siteFilters = ' site:scholar.google.com OR site:academia.edu';
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
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${
        process.env.NEXT_PUBLIC_GOOGLE_API_KEY
      }&cx=${
        process.env.NEXT_PUBLIC_SEARCH_ENGINE_ID
      }&q=${encodeURIComponent(query)}${params}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.items.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
    }));
  } catch (error) {
    console.error('Error finding related content:', error);
    throw error;
  }
}; 