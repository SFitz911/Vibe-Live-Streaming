import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET /api/admin/resources/stats - Get real-time resource usage statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get stream counts
    const { data: streams, error: streamsError } = await supabase
      .from('streams')
      .select('source_type, is_live, video_30s_size_kb, video_12s_size_kb, thumbnail_frozen_size_kb, full_video_size_mb');

    if (streamsError) {
      console.error('Error fetching streams:', streamsError);
      return NextResponse.json(
        { error: 'Failed to fetch stream data' },
        { status: 500 }
      );
    }

    // Calculate counts
    const totalStreams = streams.length;
    const youtubeStreams = streams.filter(s => s.source_type === 'youtube').length;
    const liveEventStreams = streams.filter(s => s.source_type === 'live_event').length;
    const currentlyLiveStreams = streams.filter(s => s.is_live).length;

    // Calculate storage usage (convert KB to MB)
    let youtube_thumbnails_mb = youtubeStreams * 0.1; // Estimate 100KB per thumbnail
    let live_30s_clips_mb = 0;
    let live_12s_clips_mb = 0;
    let live_frozen_thumbs_mb = 0;
    let live_full_recordings_gb = 0;

    streams.forEach(stream => {
      if (stream.source_type === 'live_event') {
        if (stream.video_30s_size_kb) {
          live_30s_clips_mb += stream.video_30s_size_kb / 1024;
        } else {
          // Estimate if no actual size stored (3.5MB average for 30s clip)
          live_30s_clips_mb += 3.5;
        }

        if (stream.video_12s_size_kb) {
          live_12s_clips_mb += stream.video_12s_size_kb / 1024;
        } else {
          // Estimate if no actual size stored (1.5MB average for 12s clip)
          live_12s_clips_mb += 1.5;
        }

        if (stream.thumbnail_frozen_size_kb) {
          live_frozen_thumbs_mb += stream.thumbnail_frozen_size_kb / 1024;
        } else {
          // Estimate if no actual size stored (100KB average for thumbnail)
          live_frozen_thumbs_mb += 0.1;
        }

        if (stream.full_video_size_mb) {
          live_full_recordings_gb += stream.full_video_size_mb / 1024;
        } else {
          // Estimate if no actual size stored (70MB average per full stream)
          live_full_recordings_gb += 0.07;
        }
      }
    });

    const total_storage_mb = youtube_thumbnails_mb + live_30s_clips_mb + live_12s_clips_mb + live_frozen_thumbs_mb + (live_full_recordings_gb * 1024);

    // Get current thumbnail mode
    const { data: settings } = await supabase
      .from('app_settings')
      .select('setting_value')
      .eq('setting_key', 'thumbnail_mode')
      .single();

    const currentMode = settings?.setting_value || 'hover';

    // Calculate bandwidth (rough estimates based on mode and views)
    // Assuming average 10 views per stream per day
    const avgViewsPerStreamPerDay = 10;
    let bandwidth_per_view_mb = 0;

    switch (currentMode) {
      case 'frozen':
        bandwidth_per_view_mb = 0.1; // Just thumbnail
        break;
      case 'hover':
        bandwidth_per_view_mb = 0.5; // Thumbnail + occasional 12s video
        break;
      case '12s':
        bandwidth_per_view_mb = 1.5; // 12s video per view
        break;
      case '30s':
        bandwidth_per_view_mb = 3.5; // 30s video per view
        break;
    }

    const bandwidth_today_gb = (totalStreams * avgViewsPerStreamPerDay * bandwidth_per_view_mb) / 1024;
    const bandwidth_month_gb = bandwidth_today_gb * 30;

    // Calculate costs (Supabase pricing)
    // Storage: $0.021/GB/month (1GB free)
    // Bandwidth: $0.09/GB (2GB/month free)
    const storage_gb = total_storage_mb / 1024;
    const storage_cost = Math.max(0, (storage_gb - 1) * 0.021);
    const bandwidth_cost = Math.max(0, (bandwidth_month_gb - 2) * 0.09);
    const estimated_monthly_cost = storage_cost + bandwidth_cost;

    // Build response
    const response = {
      timestamp: new Date().toISOString(),
      streams: {
        total: totalStreams,
        youtube: youtubeStreams,
        live_events: liveEventStreams,
        currently_live: currentlyLiveStreams
      },
      storage: {
        youtube_thumbnails_mb: Math.round(youtube_thumbnails_mb * 100) / 100,
        live_30s_clips_mb: Math.round(live_30s_clips_mb * 100) / 100,
        live_12s_clips_mb: Math.round(live_12s_clips_mb * 100) / 100,
        live_frozen_thumbs_mb: Math.round(live_frozen_thumbs_mb * 100) / 100,
        live_full_recordings_gb: Math.round(live_full_recordings_gb * 100) / 100,
        total_mb: Math.round(total_storage_mb * 100) / 100,
        total_gb: Math.round((total_storage_mb / 1024) * 100) / 100
      },
      bandwidth: {
        today_gb: Math.round(bandwidth_today_gb * 100) / 100,
        month_gb: Math.round(bandwidth_month_gb * 100) / 100,
        daily_average_gb: Math.round(bandwidth_today_gb * 100) / 100
      },
      cost: {
        current_mode: currentMode,
        estimated_monthly: Math.round(estimated_monthly_cost * 100) / 100,
        storage_cost: Math.round(storage_cost * 100) / 100,
        bandwidth_cost: Math.round(bandwidth_cost * 100) / 100
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/admin/resources/stats:', error);
    return NextResponse.json(
      { error: 'Failed to calculate resource statistics' },
      { status: 500 }
    );
  }
}

