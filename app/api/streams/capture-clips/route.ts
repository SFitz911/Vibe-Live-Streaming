import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const formData = await request.formData();
    const streamId = formData.get('streamId') as string;
    const clip30s = formData.get('clip30s') as File | null;
    const clip12s = formData.get('clip12s') as File | null;
    const thumbnail = formData.get('thumbnail') as File | null;

    if (!streamId) {
      return NextResponse.json(
        { error: 'streamId is required' },
        { status: 400 }
      );
    }

    const results: any = {
      streamId,
      video_30s_url: null,
      video_12s_url: null,
      thumbnail_frozen_url: null,
      video_30s_size_kb: null,
      video_12s_size_kb: null,
      thumbnail_frozen_size_kb: null,
    };

    // Upload 30-second clip
    if (clip30s) {
      const fileName30s = `stream-${streamId}-30s.webm`;
      const { data: upload30s, error: error30s } = await supabase.storage
        .from('live-events')
        .upload(`previews-30s/${fileName30s}`, clip30s, {
          contentType: 'video/webm',
          cacheControl: '3600',
          upsert: true
        });

      if (error30s) {
        console.error('Error uploading 30s clip:', error30s);
      } else {
        const { data: urlData } = supabase.storage
          .from('live-events')
          .getPublicUrl(`previews-30s/${fileName30s}`);
        
        results.video_30s_url = urlData.publicUrl;
        results.video_30s_size_kb = Math.round(clip30s.size / 1024);
        console.log('✅ 30s clip uploaded:', results.video_30s_url);
      }
    }

    // Upload 12-second clip
    if (clip12s) {
      const fileName12s = `stream-${streamId}-12s.webm`;
      const { data: upload12s, error: error12s } = await supabase.storage
        .from('live-events')
        .upload(`previews-12s/${fileName12s}`, clip12s, {
          contentType: 'video/webm',
          cacheControl: '3600',
          upsert: true
        });

      if (error12s) {
        console.error('Error uploading 12s clip:', error12s);
      } else {
        const { data: urlData } = supabase.storage
          .from('live-events')
          .getPublicUrl(`previews-12s/${fileName12s}`);
        
        results.video_12s_url = urlData.publicUrl;
        results.video_12s_size_kb = Math.round(clip12s.size / 1024);
        console.log('✅ 12s clip uploaded:', results.video_12s_url);
      }
    }

    // Upload frozen thumbnail
    if (thumbnail) {
      const fileNameThumb = `stream-${streamId}-thumb.jpg`;
      const { data: uploadThumb, error: errorThumb } = await supabase.storage
        .from('live-events')
        .upload(`thumbnails-frozen/${fileNameThumb}`, thumbnail, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: true
        });

      if (errorThumb) {
        console.error('Error uploading thumbnail:', errorThumb);
      } else {
        const { data: urlData } = supabase.storage
          .from('live-events')
          .getPublicUrl(`thumbnails-frozen/${fileNameThumb}`);
        
        results.thumbnail_frozen_url = urlData.publicUrl;
        results.thumbnail_frozen_size_kb = Math.round(thumbnail.size / 1024);
        console.log('✅ Thumbnail uploaded:', results.thumbnail_frozen_url);
      }
    }

    // Update stream record with clip URLs and sizes
    const { error: updateError } = await supabase
      .from('streams')
      .update({
        source_type: 'live_event',
        video_30s_url: results.video_30s_url,
        video_30s_size_kb: results.video_30s_size_kb,
        video_12s_url: results.video_12s_url,
        video_12s_size_kb: results.video_12s_size_kb,
        thumbnail_frozen_url: results.thumbnail_frozen_url,
        thumbnail_frozen_size_kb: results.thumbnail_frozen_size_kb,
        clips_captured_at: new Date().toISOString(),
      })
      .eq('id', streamId);

    if (updateError) {
      console.error('Error updating stream record:', updateError);
      return NextResponse.json(
        { error: 'Failed to update stream record', details: updateError },
        { status: 500 }
      );
    }

    console.log('✅ Stream record updated with clip URLs');

    return NextResponse.json({
      success: true,
      message: 'Clips captured and uploaded successfully',
      ...results
    });

  } catch (error) {
    console.error('Error in capture-clips API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}

