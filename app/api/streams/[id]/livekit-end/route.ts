import { NextRequest, NextResponse } from 'next/server';
// import { createClient } from '@/lib/supabase';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    // In production, update the stream in the database to set is_live: false
    // For demo, just return success
    // const supabase = createClient(...)
    // await supabase.from('streams').update({ is_live: false }).eq('id', params.id)
    return NextResponse.json({ success: true, id: params.id, is_live: false });
}