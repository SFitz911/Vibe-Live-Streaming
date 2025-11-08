import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET /api/admin/settings - Get current app settings
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from('app_settings')
      .select('setting_key, setting_value')
      .eq('setting_key', 'thumbnail_mode')
      .single();

    if (error) {
      console.error('Error fetching app settings:', error);
      // Return default if not found
      return NextResponse.json({ thumbnail_mode: 'hover' });
    }

    return NextResponse.json({ 
      thumbnail_mode: data?.setting_value || 'hover' 
    });
  } catch (error) {
    console.error('Error in GET /api/admin/settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// POST /api/admin/settings - Update app settings
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const { thumbnail_mode, user_id } = body;

    // Validate thumbnail_mode
    const validModes = ['frozen', 'hover', '12s', '30s'];
    if (!validModes.includes(thumbnail_mode)) {
      return NextResponse.json(
        { error: `Invalid thumbnail_mode. Must be one of: ${validModes.join(', ')}` },
        { status: 400 }
      );
    }

    // Update or insert the setting
    const { data, error } = await supabase
      .from('app_settings')
      .upsert({
        setting_key: 'thumbnail_mode',
        setting_value: thumbnail_mode,
        updated_at: new Date().toISOString(),
        updated_by_user_id: user_id || null
      }, {
        onConflict: 'setting_key'
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating app settings:', error);
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      setting: {
        setting_key: data.setting_key,
        setting_value: data.setting_value,
        updated_at: data.updated_at
      }
    });
  } catch (error) {
    console.error('Error in POST /api/admin/settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

