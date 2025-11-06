import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    const defaultPassword = 'Demo2025!' // Simple default password for demo accounts

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === normalizedEmail)

    let userId: string

    if (existingUser) {
      // User exists - just return success (they'll sign in on client side)
      userId = existingUser.id
    } else {
      // Create new user with admin API
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password: defaultPassword,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          demo_account: true,
          created_via: 'demo_login'
        }
      })

      if (createError || !newUser.user) {
        console.error('Error creating demo user:', createError)
        return NextResponse.json(
          { error: 'Failed to create account' },
          { status: 500 }
        )
      }

      userId = newUser.user.id

      // Create profile for new user
      const emailPrefix = normalizedEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
      const username = emailPrefix + '_' + userId.substring(0, 6)
      const displayName = normalizedEmail.split('@')[0]

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username,
          display_name: displayName,
          is_streamer: true,
          is_verified: false,
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        // Continue anyway - profile might be created by trigger
      }
    }

    // Return success - client will sign in with the default password
    return NextResponse.json({
      success: true,
      email: normalizedEmail,
      password: defaultPassword, // Return password so client can auto-sign in
      message: 'Account ready! Signing you in...'
    }, { status: 200 })

  } catch (error) {
    console.error('Error in demo login:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

