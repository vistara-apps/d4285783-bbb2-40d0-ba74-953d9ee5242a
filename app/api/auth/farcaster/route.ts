import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { fid, signature, message } = await request.json();

    if (!fid || !signature || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the Farcaster signature with Neynar
    const neynarResponse = await axios.post(
      'https://api.neynar.com/v2/farcaster/user/verify',
      {
        fid,
        signature,
        message,
      },
      {
        headers: {
          'api_key': process.env.NEYNAR_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!neynarResponse.data.valid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Get user data from Neynar
    const userResponse = await axios.get(
      `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
      {
        headers: {
          'api_key': process.env.NEYNAR_API_KEY,
        },
      }
    );

    const userData = userResponse.data.users[0];
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const supabase = createRouteHandlerClient(request);
    const userId = fid.toString();

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    let user;
    if (existingUser) {
      // Update existing user
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          display_name: userData.display_name,
          bio: userData.profile?.bio?.text,
          avatar: userData.pfp_url,
          ens_name: userData.username,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
          { error: 'Failed to update user' },
          { status: 500 }
        );
      }

      user = updatedUser;
    } else {
      // Create new user
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          user_id: userId,
          display_name: userData.display_name,
          bio: userData.profile?.bio?.text,
          avatar: userData.pfp_url,
          ens_name: userData.username,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }

      user = newUser;
    }

    // Create Supabase auth session
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
    
    if (authError) {
      console.error('Error creating auth session:', authError);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user,
      session: authData.session,
      isNewUser: !existingUser,
    });

  } catch (error) {
    console.error('Farcaster auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
