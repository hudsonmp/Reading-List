import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    if (!process.env.GOOGLE_SEARCH_API_KEY || !process.env.GOOGLE_SEARCH_ENGINE_ID) {
      return NextResponse.json(
        { message: 'Search service configuration is missing' },
        { status: 500 }
      );
    }

    const { query, params } = await request.json();

    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${
        process.env.GOOGLE_SEARCH_API_KEY
      }&cx=${
        process.env.GOOGLE_SEARCH_ENGINE_ID
      }&q=${encodeURIComponent(query)}${params}&num=5`
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.error?.message || 'Failed to fetch search results' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 