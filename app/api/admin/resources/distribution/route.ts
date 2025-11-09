import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Fetch all streams with their metadata
    const { data: streams, error } = await supabase
      .from('streams')
      .select('id, source_type, category, is_live, recently_live_until, created_at');

    if (error) {
      console.error('Error fetching streams:', error);
      return NextResponse.json(
        { error: 'Failed to fetch streams' },
        { status: 500 }
      );
    }

    const now = new Date().toISOString();

    // Count by source type
    const youtubeStreams = streams.filter(s => s.source_type === 'youtube').length;
    const liveEventStreams = streams.filter(s => s.source_type === 'live_event').length;

    // Count currently live streams
    const currentlyLive = streams.filter(s => 
      s.is_live === true || 
      (s.recently_live_until && s.recently_live_until >= now)
    ).length;

    // Count by category
    const categories: { [key: string]: number } = {};
    streams.forEach(stream => {
      const cat = stream.category || 'Uncategorized';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    // Page distribution
    const liveOrRecentlyLive = streams.filter(s => 
      s.is_live === true || 
      (s.recently_live_until && s.recently_live_until >= now)
    );

    const recorded = streams.filter(s => s.is_live === false);

    const distribution = {
      total: streams.length,
      youtube: youtubeStreams,
      liveEvents: liveEventStreams,
      currentlyLive: currentlyLive,
      categories: categories,
      pages: {
        discover: liveOrRecentlyLive.length, // Discover page shows live only
        homepage_live: liveOrRecentlyLive.length, // Homepage live section
        homepage_recorded: Math.min(recorded.length, 12), // Homepage shows up to 12 recorded
        recordings: recorded.length, // Recordings page shows all recorded
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(distribution);
  } catch (error) {
    console.error('Error in distribution endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

