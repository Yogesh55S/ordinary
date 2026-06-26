import { NextResponse } from 'next/server';

const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const LOCATIONIQ_API_KEY = process.env.LOCATIONIQ_API_KEY || 
                           process.env.EXPO_PUBLIC_LOCATIONIQ_API_KEY || 
                           process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY;

const GOOGLE_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.nationalPhoneNumber',
  'places.internationalPhoneNumber',
  'places.websiteUri',
  'places.types',
  'places.rating',
  'places.businessStatus',
  'nextPageToken',
].join(',');

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const pagetoken = searchParams.get('pagetoken');

  if (!query && !pagetoken) {
    return NextResponse.json({ error: 'Query parameter is required.' }, { status: 400 });
  }

  // Determine provider:
  // If GOOGLE_PLACES_API_KEY is configured, default to it. Otherwise, if LOCATIONIQ_API_KEY is configured, use it.
  const useGoogle = !!PLACES_API_KEY;
  const useLocationIQ = !useGoogle && !!LOCATIONIQ_API_KEY;

  if (!useGoogle && !useLocationIQ) {
    return NextResponse.json(
      { error: 'Neither Google Places API key nor LocationIQ API key is configured. Please add one to your .env.local file.' },
      { status: 500 }
    );
  }

  if (useGoogle) {
    try {
      const body = {};
      if (pagetoken) {
        body.pageToken = pagetoken;
      } else {
        body.textQuery = query;
      }

      const res = await fetch(GOOGLE_SEARCH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': PLACES_API_KEY,
          'X-Goog-FieldMask': FIELD_MASK,
        },
        body: JSON.stringify(body),
        cache: 'no-store',
      });

      const data = await res.json();

      if (!res.ok) {
        // If Google Places fails but LocationIQ API key is configured, fallback to LocationIQ search
        if (LOCATIONIQ_API_KEY && !pagetoken) {
          console.warn('Google Places API failed, falling back to LocationIQ search...', data?.error?.message);
          return await fetchFromLocationIQ(query);
        }
        const msg = data?.error?.message || 'Unknown error from Google Places API.';
        return NextResponse.json({ error: msg }, { status: 502 });
      }

      const places = (data.places || []).map((p) => ({
        place_id: p.id,
        name: p.displayName?.text || '',
        formatted_address: p.formattedAddress || '',
        formatted_phone_number: p.nationalPhoneNumber || p.internationalPhoneNumber || null,
        website: p.websiteUri || null,
        types: p.types || [],
        rating: p.rating ?? null,
        business_status: p.businessStatus || null,
      }));

      return NextResponse.json({
        results: places,
        next_page_token: data.nextPageToken || null,
      });
    } catch (err) {
      if (LOCATIONIQ_API_KEY && !pagetoken) {
        console.warn('Google Places API fetch threw error, falling back to LocationIQ search...', err.message);
        return await fetchFromLocationIQ(query);
      }
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  } else {
    // Directly use LocationIQ
    return await fetchFromLocationIQ(query);
  }
}

async function fetchFromLocationIQ(query) {
  if (!query) {
    return NextResponse.json({ results: [], next_page_token: null });
  }

  try {
    const url = `https://us1.locationiq.com/v1/search?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(query)}&format=json&addressdetails=1&extratags=1&limit=50`;
    
    const res = await fetch(url, { cache: 'no-store' });
    
    // Handle 404 (No results found) gracefully
    if (res.status === 404) {
      return NextResponse.json({
        results: [],
        next_page_token: null,
      });
    }

    const data = await res.json();

    if (!res.ok) {
      const msg = data?.error || 'Unknown error from LocationIQ API.';
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    const places = (Array.isArray(data) ? data : []).map((p) => {
      // Map LocationIQ fields to our standard schema
      const name = p.display_place || p.display_name?.split(',')[0] || '';
      const formatted_address = p.display_name || '';
      const formatted_phone_number = p.extratags?.phone || p.extratags?.['contact:phone'] || null;
      const website = p.extratags?.website || null;
      const types = [p.class, p.type].filter(Boolean);

      return {
        place_id: p.place_id,
        name,
        formatted_address,
        formatted_phone_number,
        website,
        types,
        rating: null,
        business_status: null,
      };
    });

    return NextResponse.json({
      results: places,
      next_page_token: null,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
